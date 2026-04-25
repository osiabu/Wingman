'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// LUMEN INTELLIGENCE ENGINE
// ───────────────────────────────────────────────────────────────────────────
// Two engines share this file:
//
//   Lumen Intraday: 30 minute scans across the day's most tradeable
//                   instruments. Decision model Claude Sonnet 4.6 via
//                   /api/scan. Maximum three open positions.
//
//   Lumen Scalper:  60 second scans across user selected instruments,
//                   maximum five. Decision model Claude Haiku 4.5 via
//                   /api/behaviour.
//
// Weekend mode (Saturday or Sunday UTC):
//   Intraday filters the universe to crypto only.
//   Scalper raises the confidence threshold to seventy five (from sixty
//   five) and filters selected instruments to crypto only when warning
//   the operator about thin liquidity.
//
// Server side fallback:
//   /api/scan: Claude (model from body) → Gemini 2.5 Flash
//   /api/behaviour: Claude Haiku 4.5 → Gemini 2.5 Flash
//   /api/sentiment: Grok 3 → Claude Haiku 4.5 → Gemini 2.5 Flash
//   Each Vercel route handles model fallback internally so the engines
//   stay alive even when one provider is unavailable.
//
// Price and candle data:
//   Crypto prices arrive on a Binance WebSocket. Forex and metals arrive
//   on a Deriv WebSocket. Indices and commodities use the cached Vercel
//   /api/prices route. Candles are fetched through the existing
//   fetchCandles helper in prices.js, which routes crypto to Binance REST
//   and everything else to /api/candles with Upstash Redis caching.
// ═══════════════════════════════════════════════════════════════════════════

// ── INTRADAY STATE ───────────────────────────────────────────────────────────
var atAccount   = JSON.parse(localStorage.getItem('wm_at_account')   || 'null') || { balance: 100000, startBalance: 100000 };
var atPositions = JSON.parse(localStorage.getItem('wm_at_positions') || '[]');
var atHistory   = JSON.parse(localStorage.getItem('wm_at_history')   || '[]');
var atLog       = JSON.parse(localStorage.getItem('wm_at_log')       || '[]');

var atEngineRunning   = false;
var atScanTimer       = null;
var atUiTimer         = null;
var atBinanceWs       = null;
var atCurrentPrice    = null;
var atPrevClose       = null;
var atCurrentInst     = 'BTCUSD';
var atLastScanTime    = null;
var atTodayInstruments = null;
var atSelectionDay    = null;
var scalpLastScanTime = null;
var scalpUiTimer      = null;

// ── INSTRUMENT UNIVERSE FOR INTRADAY ────────────────────────────────────────
var INTRADAY_CRYPTO_UNIVERSE = ['BTCUSD','ETHUSD','SOLUSD','XRPUSD','BNBUSD','ADAUSD','LINKUSD'];
var INTRADAY_FULL_UNIVERSE = [
  'BTCUSD','ETHUSD','SOLUSD',
  'XAUUSD','XAGUSD',
  'EURUSD','GBPUSD','USDJPY','GBPJPY',
  'SPX500','NAS100','US30',
  'USOIL'
];

// ── SHARED CONTEXT ──────────────────────────────────────────────────────────
var wm_context = {
  sentiment: { reading: 'neutral', score: 50, source: 'initial', updatedAt: null, headlines: [], trump_signal: null },
  recentSignals: [],
  openPositions: []
};

// ── DAILY BUDGET TRACKER ────────────────────────────────────────────────────
// Caps Lumen calls per layer per UTC day. Server endpoints already handle
// model fallback, so this only protects the operator from runaway spend.
var lumBudget = {
  calls: JSON.parse(localStorage.getItem('wm_lum_budget') || 'null') || {
    intraday: 0, scalper: 0, sentiment: 0, select: 0
  },
  limits: { intraday: 200, scalper: 1500, sentiment: 300, select: 30 },
  resetDay: localStorage.getItem('wm_lum_budget_day') || String(new Date().getUTCDate()),

  checkAndConsume: function (key) {
    this._maybeReset();
    if (this.calls[key] >= this.limits[key]) return false;
    this.calls[key]++;
    localStorage.setItem('wm_lum_budget', JSON.stringify(this.calls));
    return true;
  },

  _maybeReset: function () {
    var today = String(new Date().getUTCDate());
    if (today !== this.resetDay) {
      this.calls = { intraday: 0, scalper: 0, sentiment: 0, select: 0 };
      this.resetDay = today;
      localStorage.setItem('wm_lum_budget', JSON.stringify(this.calls));
      localStorage.setItem('wm_lum_budget_day', today);
    }
  }
};

// ── SYSTEM PROMPTS ──────────────────────────────────────────────────────────
const INTRADAY_SELECT_SYSTEM = 'You are Lumen, a market intelligence engine. Given current market sentiment and a candidate list of instruments, pick the three most tradeable instruments for today. Consider volatility, news catalysts, session liquidity, and weekend market closures. Return ONLY valid JSON. No prose. No hyphens. Output format: {"selected": ["INST1","INST2","INST3"], "rationale": "string under one hundred and twenty characters"}.';

const WINGMAN_MASTER_SYSTEM = [
  'You are Lumen, the Wingman intelligence engine, built by Aperintel.',
  'You reason about markets with the discipline of an institutional trader who has',
  'mastered the Wyckoff Method, understands institutional order flow, and reads the',
  'relationship between macro forces and price action.',
  '',
  'You are not a signal generator. You are a reasoning engine. Every output you',
  'produce must be traceable to the evidence you were given. You never fabricate',
  'confidence. If evidence is mixed, you say so and skip the trade.',
  '',
  'You will receive a structured intelligence payload covering: Wyckoff phase,',
  'market regime, COT positioning, real yields, sentiment, liquidity pools,',
  'session context, calendar pre and post event flags, and portfolio exposure.',
  '',
  'You return only valid JSON. No prose outside JSON. No hyphens. Output format:',
  '{',
  '  "action": "BUY" or "SELL" or "SKIP",',
  '  "confidence": integer zero to one hundred,',
  '  "lots": decimal,',
  '  "sl": decimal or null,',
  '  "tp": decimal or null,',
  '  "reason": "one short sentence under one hundred and twenty characters",',
  '  "key_risk": "string under sixty characters",',
  '  "thesis_alignment": "aligned" or "neutral" or "contradictory",',
  '  "wyckoff_alignment": "aligned" or "neutral" or "contradictory",',
  '  "skip_reason": "string under eighty characters only when SKIP"',
  '}',
  '',
  'Decision rules:',
  '1. Skip if the Wyckoff phase contradicts the proposed direction (e.g. SELL during a confirmed Markup).',
  '2. Skip if pre_event_caution is true and the trade cannot reasonably close before the event.',
  '3. Reduce confidence by twenty when post_event_opportunity is true and the deviation conflicts with your direction.',
  '4. Skip when liquidity above and below are very tight and the regime is Compression: wait for the break.',
  '5. Stop loss minimum one ATR from entry. Take profit minimum 1.5R.',
  '6. When portfolio.correlated_clusters is non empty, only proceed if your trade reduces or hedges existing exposure.',
  '7. Prefer no trade over a forced signal. Patience is intelligence.'
].join('\n');

const WINGMAN_SCALP_SYSTEM = [
  'You are Lumen, the Wingman intelligence engine. You return scalp signals on a sixty second cadence.',
  'Use the structural intelligence you are given (Wyckoff phase, regime, session, calendar, liquidity)',
  'to filter the live technical setup. Do not invent context not in the payload.',
  '',
  'Return only valid JSON. No prose outside JSON. No hyphens. Output format:',
  '{',
  '  "action": "BUY" or "SELL" or "SKIP",',
  '  "confidence": integer zero to one hundred,',
  '  "lots": decimal,',
  '  "sl": decimal or null,',
  '  "tp": decimal or null,',
  '  "grade": "A" or "B" or "C",',
  '  "entry_logic": "string under eighty characters",',
  '  "key_risk": "string under sixty characters",',
  '  "skip_reason": "string under eighty characters only when SKIP"',
  '}',
  '',
  'Tier framework: Tier 1 structure (trend, S/R, EMA50), Tier 2 momentum (RSI, EMA20 vs EMA50),',
  'Tier 3 context (session, sentiment, calendar). Grade A all three tiers, Grade B two tiers, Grade C one.',
  'Skip if pre_event_caution is true. Skip if liquidity above and below are tight and regime is Compression.',
  'Skip if the Wyckoff phase contradicts the direction. Reduce confidence by ten in Asian session.'
].join('\n');

const SENTIMENT_PROMPT = 'Analyse current global market sentiment from news in the last thirty minutes affecting major forex pairs, crypto, gold, indices, and commodities. Return valid JSON only with keys: reading (bullish, bearish, or neutral), score (zero to one hundred), headlines (array of up to five short strings), trump_signal (positive, negative, or null). No hyphens. No prose outside JSON.';

// ── SENTIMENT POLLER ────────────────────────────────────────────────────────
var lumSentiment = {
  timer: null,
  poll: async function () {
    if (!lumBudget.checkAndConsume('sentiment')) return;
    try {
      var res = await fetch('/api/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: SENTIMENT_PROMPT })
      });
      if (!res.ok) return;
      var data = await res.json();
      if (data && data.reading) {
        wm_context.sentiment = {
          reading: data.reading,
          score: typeof data.score === 'number' ? data.score : 50,
          headlines: Array.isArray(data.headlines) ? data.headlines : [],
          trump_signal: data.trump_signal || null,
          source: '/api/sentiment',
          updatedAt: new Date().toISOString()
        };
      }
    } catch (_) { /* keep last known sentiment */ }
  },
  start: function () {
    var self = this;
    self.poll();
    self.timer = setInterval(function () {
      if (document.visibilityState !== 'hidden') self.poll();
    }, 5 * 60 * 1000);
  },
  stop: function () { clearInterval(this.timer); this.timer = null; }
};

// ═══════════════════════════════════════════════════════════════════════════
// INTRADAY ENGINE
// ═══════════════════════════════════════════════════════════════════════════

// Pick the day's three target instruments. Cached per UTC day so the LLM is
// only called once. Falls back to a sensible default list when the call fails
// or the daily budget is exhausted.
async function intradaySelectInstruments() {
  var today = String(new Date().getUTCDate());
  if (atTodayInstruments && atSelectionDay === today) return atTodayInstruments;

  var weekend = isWeekend();
  var universe = weekend ? INTRADAY_CRYPTO_UNIVERSE : INTRADAY_FULL_UNIVERSE;
  var fallback = weekend ? ['BTCUSD','ETHUSD','SOLUSD'] : ['BTCUSD','XAUUSD','SPX500'];

  if (!lumBudget.checkAndConsume('select')) {
    atTodayInstruments = fallback;
    atSelectionDay = today;
    atAddLog('scan', 'Lumen pick (budget defaults): ' + fallback.join(', ') + '.');
    return fallback;
  }

  var prompt = 'Sentiment: ' + wm_context.sentiment.reading + ' at ' + wm_context.sentiment.score + '. '
    + 'Trump signal: ' + (wm_context.sentiment.trump_signal || 'none') + '. '
    + 'Weekend: ' + weekend + '. '
    + 'Candidate universe: ' + universe.join(', ') + '. '
    + 'Pick three.';

  try {
    var r = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        system: INTRADAY_SELECT_SYSTEM,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    if (!r.ok) throw new Error('select status ' + r.status);
    var d = await r.json();
    var text = d && d.content && d.content[0] && d.content[0].text;
    var parsed = safeParseJSON(text);
    var picks = parsed && Array.isArray(parsed.selected) ? parsed.selected : null;
    if (picks) {
      picks = picks.filter(function (p) { return universe.indexOf(p) >= 0; }).slice(0, 3);
      if (picks.length > 0) {
        atTodayInstruments = picks;
        atSelectionDay = today;
        var note = parsed.rationale ? ' ' + parsed.rationale : '';
        atAddLog('scan', 'Lumen pick: ' + picks.join(', ') + '.' + note);
        return picks;
      }
    }
    throw new Error('selection returned no usable picks');
  } catch (e) {
    atTodayInstruments = fallback;
    atSelectionDay = today;
    atAddLog('scan', 'Lumen pick (fallback after ' + (e.message || 'error') + '): ' + fallback.join(', ') + '.');
    return fallback;
  }
}

// ── INTEL PAYLOAD ASSEMBLY ──────────────────────────────────────────────────
// Maps an instrument code to the asset key used by the COT module. Returns
// null when no COT contract is available for the instrument.
function lumenCotAssetFor(inst) {
  var map = {
    XAUUSD: 'gold', XAGUSD: 'silver', XCUUSD: 'copper',
    USOIL: 'oil', UKOIL: 'oil', NATGAS: 'natgas',
    EURUSD: 'eurusd', GBPUSD: 'gbpusd', USDJPY: 'jpyusd',
    USDCHF: 'chfusd', USDCAD: 'cadusd',
    AUDUSD: 'audusd', NZDUSD: 'nzdusd',
    BTCUSD: 'btc', ETHUSD: 'ether'
  };
  return map[inst] || null;
}

// Builds the full intelligence payload Lumen Intraday sends to Sonnet.
// All upstream module calls are bounded by their own caches so this assembly
// does not multiply LLM cost on the master synthesis path. Fields that are
// unavailable degrade gracefully to null or 'unavailable'.
async function assembleIntradayIntel(inst, indicators) {
  var II = (typeof window !== 'undefined' && window.LumenIntel) || {};
  var cotAsset = lumenCotAssetFor(inst);

  var calls = [];
  // Wyckoff and regime are async (may trigger LLM); call them.
  if (typeof II.wyckoff === 'function') calls.push(II.wyckoff(inst).catch(function () { return null; }));
  else calls.push(Promise.resolve(null));
  if (typeof II.regime === 'function')  calls.push(II.regime(inst).catch(function () { return null; }));
  else calls.push(Promise.resolve(null));
  if (typeof II.yields === 'function')  calls.push(II.yields().catch(function () { return null; }));
  else calls.push(Promise.resolve(null));
  if (typeof II.cot === 'function' && cotAsset) calls.push(II.cot(cotAsset).catch(function () { return null; }));
  else calls.push(Promise.resolve(null));
  if (typeof II.liquidity === 'function') calls.push(II.liquidity(inst).catch(function () { return null; }));
  else calls.push(Promise.resolve(null));
  if (typeof II.calendar === 'function') calls.push(II.calendar(inst).catch(function () { return null; }));
  else calls.push(Promise.resolve(null));

  var resolved = await Promise.all(calls);
  var session = (typeof II.session === 'function') ? II.session() : null;
  var portfolio = (typeof II.portfolio === 'function') ? II.portfolio() : null;

  return {
    instrument: inst,
    timestamp: new Date().toISOString(),
    indicators: indicators,
    sentiment: wm_context.sentiment,
    wyckoff: resolved[0],
    regime: resolved[1],
    real_yields: resolved[2],
    cot: resolved[3],
    liquidity: resolved[4],
    calendar: resolved[5],
    session: session,
    portfolio: portfolio
  };
}

// Builds a slimmer payload for the Lumen Scalper. Reads cached intel ONLY,
// never triggers a fresh LLM call. The scalper runs every sixty seconds and
// must not amplify the daily Sonnet budget.
function assembleScalperIntel(inst, livePrice, indicators) {
  var II = (typeof window !== 'undefined' && window.LumenIntel) || {};
  var wyckoff = (II.wyckoff && II.wyckoff.cached) ? II.wyckoff.cached(inst) : null;
  var regime  = (II.regime  && II.regime.cached)  ? II.regime.cached(inst)  : null;
  var liquidity = (II.liquidity && II.liquidity.cached) ? II.liquidity.cached(inst) : null;
  var calendar  = (II.calendar  && II.calendar.cached)  ? II.calendar.cached() : null;
  var session = (typeof II.session === 'function') ? II.session() : null;

  return {
    instrument: inst,
    price: livePrice,
    indicators: indicators,
    sentiment: wm_context.sentiment,
    wyckoff: wyckoff,
    regime: regime,
    liquidity_above: liquidity ? liquidity.liquidity_above : null,
    liquidity_below: liquidity ? liquidity.liquidity_below : null,
    pre_event_caution: !!(calendar && calendar.pre_event_caution),
    post_event_opportunity: !!(calendar && calendar.post_event_opportunity),
    next_event: calendar ? calendar.next_event : null,
    session: session,
    weekend: isWeekend()
  };
}

// Hard local gate: reject signals when the portfolio is at risk OR when a
// new position would create or worsen a correlated cluster. Returns
// { allowed: bool, reason: string }.
function lumenPortfolioGate(inst, direction, portfolio) {
  if (!portfolio || !portfolio.open_positions) return { allowed: true, reason: '' };
  if (portfolio.total_risk_percentage > 6) {
    return { allowed: false, reason: 'portfolio total risk above six percent' };
  }
  // Reject duplicate same direction trades on the same instrument across
  // any source (Lumen Intraday, Lumen Scalper, Sim Trader).
  var dup = portfolio.open_positions.find(function (p) {
    return p.instrument === inst && p.direction === direction;
  });
  if (dup) {
    return { allowed: false, reason: 'open ' + direction + ' on ' + inst + ' already exists in ' + dup.source };
  }
  return { allowed: true, reason: '' };
}

// Apply the session multiplier locally so the LLM cannot bypass it. The
// multiplier scales the LLM's confidence into an effective confidence
// before it is compared against the threshold.
function applySessionMultiplier(rawConfidence, session) {
  if (!session) return rawConfidence;
  var m = typeof session.signal_confidence_multiplier === 'number'
    ? session.signal_confidence_multiplier : 1.0;
  return Math.max(0, Math.min(100, Math.round(rawConfidence * m)));
}

// Ask Sonnet for a BUY, SELL, or SKIP signal given the assembled intel
// payload. Returns { ok: true, signal } when the LLM responded with valid
// JSON, or { ok: false, reason } when anything in the call chain failed.
// The reason string is surfaced in the activity log so transient upstream
// errors are visible rather than collapsed into "decision call failed".
async function intradayDecide(inst, intel) {
  if (!lumBudget.checkAndConsume('intraday')) {
    return { ok: false, reason: 'daily intraday budget cap reached' };
  }
  var r;
  try {
    r = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        system: WINGMAN_MASTER_SYSTEM,
        messages: [{ role: 'user', content: JSON.stringify(intel) }]
      })
    });
  } catch (e) {
    return { ok: false, reason: 'network error: ' + (e && e.message ? e.message : 'unknown') };
  }
  if (!r.ok) {
    var bodyText = '';
    try { bodyText = await r.text(); } catch (_) {}
    var snippet = bodyText ? bodyText.slice(0, 140).replace(/\s+/g, ' ') : '';
    return { ok: false, reason: 'upstream status ' + r.status + (snippet ? '. ' + snippet : '') };
  }
  var d;
  try { d = await r.json(); }
  catch (e) { return { ok: false, reason: 'response not JSON: ' + (e && e.message ? e.message : 'parse error') }; }
  var text = d && d.content && d.content[0] && d.content[0].text;
  if (!text) return { ok: false, reason: 'empty response from intelligence engine' };
  var parsed = safeParseJSON(text);
  if (!parsed) return { ok: false, reason: 'engine response was not valid JSON' };
  return { ok: true, signal: parsed };
}

// Intraday scan loop: pick the day's instruments, fetch real indicators,
// score each, execute the strongest signal at or above seventy five
// confidence. At most three open positions.
async function atRunScan() {
  if (!atEngineRunning) return;
  atLastScanTime = Date.now();

  var instruments = await intradaySelectInstruments();
  if (!instruments || instruments.length === 0) {
    atAddLog('skip', 'Lumen Intraday: no tradeable instruments selected.');
    return;
  }

  var weekend = isWeekend();
  atAddLog('scan', 'Lumen Intraday scan started. ' + (weekend ? 'Weekend, crypto only. ' : '') + 'Universe: ' + instruments.join(', ') + '.');

  var bestSignal = null;
  for (var i = 0; i < instruments.length; i++) {
    var inst = instruments[i];

    var indicators = await lumenIndicators(inst);
    if (!indicators) {
      atAddLog('skip', 'Lumen Intraday: ' + inst + ' indicators unavailable.');
      continue;
    }

    var intel = await assembleIntradayIntel(inst, indicators);

    // Pre event hard skip: do not enter new positions in the two hour
    // window before a high impact release on this instrument.
    if (intel && intel.calendar && intel.calendar.pre_event_caution) {
      atAddLog('skip', 'Lumen Intraday: ' + inst + ' pre event caution. '
        + (intel.calendar.next_event ? intel.calendar.next_event.event_name : 'high impact event imminent'));
      continue;
    }

    var decision = await intradayDecide(inst, intel);
    if (!decision || !decision.ok) {
      var failReason = decision && decision.reason ? decision.reason : 'unknown error';
      atAddLog('skip', 'Lumen Intraday: ' + inst + ' decision call failed. ' + failReason + '.');
      continue;
    }
    var signal = decision.signal;

    if (signal.action === 'SKIP') {
      atAddLog('skip', 'Lumen Intraday: ' + inst + ' skip. ' + (signal.skip_reason || signal.reason || 'no setup'));
      continue;
    }

    if (signal.action !== 'BUY' && signal.action !== 'SELL') {
      atAddLog('skip', 'Lumen Intraday: ' + inst + ' returned invalid action ' + signal.action + '.');
      continue;
    }

    // Portfolio gate before considering as best signal.
    var gate = lumenPortfolioGate(inst, signal.action, intel ? intel.portfolio : null);
    if (!gate.allowed) {
      atAddLog('skip', 'Lumen Intraday: ' + inst + ' ' + signal.action + ' blocked. ' + gate.reason + '.');
      continue;
    }

    // Apply session multiplier locally to the LLM's stated confidence.
    var rawConf = typeof signal.confidence === 'number' ? signal.confidence : 0;
    var conf = applySessionMultiplier(rawConf, intel ? intel.session : null);
    var sessionLabel = intel && intel.session ? intel.session.primary_session : 'unknown';

    atAddLog('scan', 'Lumen Intraday: ' + inst + ' ' + signal.action
      + ' raw ' + rawConf + ', effective ' + conf + ' (' + sessionLabel + '). '
      + (signal.reason || ''));

    if (conf >= 75) {
      if (!bestSignal || conf > bestSignal.confidence) {
        bestSignal = {
          action: signal.action,
          confidence: conf,
          rawConfidence: rawConf,
          sl: signal.sl,
          tp: signal.tp,
          reason: signal.reason || '',
          key_risk: signal.key_risk || '',
          instrument: inst,
          price: indicators.price,
          intel: intel,
          thesis_alignment: signal.thesis_alignment || null,
          wyckoff_alignment: signal.wyckoff_alignment || null
        };
      }
    }
  }

  if (atPositions.length >= 3) {
    atAddLog('skip', 'Lumen Intraday: maximum three open positions reached, holding off.');
    return;
  }
  if (!bestSignal) {
    atAddLog('skip', 'Lumen Intraday: no instrument cleared the seventy five confidence threshold this cycle.');
    return;
  }
  atExecuteTrade(bestSignal.action, bestSignal.sl, bestSignal.tp, bestSignal.reason,
                 bestSignal.instrument, bestSignal.price, bestSignal);
}

// ── INTRADAY ENGINE LIFECYCLE ───────────────────────────────────────────────
function atStartEngine() {
  if (atEngineRunning) return;
  atEngineRunning = true;
  var badge = document.getElementById('at-engine-badge');
  var label = document.getElementById('at-engine-label');
  var dot   = document.getElementById('at-pulse-dot');
  if (badge) { badge.classList.remove('idle'); badge.classList.add('active'); }
  if (label) label.textContent = 'INTRADAY ACTIVE';
  if (dot)   { dot.style.background = 'var(--teal)'; dot.style.animation = ''; }
  var startBtn = document.getElementById('at-start-btn');
  var stopBtn  = document.getElementById('at-stop-btn');
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn)  stopBtn.style.display  = '';
  var cdEl = document.getElementById('at-countdown');
  if (cdEl) cdEl.style.display = '';
  atAddLog('scan', 'Lumen Intraday active.' + (isWeekend() ? ' Weekend mode, crypto only.' : ''));
  lumSentiment.start();
  clearInterval(atScanTimer);
  atScanTimer = setInterval(function () { if (document.visibilityState !== 'hidden') atRunScan(); }, 30 * 60 * 1000);
  clearInterval(atUiTimer);
  atUiTimer = setInterval(function () {
    if (document.visibilityState !== 'hidden') {
      atUpdatePriceDisplay(); atUpdateAccount(); atUpdateCountdown();
    }
  }, 2000);
  atRunScan();
}

function atStopEngine() {
  if (!atEngineRunning) return;
  atEngineRunning = false;
  var badge = document.getElementById('at-engine-badge');
  var label = document.getElementById('at-engine-label');
  var dot   = document.getElementById('at-pulse-dot');
  if (badge) { badge.classList.remove('active'); badge.classList.add('idle'); }
  if (label) label.textContent = 'INTRADAY IDLE';
  if (dot)   dot.style.background = 'var(--gold)';
  var startBtn = document.getElementById('at-start-btn');
  var stopBtn  = document.getElementById('at-stop-btn');
  if (startBtn) startBtn.style.display = '';
  if (stopBtn)  stopBtn.style.display  = 'none';
  var cdEl = document.getElementById('at-countdown');
  if (cdEl) { cdEl.style.display = 'none'; cdEl.textContent = 'next: —'; }
  atLastScanTime = null;
  clearInterval(atScanTimer); atScanTimer = null;
  clearInterval(atUiTimer);   atUiTimer   = null;
  // Stop sentiment polling only if no scalp engine is also running.
  if (typeof scalpEngineRunning !== 'undefined' && !scalpEngineRunning) lumSentiment.stop();
  atAddLog('scan', 'Lumen Intraday stopped.');
}

// ── WS STATUS DOT ───────────────────────────────────────────────────────────
function atSetWsDot(state) {
  var dot = document.getElementById('at-ws-dot');
  var lbl = document.getElementById('at-ws-label');
  if (!dot) return;
  dot.className = 'ws-dot ' + state;
  if (lbl) {
    lbl.textContent = state === 'connected' ? 'LIVE' : state === 'reconnecting' ? 'CONNECTING' : 'OFFLINE';
    lbl.style.color  = state === 'connected' ? 'var(--green)' : state === 'reconnecting' ? 'var(--gold)' : 'var(--red)';
  }
}

// ── BINANCE WEBSOCKET (chart price display only) ────────────────────────────
function atInitBinanceWs() {
  if (atBinanceWs) atBinanceWs.close();
  atSetWsDot('reconnecting');
  atBinanceWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
  atBinanceWs.onopen = function () { atSetWsDot('connected'); };
  atBinanceWs.onmessage = function (e) {
    var data = JSON.parse(e.data);
    atPrevClose = atCurrentPrice;
    atCurrentPrice = parseFloat(data.c);
  };
  atBinanceWs.onerror = function () { atSetWsDot('disconnected'); };
  atBinanceWs.onclose = function () {
    atSetWsDot('disconnected');
    setTimeout(atInitBinanceWs, 5000);
  };
}

// ── UI HELPERS ──────────────────────────────────────────────────────────────
function atUpdatePriceDisplay() {
  var priceEl = document.getElementById('at-current-price');
  if (priceEl && atCurrentPrice) {
    priceEl.textContent = atCurrentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (atPrevClose) {
      priceEl.style.color = atCurrentPrice >= atPrevClose ? 'var(--green)' : 'var(--red)';
    }
  }
}

function atUpdateCountdown() {
  var el = document.getElementById('at-countdown');
  if (!el) return;
  if (!atEngineRunning || !atLastScanTime) { el.textContent = 'next: —'; return; }
  var elapsed = Date.now() - atLastScanTime;
  var remaining = Math.max(0, 30 * 60 * 1000 - elapsed);
  var mm = String(Math.floor(remaining / 60000)).padStart(2, '0');
  var ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
  el.textContent = 'next: ' + mm + ':' + ss;
}

function scalpUpdateCountdown() {
  var el = document.getElementById('scalp-countdown');
  if (!el) return;
  if (!scalpEngineRunning || !scalpLastScanTime) { el.textContent = 'next: —'; return; }
  var elapsed = Date.now() - scalpLastScanTime;
  var remaining = Math.max(0, 60 * 1000 - elapsed);
  var ss = String(Math.floor(remaining / 1000)).padStart(2, '0');
  el.textContent = 'next: 00:' + ss;
}

function atUpdateAccount() {
  var balEl = document.getElementById('at-balance');
  if (balEl) balEl.textContent = atAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

// ── LOGGING & EXECUTION ─────────────────────────────────────────────────────
function atAddLog(type, msg) {
  var entry = { id: Date.now(), type: type, msg: msg, time: new Date().toLocaleTimeString() };
  atLog.unshift(entry);
  if (atLog.length > 100) atLog = atLog.slice(0, 100);
  localStorage.setItem('wm_at_log', JSON.stringify(atLog));
  atRenderLog();
}

function atRenderLog() {
  var container = document.getElementById('at-log-entries');
  if (!container) return;
  if (!atLog.length) {
    container.innerHTML = '<div class="empty" style="padding:20px 0;"><div class="empty-text" style="font-size:10px;">Intraday activity will appear here</div></div>';
    return;
  }
  container.innerHTML = atLog.map(function (l) {
    var color = l.type === 'trade' ? 'var(--gold)' : l.type === 'skip' ? 'var(--text3)' : 'var(--teal)';
    return '<div style="display:flex;gap:10px;font-size:11px;margin-bottom:6px;border-bottom:1px solid var(--border2);padding-bottom:4px;">'
      + '<span style="color:var(--text4);flex-shrink:0;">' + l.time + '</span>'
      + '<span style="color:' + color + ';">' + l.msg + '</span></div>';
  }).join('');
}

function atExecuteTrade(dir, sl, tp, reason, instrument, entryPrice, signalCtx) {
  var lotSize = 5;
  var pair = instrument || atCurrentInst || 'BTCUSD';
  var entry = entryPrice || atCurrentPrice;
  if (!entry) {
    atAddLog('skip', 'Lumen Intraday: ' + pair + ' execution skipped, no live price available.');
    return;
  }
  var ctx = signalCtx || {};
  var intel = ctx.intel || {};
  var pos = {
    id: Date.now(),
    pair: pair,
    instrument: pair,
    dir: dir,
    entry: entry,
    sl: sl,
    tp: tp,
    lotSize: lotSize,
    lots: lotSize,
    time: new Date().toLocaleString(),
    openedAt: Date.now(),
    reason: reason,
    // Intel snapshot at the moment of entry. Used by the pattern miner.
    journal_context: {
      raw_confidence: ctx.rawConfidence != null ? ctx.rawConfidence : null,
      effective_confidence: ctx.confidence != null ? ctx.confidence : null,
      key_risk: ctx.key_risk || null,
      thesis_alignment: ctx.thesis_alignment || null,
      wyckoff_alignment: ctx.wyckoff_alignment || null,
      wyckoff_phase: intel.wyckoff ? intel.wyckoff.phase : null,
      wyckoff_sub_phase: intel.wyckoff ? intel.wyckoff.sub_phase : null,
      regime_label: intel.regime ? intel.regime.regime_label : null,
      trend_character: intel.regime ? intel.regime.trend_character : null,
      volatility_character: intel.regime ? intel.regime.volatility_character : null,
      cot_bias: intel.cot ? intel.cot.cot_bias : null,
      cot_percentile: intel.cot ? intel.cot.commercial_percentile_26w : null,
      real_yield_direction: intel.real_yields ? intel.real_yields.direction_20d : null,
      real_yield_level: intel.real_yields ? intel.real_yields.level_classification : null,
      sentiment_reading: intel.sentiment ? intel.sentiment.reading : null,
      sentiment_score: intel.sentiment ? intel.sentiment.score : null,
      session: intel.session ? intel.session.primary_session : null,
      session_multiplier: intel.session ? intel.session.signal_confidence_multiplier : null,
      pre_event_caution: intel.calendar ? !!intel.calendar.pre_event_caution : false,
      post_event_opportunity: intel.calendar ? !!intel.calendar.post_event_opportunity : false,
      portfolio_health: intel.portfolio ? intel.portfolio.portfolio_health : null
    }
  };
  atPositions.unshift(pos);
  localStorage.setItem('wm_at_positions', JSON.stringify(atPositions));
  atAddLog('trade', 'EXECUTED ' + dir + ' ' + pair + ' at ' + entry + '. Reason: ' + (reason || 'n/a'));
  atRenderPositions();
}

function atRenderPositions() {
  var container = document.getElementById('at-open-positions');
  if (!container) return;
  if (!atPositions.length) {
    container.innerHTML = '<div class="empty" style="padding:20px 0;"><div class="empty-text" style="font-size:11px;">No open positions.</div></div>';
    return;
  }
  container.innerHTML = atPositions.map(function (p) {
    var live = (typeof livePriceCache !== 'undefined' && livePriceCache[p.pair]) || p.entry;
    var pnl = p.dir === 'BUY' ? (live - p.entry) * (p.lots || p.lotSize) : (p.entry - live) * (p.lots || p.lotSize);
    var pnlColor = pnl >= 0 ? 'var(--green)' : 'var(--red)';
    return '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:8px 10px;margin-bottom:7px;font-family:var(--font-mono);font-size:10px;">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">'
      +   '<span style="color:var(--gold);font-weight:700;">' + p.dir + ' ' + p.pair + '</span>'
      +   '<span style="color:' + pnlColor + ';font-weight:700;">' + (pnl >= 0 ? '+' : '') + '$' + pnl.toFixed(2) + '</span>'
      + '</div>'
      + '<div style="color:var(--text3);font-size:9px;">Entry: ' + (p.entry ? Number(p.entry).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—') + ' | Lots: ' + (p.lots || p.lotSize) + '</div>'
      + '<div style="color:var(--text4);font-size:9px;">SL: ' + (p.sl != null ? p.sl : '—') + ' | TP: ' + (p.tp != null ? p.tp : '—') + '</div>'
      + '<div style="color:var(--text4);font-size:9px;margin-top:2px;">' + (p.reason || '') + '</div>'
      + '</div>';
  }).join('');
}

// ── CHART CONTROLS (reference chart only; trading uses Binance WS price) ────
var atTF = '30';
var atCompareMode = false;
var atTvSymbolMap = {
  BTCUSD:'BINANCE:BTCUSDT', ETHUSD:'BINANCE:ETHUSDT', SOLUSD:'BINANCE:SOLUSDT',
  XRPUSD:'BINANCE:XRPUSDT', BNBUSD:'BINANCE:BNBUSDT', ADAUSD:'BINANCE:ADAUSDT',
  DOTUSD:'BINANCE:DOTUSDT', LINKUSD:'BINANCE:LINKUSDT',
  XAUUSD:'OANDA:XAUUSD', XAGUSD:'OANDA:XAGUSD', XPTUSD:'OANDA:XPTUSD', XCUUSD:'OANDA:XCUUSD',
  EURUSD:'OANDA:EURUSD', GBPUSD:'OANDA:GBPUSD', USDJPY:'OANDA:USDJPY',
  GBPJPY:'OANDA:GBPJPY', USDCHF:'OANDA:USDCHF', AUDUSD:'OANDA:AUDUSD',
  USDCAD:'OANDA:USDCAD', NZDUSD:'OANDA:NZDUSD', EURGBP:'OANDA:EURGBP',
  EURJPY:'OANDA:EURJPY', AUDJPY:'OANDA:AUDJPY', CADJPY:'OANDA:CADJPY',
  EURCHF:'OANDA:EURCHF', GBPCHF:'OANDA:GBPCHF', EURCAD:'OANDA:EURCAD',
  AUDCAD:'OANDA:AUDCAD', AUDNZD:'OANDA:AUDNZD', CHFJPY:'OANDA:CHFJPY',
  US30:'OANDA:US30USD', SPX500:'OANDA:SPX500USD', NAS100:'OANDA:NAS100USD',
  UK100:'OANDA:UK100GBP', GER40:'OANDA:DE30EUR', JPN225:'OANDA:JP225USD',
  AUS200:'OANDA:AU200AUD', HK50:'OANDA:HK33HKD',
  USOIL:'TVC:USOIL', UKOIL:'TVC:UKOIL', NATGAS:'TVC:NATURALGAS',
  XAUEUR:'OANDA:XAUEUR', XAUGBP:'OANDA:XAUGBP'
};

function atLoadChart() {
  var frame = document.getElementById('at-chart-frame');
  if (!frame) return;
  var symbol = atTvSymbolMap[atCurrentInst] || 'BINANCE:BTCUSDT';
  frame.src = 'https://s.tradingview.com/widgetembed/?symbol=' + encodeURIComponent(symbol) + '&interval=' + atTF + '&theme=dark&style=1&locale=en&toolbar_bg=%23060608&hide_side_toolbar=1&allow_symbol_change=0';
}

function atSetTF(btn, tf) {
  atTF = tf;
  document.querySelectorAll('.at-tf-btn').forEach(function (b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  atLoadChart();
}

function atOnInstrumentChange() {
  var sel = document.getElementById('at-instrument');
  if (!sel) return;
  atCurrentInst = sel.value;
  atLoadChart();
  atAddLog('scan', 'Chart switched to ' + atCurrentInst + '. (Lumen Intraday selects its own scan universe.)');
}

// ── MOBILE TAB BAR ──────────────────────────────────────────────────────────
function atInitMobileTabBar() {
  if (document.getElementById('at-mobile-tabbar')) return;
  var bar = document.createElement('div');
  bar.className = 'at-mobile-tabbar';
  bar.id = 'at-mobile-tabbar';
  bar.innerHTML =
    '<button class="at-mobile-tab active" onclick="atMobileTab(this,\'chart\')">Chart</button>' +
    '<button class="at-mobile-tab" onclick="atMobileTab(this,\'log\')">Log</button>' +
    '<button class="at-mobile-tab" onclick="atMobileTab(this,\'positions\')">Positions</button>';
  var panel = document.getElementById('tab-autotrader');
  if (panel) panel.appendChild(bar);
}

function atMobileTab(btn, tab) {
  document.querySelectorAll('.at-mobile-tab').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var mid   = document.getElementById('at-mid-panel');
  var right = document.getElementById('at-right-panel');
  if (mid)   mid.classList.remove('at-mob-active');
  if (right) right.classList.remove('at-mob-active');
  if (tab === 'log'       && mid)   mid.classList.add('at-mob-active');
  if (tab === 'positions' && right) right.classList.add('at-mob-active');
}

// ── INJECT WS DOT INTO TOPBAR ───────────────────────────────────────────────
function atInjectWsDot() {
  if (document.getElementById('at-ws-dot')) return;
  var topbar = document.getElementById('at-topbar');
  if (!topbar) return;
  var wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:center;gap:4px;flex-shrink:0;';
  wrap.innerHTML =
    '<div id="at-ws-dot" class="ws-dot disconnected" title="Binance WebSocket status. Click to reconnect." onclick="atInitBinanceWs()"></div>' +
    '<span id="at-ws-label" style="font-family:var(--font-mono);font-size:7px;letter-spacing:1px;color:var(--text4);">OFFLINE</span>';
  topbar.insertBefore(wrap, topbar.children[1] || null);
}

// ── INIT ────────────────────────────────────────────────────────────────────
var atChartLoaded = false;
function initAutoTrader() {
  atCurrentInst = 'BTCUSD';
  atUpdateAccount();
  atRenderPositions();
  atRenderLog();
  atUpdatePriceDisplay();
  atInjectWsDot();
  atInitBinanceWs();
  atInitMobileTabBar();

  if (!atChartLoaded) {
    atChartLoaded = true;
    atLoadChart();
  }
  scalpUpdateInstButtons();
  scalpRenderLog();
  scalpRenderPositions();
  scalpRenderHistory();

  var mc  = document.querySelector('.main-content');
  var rp  = document.getElementById('right-panel');
  var app = document.getElementById('app');
  if (mc)  { mc.style.padding = '0'; mc.style.overflow = 'hidden'; }
  if (rp)  rp.style.display = 'none';
  if (app) app.classList.add('chart-mode');
}

// ═══════════════════════════════════════════════════════════════════════════
// INTRADAY UI HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

function atResetAccount() {
  if (!confirm('Reset Lumen Intraday account to one hundred thousand dollars? All positions and history will be cleared.')) return;
  atAccount = { balance: 100000, startBalance: 100000 };
  atPositions = [];
  atHistory = [];
  atLog = [];
  localStorage.setItem('wm_at_account', JSON.stringify(atAccount));
  localStorage.setItem('wm_at_positions', JSON.stringify(atPositions));
  localStorage.setItem('wm_at_history', JSON.stringify(atHistory));
  localStorage.setItem('wm_at_log', JSON.stringify(atLog));
  atUpdateAccount();
  atRenderPositions();
  atRenderLog();
  if (typeof atRenderHistory === 'function') atRenderHistory();
}

function atClearLog() {
  atLog = [];
  localStorage.setItem('wm_at_log', JSON.stringify(atLog));
  atRenderLog();
}

function atCloseAll() {
  if (!atPositions.length) return;
  atPositions.forEach(function (pos) {
    var live = (typeof livePriceCache !== 'undefined' && livePriceCache[pos.pair]) || atCurrentPrice;
    var pnl = pos.dir === 'BUY' ? (live - pos.entry) * (pos.lots || pos.lotSize) : (pos.entry - live) * (pos.lots || pos.lotSize);
    atAccount.balance += pnl;
    atHistory.push(Object.assign({}, pos, { closePrice: live, pnl: pnl, closedAt: Date.now() }));
    atAddLog('trade', 'Closed ' + pos.dir + ' ' + pos.pair + ' at ' + (live || 0).toFixed(2) + '. P and L: ' + pnl.toFixed(2));
  });
  atPositions = [];
  localStorage.setItem('wm_at_account', JSON.stringify(atAccount));
  localStorage.setItem('wm_at_positions', JSON.stringify(atPositions));
  localStorage.setItem('wm_at_history', JSON.stringify(atHistory));
  atUpdateAccount();
  atRenderPositions();
  if (typeof atRenderHistory === 'function') atRenderHistory();
}

function atClearHistory() {
  atHistory = [];
  localStorage.setItem('wm_at_history', JSON.stringify(atHistory));
  if (typeof atRenderHistory === 'function') atRenderHistory();
  var container = document.getElementById('at-history');
  if (container) container.innerHTML = '<div class="empty" style="padding:20px 0;"><div class="empty-text" style="font-size:11px;">No closed trades yet</div></div>';
}

function atMidTab(btn, panelId) {
  document.querySelectorAll('.at-mid-tab').forEach(function (b) {
    b.classList.remove('active');
    b.style.color = 'var(--text3)';
    b.style.borderBottomColor = 'transparent';
  });
  btn.classList.add('active');
  btn.style.color = '';
  btn.style.borderBottomColor = '';
  var ailog = document.getElementById('at-mid-ailog');
  var slog  = document.getElementById('at-mid-scalplog');
  if (ailog) ailog.style.display = 'none';
  if (slog)  slog.style.display  = 'none';
  var panel = document.getElementById(panelId);
  if (panel) panel.style.display = 'flex';
}

function atPanelTab(btn, panelId) {
  document.querySelectorAll('.at-panel-tab').forEach(function (b) {
    b.classList.remove('active');
    b.style.color = 'var(--text3)';
    b.style.borderBottomColor = 'transparent';
  });
  btn.classList.add('active');
  btn.style.color = '';
  btn.style.borderBottomColor = '';
  ['at-panel-positions','at-panel-history','at-panel-scalp'].forEach(function (pid) {
    var p = document.getElementById(pid);
    if (p) p.style.display = 'none';
  });
  var panel = document.getElementById(panelId);
  if (panel) panel.style.display = 'flex';
}

// ═══════════════════════════════════════════════════════════════════════════
// SCALPER ENGINE
// ═══════════════════════════════════════════════════════════════════════════

var scalpEngineRunning = false;
var scalpScanTimer     = null;
var scalpSelectedInsts = JSON.parse(localStorage.getItem('wm_scalp_selected') || '["BTCUSD"]');
var scalpPositions     = JSON.parse(localStorage.getItem('wm_scalp_positions') || '[]');
var scalpHistory       = JSON.parse(localStorage.getItem('wm_scalp_history') || '[]');
var scalpLog           = JSON.parse(localStorage.getItem('wm_scalp_log') || '[]');

var SCALP_CRYPTO_SET = { BTCUSD: 1, ETHUSD: 1, SOLUSD: 1, XRPUSD: 1, BNBUSD: 1, ADAUSD: 1, DOTUSD: 1, LINKUSD: 1 };

function scalpToggleInstrument(inst) {
  var idx = scalpSelectedInsts.indexOf(inst);
  if (idx >= 0) {
    if (scalpSelectedInsts.length <= 1) return;
    scalpSelectedInsts.splice(idx, 1);
  } else {
    if (scalpSelectedInsts.length >= 5) return;
    scalpSelectedInsts.push(inst);
  }
  localStorage.setItem('wm_scalp_selected', JSON.stringify(scalpSelectedInsts));
  scalpUpdateInstButtons();
}

function scalpUpdateInstButtons() {
  var allBtns = ['BTCUSD','ETHUSD','XAUUSD','XAGUSD','EURUSD','GBPUSD','SOLUSD'];
  allBtns.forEach(function (id) {
    var btn = document.getElementById('scalp-inst-' + id);
    if (!btn) return;
    if (scalpSelectedInsts.indexOf(id) >= 0) {
      btn.style.background = 'rgba(168,85,247,0.18)';
      btn.style.borderColor = 'var(--purple)';
      btn.style.color = 'var(--purple)';
      btn.style.fontWeight = '800';
    } else {
      btn.style.background = 'var(--bg3)';
      btn.style.borderColor = 'var(--border2)';
      btn.style.color = 'var(--text3)';
      btn.style.fontWeight = '600';
    }
  });
  var countEl = document.getElementById('scalp-inst-count');
  if (countEl) countEl.textContent = scalpSelectedInsts.length + '/5 selected';
}

function scalpStartEngine() {
  if (scalpEngineRunning) return;
  scalpEngineRunning = true;
  var label = document.getElementById('scalp-engine-label');
  var dot   = document.getElementById('scalp-pulse-dot');
  var startBtn = document.getElementById('scalp-start-btn');
  var stopBtn  = document.getElementById('scalp-stop-btn');
  var countdown = document.getElementById('scalp-countdown');
  if (label) label.textContent = 'SCALP ACTIVE';
  if (dot) { dot.style.background = 'var(--green)'; dot.style.animation = 'pulse 2s infinite'; }
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn)  stopBtn.style.display  = '';
  if (countdown) countdown.style.display = '';

  var weekend = isWeekend();
  if (weekend) {
    scalpAddLog('Lumen Scalper started in weekend mode. Confidence threshold raised to seventy five for thinner liquidity. Only crypto instruments will be scanned.');
  } else {
    scalpAddLog('Lumen Scalper started. Instruments: ' + scalpSelectedInsts.join(', ') + '.');
  }

  // Sentiment poller is shared with Intraday. Start if not already running.
  if (!lumSentiment.timer) lumSentiment.start();

  scalpScanTimer = setInterval(function () {
    if (document.visibilityState !== 'hidden') scalpRunScan();
  }, 60000);
  clearInterval(scalpUiTimer);
  scalpUiTimer = setInterval(function () {
    if (document.visibilityState !== 'hidden') scalpUpdateCountdown();
  }, 1000);
  scalpRunScan();
}

function scalpStopEngine() {
  if (!scalpEngineRunning) return;
  scalpEngineRunning = false;
  var label = document.getElementById('scalp-engine-label');
  var dot   = document.getElementById('scalp-pulse-dot');
  var startBtn = document.getElementById('scalp-start-btn');
  var stopBtn  = document.getElementById('scalp-stop-btn');
  var countdown = document.getElementById('scalp-countdown');
  if (label) label.textContent = 'SCALP IDLE';
  if (dot) { dot.style.background = 'var(--purple)'; dot.style.animation = 'none'; }
  if (startBtn) startBtn.style.display = '';
  if (stopBtn)  stopBtn.style.display  = 'none';
  if (countdown) { countdown.style.display = 'none'; countdown.textContent = 'next: —'; }
  scalpLastScanTime = null;
  clearInterval(scalpScanTimer); scalpScanTimer = null;
  clearInterval(scalpUiTimer);   scalpUiTimer   = null;
  // Stop sentiment polling only if no Intraday engine is also running.
  if (!atEngineRunning) lumSentiment.stop();
  scalpAddLog('Lumen Scalper stopped.');
}

function scalpAddLog(msg) {
  scalpLog.unshift({ text: msg, time: Date.now() });
  if (scalpLog.length > 200) scalpLog.length = 200;
  localStorage.setItem('wm_scalp_log', JSON.stringify(scalpLog));
  scalpRenderLog();
}

function scalpRenderLog() {
  var container = document.getElementById('scalp-log-entries');
  if (!container) return;
  if (!scalpLog.length) {
    container.innerHTML = '<div class="empty" style="padding:10px 0;"><div class="empty-text" style="font-size:10px;color:var(--text4);">Activity will appear here</div></div>';
    return;
  }
  container.innerHTML = scalpLog.slice(0, 50).map(function (entry) {
    var t = new Date(entry.time);
    var ts = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return '<div style="padding:4px 0;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:9px;color:var(--text2);line-height:1.5;"><span style="color:var(--text4);margin-right:6px;">' + ts + '</span>' + entry.text + '</div>';
  }).join('');
}

function scalpClearAll() {
  scalpLog = [];
  scalpHistory = [];
  scalpPositions = [];
  localStorage.setItem('wm_scalp_log', JSON.stringify(scalpLog));
  localStorage.setItem('wm_scalp_history', JSON.stringify(scalpHistory));
  localStorage.setItem('wm_scalp_positions', JSON.stringify(scalpPositions));
  scalpRenderLog();
  scalpRenderPositions();
  scalpRenderHistory();
}

function scalpRenderPositions() {
  var container = document.getElementById('scalp-open-positions');
  if (!container) return;
  if (!scalpPositions.length) {
    container.innerHTML = '<div class="empty" style="padding:14px 0;"><div class="empty-text" style="font-size:10px;">No open scalp trades</div></div>';
    return;
  }
  container.innerHTML = scalpPositions.map(function (p) {
    return '<div style="padding:6px 0;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:9px;color:var(--text2);">' + p.dir + ' ' + p.instrument + ' at ' + p.entry + '</div>';
  }).join('');
}

function scalpRenderHistory() {
  var container = document.getElementById('scalp-history-entries');
  if (!container) return;
  if (!scalpHistory.length) {
    container.innerHTML = '<div class="empty" style="padding:10px 0;"><div class="empty-text" style="font-size:10px;color:var(--text4);">No scalp trades yet</div></div>';
    return;
  }
  container.innerHTML = scalpHistory.slice(0, 30).map(function (t) {
    var pnlColor = t.pnl >= 0 ? 'var(--green)' : 'var(--red)';
    return '<div style="padding:4px 0;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:9px;display:flex;justify-content:space-between;"><span style="color:var(--text2);">' + t.dir + ' ' + t.instrument + '</span><span style="color:' + pnlColor + ';">' + (t.pnl >= 0 ? '+' : '') + t.pnl.toFixed(2) + '</span></div>';
  }).join('');
}

// Ask Haiku for a scalp signal given the assembled scalp intel payload.
// The payload reads cached intel only and never triggers a fresh upstream
// LLM call from the scalper hot path. Returns parsed JSON or null on
// failure.
async function scalpDecide(inst, intel) {
  if (!lumBudget.checkAndConsume('scalper')) {
    return { ok: false, reason: 'daily scalper budget cap reached' };
  }
  var r;
  try {
    r = await fetch('/api/behaviour', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: WINGMAN_SCALP_SYSTEM,
        prompt: JSON.stringify(intel),
        maxTokens: 400
      })
    });
  } catch (e) {
    return { ok: false, reason: 'network error: ' + (e && e.message ? e.message : 'unknown') };
  }
  if (!r.ok) {
    var bodyText = '';
    try { bodyText = await r.text(); } catch (_) {}
    var snippet = bodyText ? bodyText.slice(0, 140).replace(/\s+/g, ' ') : '';
    return { ok: false, reason: 'upstream status ' + r.status + (snippet ? '. ' + snippet : '') };
  }
  var d;
  try { d = await r.json(); }
  catch (e) { return { ok: false, reason: 'response not JSON: ' + (e && e.message ? e.message : 'parse error') }; }
  var text = d && d.content && d.content[0] && d.content[0].text;
  if (!text) return { ok: false, reason: 'empty response from intelligence engine' };
  var parsed = safeParseJSON(text);
  if (!parsed) return { ok: false, reason: 'engine response was not valid JSON' };
  return { ok: true, signal: parsed };
}

// Watches every open scalp position and closes any whose live price has
// crossed SL or TP. Closed records carry the entry journal_context forward
// via Object.assign, mirroring atCloseAll, so the pattern miner sees scalp
// outcomes alongside Intraday outcomes.
function scalpMonitorPositions() {
  if (!scalpPositions.length) return;
  var stillOpen = [];
  var closedAny = false;
  scalpPositions.forEach(function (pos) {
    var live = (typeof livePriceCache !== 'undefined' && livePriceCache[pos.instrument]) || null;
    if (!live) { stillOpen.push(pos); return; }
    var hitSL = false, hitTP = false;
    if (pos.dir === 'BUY') {
      if (pos.sl != null && live <= pos.sl) hitSL = true;
      else if (pos.tp != null && live >= pos.tp) hitTP = true;
    } else {
      if (pos.sl != null && live >= pos.sl) hitSL = true;
      else if (pos.tp != null && live <= pos.tp) hitTP = true;
    }
    if (!hitSL && !hitTP) { stillOpen.push(pos); return; }

    var lots = pos.lots || 0.02;
    var pnl = pos.dir === 'BUY' ? (live - pos.entry) * lots : (pos.entry - live) * lots;
    var rDenom = pos.sl != null && pos.entry !== pos.sl ? Math.abs(pos.entry - pos.sl) : 0;
    var rMult = 0;
    if (rDenom > 0) {
      if (hitSL) rMult = -1;
      else if (hitTP && pos.tp != null) rMult = Math.abs(pos.tp - pos.entry) / rDenom;
    }
    var exitReason = hitSL ? 'SL' : 'TP';

    scalpHistory.unshift(Object.assign({}, pos, {
      closePrice: live,
      pnl: pnl,
      r_multiple: Number(rMult.toFixed(2)),
      closedAt: Date.now(),
      exit_reason: exitReason
    }));
    closedAny = true;

    var precision = pos.instrument.indexOf('JPY') >= 0 ? 3 : 5;
    var rText = rMult >= 0 ? 'plus ' + rMult.toFixed(1) + 'R' : 'minus ' + Math.abs(rMult).toFixed(1) + 'R';
    scalpAddLog('Lumen closed ' + pos.instrument + ' ' + pos.dir + ' at ' + Number(live).toFixed(precision) + '. Result: ' + rText + '. ' + exitReason + ' hit.');
  });
  if (!closedAny) return;
  if (scalpHistory.length > 200) scalpHistory.length = 200;
  scalpPositions = stillOpen;
  localStorage.setItem('wm_scalp_positions', JSON.stringify(scalpPositions));
  localStorage.setItem('wm_scalp_history', JSON.stringify(scalpHistory));
  scalpRenderPositions();
  scalpRenderHistory();
}

async function scalpRunScan() {
  if (!scalpEngineRunning) return;
  scalpLastScanTime = Date.now();

  // Close any positions whose live price has crossed SL or TP since the
  // previous tick. Runs before scanning so the portfolio gate sees an
  // accurate open exposure picture.
  scalpMonitorPositions();

  var weekend = isWeekend();
  var threshold = weekend ? 75 : 65;

  // Filter the user's selection to crypto when markets are closed.
  var instruments = scalpSelectedInsts.slice();
  if (weekend) {
    instruments = instruments.filter(function (i) { return SCALP_CRYPTO_SET[i]; });
    if (!instruments.length) {
      scalpAddLog('Lumen Scalper: no crypto in current selection. Add BTC, ETH, or SOL to scan during weekend hours.');
      return;
    }
  }

  for (var i = 0; i < instruments.length; i++) {
    var inst = instruments[i];

    // Live price comes from Binance WS for crypto, Deriv WS for forex/metals,
    // and the cached /api/prices result for indices and commodities.
    var price = (typeof livePriceCache !== 'undefined' && livePriceCache[inst]) || null;
    if (!price) {
      scalpAddLog('Lumen Scalper: ' + inst + ' skipped, no live price.');
      continue;
    }

    var precision = inst.indexOf('JPY') >= 0 ? 3 : 5;
    scalpAddLog('Lumen scan: ' + inst + ' at ' + Number(price).toFixed(precision) + '.');

    // Indicators only for crypto (Binance REST is free and unlimited). For
    // non crypto, TwelveData would burn the free tier at sixty second
    // cadence, so the scalper passes price plus sentiment alone and lets
    // Haiku reason. Indicators stay best effort; null is handled downstream.
    var indicators = null;
    if (typeof BINANCE_SYMBOLS !== 'undefined' && BINANCE_SYMBOLS[inst]) {
      indicators = await lumenIndicators(inst);
    }

    // Build the scalper intel payload from cached upstream intelligence
    // only. No upstream LLM calls are triggered here.
    var intel = assembleScalperIntel(inst, price, indicators);

    // Pre event hard skip on the scalper too.
    if (intel.pre_event_caution) {
      scalpAddLog('Lumen Scalper: ' + inst + ' pre event caution. '
        + (intel.next_event ? intel.next_event.event_name : 'high impact event imminent'));
      continue;
    }

    var decision = await scalpDecide(inst, intel);
    if (!decision || !decision.ok) {
      var sFail = decision && decision.reason ? decision.reason : 'unknown error';
      scalpAddLog('Lumen Scalper: ' + inst + ' decision call failed. ' + sFail + '.');
      continue;
    }
    var signal = decision.signal;

    if (signal.action === 'SKIP') {
      scalpAddLog('Lumen Scalper: ' + inst + ' skip. ' + (signal.skip_reason || 'no qualifying setup'));
      continue;
    }

    // Portfolio gate before applying threshold.
    var portfolio = (window.LumenIntel && typeof window.LumenIntel.portfolio === 'function')
      ? window.LumenIntel.portfolio() : null;
    var gate = lumenPortfolioGate(inst, signal.action, portfolio);
    if (!gate.allowed) {
      scalpAddLog('Lumen Scalper: ' + inst + ' ' + signal.action + ' blocked. ' + gate.reason + '.');
      continue;
    }

    // Apply session multiplier locally to the LLM's stated confidence.
    var rawConf = typeof signal.confidence === 'number' ? signal.confidence : 0;
    var conf = applySessionMultiplier(rawConf, intel.session);
    if ((signal.action === 'BUY' || signal.action === 'SELL') && conf >= threshold) {
      scalpAddLog('Lumen scan: ' + inst + ' ' + signal.action + ' raw ' + rawConf
        + ', effective ' + conf + ' (' + (intel.session ? intel.session.primary_session : 'unknown') + '). '
        + (signal.entry_logic || ''));
      scalpExecuteTrade(inst, signal.action, price, signal.sl, signal.tp, signal.lots || 0.02, signal.grade, {
        intel: intel,
        rawConfidence: rawConf,
        effectiveConfidence: conf,
        entry_logic: signal.entry_logic || '',
        key_risk: signal.key_risk || ''
      });
    } else {
      scalpAddLog('Lumen Scalper: ' + inst + ' raw ' + rawConf + ' effective ' + conf
        + ' below ' + threshold + ' threshold. No entry.');
    }
  }
}

function scalpExecuteTrade(inst, dir, price, sl, tp, lots, grade, signalCtx) {
  var ctx = signalCtx || {};
  var intel = ctx.intel || {};
  var pos = {
    id: Date.now(),
    instrument: inst,
    dir: dir,
    entry: price,
    sl: sl,
    tp: tp,
    lots: lots || 0.02,
    grade: grade || 'B',
    openedAt: Date.now(),
    journal_context: {
      raw_confidence: ctx.rawConfidence != null ? ctx.rawConfidence : null,
      effective_confidence: ctx.effectiveConfidence != null ? ctx.effectiveConfidence : null,
      entry_logic: ctx.entry_logic || null,
      key_risk: ctx.key_risk || null,
      wyckoff_phase: intel.wyckoff ? intel.wyckoff.phase : null,
      regime_label: intel.regime ? intel.regime.regime_label : null,
      trend_character: intel.regime ? intel.regime.trend_character : null,
      volatility_character: intel.regime ? intel.regime.volatility_character : null,
      sentiment_reading: intel.sentiment ? intel.sentiment.reading : null,
      sentiment_score: intel.sentiment ? intel.sentiment.score : null,
      session: intel.session ? intel.session.primary_session : null,
      session_multiplier: intel.session ? intel.session.signal_confidence_multiplier : null,
      pre_event_caution: !!intel.pre_event_caution,
      post_event_opportunity: !!intel.post_event_opportunity,
      weekend: !!intel.weekend
    }
  };
  scalpPositions.unshift(pos);
  if (scalpPositions.length > 20) scalpPositions.length = 20;
  localStorage.setItem('wm_scalp_positions', JSON.stringify(scalpPositions));
  scalpAddLog('Lumen opened ' + inst + ' ' + dir + ' ' + (lots || 0.02) + ' lots at ' + price + '. SL ' + (sl != null ? sl : 'none') + ' TP ' + (tp != null ? tp : 'none') + '.');
  scalpRenderPositions();
}

// ═══════════════════════════════════════════════════════════════════════════
// PATTERN MINING
// ───────────────────────────────────────────────────────────────────────────
// Aggregates closed trade context across both Lumen engines and asks Haiku
// once per UTC week to surface conditions that produced wins, conditions
// that produced losses, and concrete recommendations. Result is cached in
// localStorage under wm_lumen_patterns_<isoweek> for 7 days.
// ═══════════════════════════════════════════════════════════════════════════

function lumenIsoWeek() {
  var d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return d.getUTCFullYear() + '-W' + String(weekNo).padStart(2, '0');
}

function lumenPatternSummary() {
  var atHist    = JSON.parse(localStorage.getItem('wm_at_history')    || '[]');
  var scalpHist = JSON.parse(localStorage.getItem('wm_scalp_history') || '[]');
  var all = atHist.concat(scalpHist);

  // Bucket by intel context fields and tally wins, losses, average pnl.
  function bucketBy(field) {
    var buckets = {};
    all.forEach(function (t) {
      if (!t || !t.journal_context) return;
      var key = t.journal_context[field] || 'unknown';
      if (!buckets[key]) buckets[key] = { trades: 0, wins: 0, pnl: 0 };
      buckets[key].trades += 1;
      var pnl = typeof t.pnl === 'number' ? t.pnl : 0;
      if (pnl > 0) buckets[key].wins += 1;
      buckets[key].pnl += pnl;
    });
    Object.keys(buckets).forEach(function (k) {
      var b = buckets[k];
      b.win_rate = b.trades ? Number(((b.wins / b.trades) * 100).toFixed(1)) : 0;
      b.avg_pnl  = b.trades ? Number((b.pnl / b.trades).toFixed(2)) : 0;
    });
    return buckets;
  }

  return {
    total_closed: all.length,
    by_wyckoff_phase: bucketBy('wyckoff_phase'),
    by_regime_label:  bucketBy('regime_label'),
    by_session:       bucketBy('session'),
    by_cot_bias:      bucketBy('cot_bias'),
    by_real_yield_direction: bucketBy('real_yield_direction')
  };
}

async function lumenMinePatterns(force) {
  var cacheKey = 'wm_lumen_patterns_' + lumenIsoWeek();
  if (!force) {
    try {
      var cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && cached.summary) return cached;
    } catch (_) { /* ignore */ }
  }
  var summary = lumenPatternSummary();
  if (summary.total_closed < 10) {
    return { summary: summary, narrative: 'Pattern mining waits until at least ten trades have closed.', samples: summary.total_closed };
  }

  var prompt = 'You are reviewing a Wingman trading journal. Identify the conditions under which '
    + 'the trader performs best, the conditions where performance deteriorates, and any behavioural '
    + 'patterns visible in confidence calibration or session timing. Be direct. Surface the truth. '
    + 'Output JSON: {"strengths": [string], "weaknesses": [string], "actions": [string], "narrative": string under three hundred characters}.\n\n'
    + 'Aggregated journal data:\n' + JSON.stringify(summary, null, 2);

  try {
    var r = await fetch('/api/behaviour', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: 'You analyse Wingman trade journals. Return only valid JSON. No prose outside JSON. No hyphens.',
        prompt: prompt,
        maxTokens: 600
      })
    });
    if (!r.ok) throw new Error('pattern call status ' + r.status);
    var d = await r.json();
    var text = d && d.content && d.content[0] && d.content[0].text;
    var parsed = safeParseJSON(text);
    if (!parsed) throw new Error('pattern parse failed');
    var payload = {
      summary: summary,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      actions: parsed.actions || [],
      narrative: parsed.narrative || '',
      mined_at: new Date().toISOString()
    };
    try { localStorage.setItem(cacheKey, JSON.stringify(payload)); } catch (_) {}
    return payload;
  } catch (e) {
    return { summary: summary, narrative: 'Pattern mining unavailable: ' + e.message };
  }
}
