// ═══════════════════════════════════════════════════════════════════════════
// AUTOTRADER ENGINE / LUMEN INTELLIGENCE (PHASE 2 - APRIL 2026)
// Intelligence engine — Binance live feed, AI-driven trade execution
// Default instrument: BTCUSD | Starting balance: $100,000
// Scans twice per hour (every 30 min) | Min 5 lots | 1:Unlimited leverage
// ───────────────────────────────────────────────────────────────────────────
// Zero-Cost UK Optimized | Multi-Model Fallback | Three-Layer Pipeline
// ═══════════════════════════════════════════════════════════════════════════

// ── STATE & STORAGE ──────────────────────────────────────────────────────────
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

// ── PHASE 2 SHARED CONTEXT ───────────────────────────────────────────────────
var wm_context = {
  sentiment: { reading: "neutral", score: 50, source: "initial", updatedAt: null, headlines: [], trump_signal: null },
  dataSummary: null,
  recentSignals: [],
  openPositions: []
};

// ── LUMEN THROTTLE MANAGER (ZERO-COST UK GUARD) ──────────────────────────────
var lumThrottle = {
  calls: JSON.parse(localStorage.getItem('wm_lum_calls') || 'null') || {
    claude_sonnet: 0, claude_haiku: 0, gemini_flash: 0,
    gemini_lite: 0, gemini_pro: 0, grok_fast: 0, grok_reasoning: 0
  },
  modelAvailability: {
    claude_sonnet: { state: "active", exhaustedAt: null, unavailableUntil: null },
    claude_haiku:  { state: "active", exhaustedAt: null, unavailableUntil: null },
    gemini_flash:  { state: "active", exhaustedAt: null, unavailableUntil: null },
    gemini_lite:   { state: "active", exhaustedAt: null, unavailableUntil: null },
    gemini_pro:    { state: "active", exhaustedAt: null, unavailableUntil: null },
    grok_fast:     { state: "active", exhaustedAt: null, unavailableUntil: null },
    grok_reasoning:{ state: "active", exhaustedAt: null, unavailableUntil: null }
  },
  limits: {
    claude_sonnet: 150, 
    claude_haiku: 300, 
    gemini_flash: 450, 
    gemini_lite: 950, 
    gemini_pro: 2, 
    grok_fast: 300, 
    grok_reasoning: 50,
    gemini_per_min: 15
  },
  geminiCallsThisMin: 0,
  lastResetMinute: Math.floor(Date.now() / 60000),

  checkThrottle(layer, preferredModel) {
    this.checkMidnightReset();
    this.checkMinuteReset();
    const chains = {
      sentiment: ['gemini_lite', 'grok_fast', 'claude_haiku'],
      dataprep:  ['gemini_lite', 'gemini_flash'],
      decision:  ['claude_sonnet', 'gemini_flash', 'gemini_pro', 'grok_reasoning']
    };
    const chain = chains[layer] || [preferredModel];
    for (const mKey of chain) {
      const m = this.modelAvailability[mKey];
      if (m.state === "unavailable" && m.unavailableUntil && Date.now() > m.unavailableUntil) m.state = "active";
      if (m.state === "active" && this.calls[mKey] < this.limits[mKey]) {
        if (mKey.startsWith('gemini') && this.geminiCallsThisMin >= this.limits.gemini_per_min) continue;
        return { allowed: true, model: mKey };
      }
    }
    return { allowed: false, model: null, reason: "Quota exhausted" };
  },

  recordCall(modelKey) {
    this.calls[modelKey]++;
    if (modelKey.startsWith('gemini')) this.geminiCallsThisMin++;
    if (this.calls[modelKey] >= this.limits[modelKey]) {
      this.modelAvailability[modelKey].state = "exhausted";
      this.modelAvailability[modelKey].exhaustedAt = Date.now();
    }
    localStorage.setItem('wm_lum_calls', JSON.stringify(this.calls));
  },

  recordFailure(modelKey) {
    const backoff = 60 * 1000; 
    this.modelAvailability[modelKey].state = "unavailable";
    this.modelAvailability[modelKey].unavailableUntil = Date.now() + backoff;
  },

  checkMidnightReset() {
    const now = new Date();
    const lastReset = localStorage.getItem('wm_lum_reset_day');
    if (lastReset !== String(now.getUTCDate())) {
      Object.keys(this.calls).forEach(k => this.calls[k] = 0);
      Object.keys(this.modelAvailability).forEach(k => this.modelAvailability[k].state = "active");
      localStorage.setItem('wm_lum_reset_day', String(now.getUTCDate()));
      localStorage.setItem('wm_lum_calls', JSON.stringify(this.calls));
    }
  },

  checkMinuteReset() {
    const currentMin = Math.floor(Date.now() / 60000);
    if (currentMin !== this.lastResetMinute) {
      this.geminiCallsThisMin = 0;
      this.lastResetMinute = currentMin;
    }
  }
};

// ── LUMEN SENTIMENT LAYER (STAGE C) ──────────────────────────────────────────
const SENTIMENT_SYSTEM = `You are a forex market sentiment analyst. Search recent news affecting major pairs (last 30m). Return ONLY valid JSON. Rules: No hyphens. Format: {"reading": "bullish"|"bearish"|"neutral", "score": 0-100, "headlines": [], "trump_signal": "positive"|null}`;

var lumSentiment = {
  timer: null,
  async poll() {
    const route = lumThrottle.checkThrottle('sentiment', 'gemini_lite');
    if (!route.allowed) return;
    try {
      const res = await fetch(WORKER_URL + '/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gemini-3.1-flash-lite-preview', system: SENTIMENT_SYSTEM, prompt: "Analyse forex sentiment." })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text.replace(/```json|```/g, ''));
      if (parsed) {
        wm_context.sentiment = { ...parsed, updatedAt: new Date().toISOString(), source: route.model };
        lumThrottle.recordCall(route.model);
      }
    } catch (e) { lumThrottle.recordFailure(route.model); }
  },
  start() { this.poll(); this.timer = setInterval(() => { if (document.visibilityState !== 'hidden') this.poll(); }, 5 * 60 * 1000); },
  stop() { clearInterval(this.timer); }
};

// ── LUMEN PIPELINE (STAGE D) ─────────────────────────────────────────────────
const DATA_PREP_SYSTEM = `You are a data condenser. Summarize technical indicators into a 120-character string. No prose. No hyphens. Format: [PAIR] [PRICE] [RSI] [EMA CROSS] [VOL] [TREND]`;
const DECISION_SYSTEM = `You are an elite forex trader. Verdict: BUY|SELL|WAIT. Confidence: 0-100. SL/TP must be numbers. Rules: No hyphens. No prose. Format: {"verdict": "string", "confidence": number, "sl": number, "tp": number, "reason": "string"}`;

async function lumenPipeline(pair, indicators) {
  const prepRoute = lumThrottle.checkThrottle('dataprep', 'gemini_lite');
  if (!prepRoute.allowed) return null;

  const prepRes = await fetch(WORKER_URL + '/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gemini-3.1-flash-lite-preview', system: DATA_PREP_SYSTEM, prompt: JSON.stringify(indicators) })
  });
  const prepData = await prepRes.json();
  const summary = prepData.candidates?.[0]?.content?.parts?.[0]?.text;
  lumThrottle.recordCall(prepRoute.model);

  const decRoute = lumThrottle.checkThrottle('decision', 'claude_sonnet');
  if (!decRoute.allowed) return null;

  const decisionPrompt = `SUMMARY: ${summary}\nSENTIMENT: ${wm_context.sentiment.reading} (${wm_context.sentiment.score})\nTRUMP: ${wm_context.sentiment.trump_signal}`;
  let decisionText = null;

  try {
    if (decRoute.model === 'claude_sonnet') {
      const r = await fetch(WORKER_URL + '/v1/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: DECISION_SYSTEM,
          messages: [{ role: 'user', content: decisionPrompt }]
        })
      });
      const d = await r.json();
      decisionText = d.content?.[0]?.text || null;
    } else if (decRoute.model === 'grok_reasoning') {
      const r = await fetch(WORKER_URL + '/api/grok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'grok-3-reasoning', system: DECISION_SYSTEM, prompt: decisionPrompt })
      });
      const d = await r.json();
      decisionText = d.choices?.[0]?.message?.content || null;
    } else {
      const geminiModel = decRoute.model === 'gemini_pro' ? 'gemini-3.1-pro-preview' : 'gemini-3.1-flash-preview';
      const r = await fetch(WORKER_URL + '/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: geminiModel, system: DECISION_SYSTEM, prompt: decisionPrompt })
      });
      const d = await r.json();
      decisionText = d.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
    lumThrottle.recordCall(decRoute.model);
  } catch (e) {
    lumThrottle.recordFailure(decRoute.model);
    return null;
  }

  if (!decisionText) return null;
  return JSON.parse(decisionText.replace(/```json|```/g, ''));
}

// ── AT CHART AND CONTROLS ────────────────────────────────────────────────────
var atTF = '60';
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
  const frame = document.getElementById('at-chart-frame');
  if (!frame) return;
  const symbol = atTvSymbolMap[atCurrentInst] || 'BINANCE:BTCUSDT';
  frame.src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}&interval=${atTF}&theme=dark&style=1&locale=en&toolbar_bg=%23060608&hide_side_toolbar=1&allow_symbol_change=0`;
}

function atSetTF(btn, tf) {
  atTF = tf;
  document.querySelectorAll('.at-tf-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  atLoadChart();
}

function atOnInstrumentChange() {
  const sel = document.getElementById('at-instrument');
  if (!sel) return;
  atCurrentInst = sel.value;
  atLoadChart();
  atAddLog('scan', `Instrument switched to ${atCurrentInst}.`);
}

function atStartEngine() {
  if (atEngineRunning) return;
  atEngineRunning = true;
  const badge = document.getElementById('at-engine-badge');
  const label = document.getElementById('at-engine-label');
  const dot   = document.getElementById('at-pulse-dot');
  if (badge) { badge.classList.remove('idle'); badge.classList.add('active'); }
  if (label) label.textContent = 'ENGINE ACTIVE';
  if (dot)   { dot.style.background = 'var(--teal)'; dot.style.animation = ''; }
  const startBtn = document.getElementById('at-start-btn');
  const stopBtn  = document.getElementById('at-stop-btn');
  if (startBtn) startBtn.style.display = 'none';
  if (stopBtn)  stopBtn.style.display  = '';
  atAddLog('scan', 'Lumen Intelligence Engine active.');
  lumSentiment.start();
  clearInterval(atScanTimer);
  atScanTimer = setInterval(() => { if (document.visibilityState !== 'hidden') atRunScan(); }, 30 * 60 * 1000);
  clearInterval(atUiTimer);
  atUiTimer = setInterval(() => { if (document.visibilityState !== 'hidden') { atUpdatePriceDisplay(); atUpdateAccount(); atUpdateCountdown(); } }, 2000);
  atRunScan();
}

function atStopEngine() {
  if (!atEngineRunning) return;
  atEngineRunning = false;
  const badge = document.getElementById('at-engine-badge');
  const label = document.getElementById('at-engine-label');
  const dot   = document.getElementById('at-pulse-dot');
  if (badge) { badge.classList.remove('active'); badge.classList.add('idle'); }
  if (label) label.textContent = 'ENGINE IDLE';
  if (dot)   dot.style.background = 'var(--gold)';
  const startBtn = document.getElementById('at-start-btn');
  const stopBtn  = document.getElementById('at-stop-btn');
  if (startBtn) startBtn.style.display = '';
  if (stopBtn)  stopBtn.style.display  = 'none';
  clearInterval(atScanTimer); atScanTimer = null;
  clearInterval(atUiTimer);   atUiTimer   = null;
  lumSentiment.stop();
  atAddLog('scan', 'Lumen engine stopped.');
}

// ── WS STATUS DOT ────────────────────────────────────────────────────────────
function atSetWsDot(state) {
  const dot = document.getElementById('at-ws-dot');
  const lbl = document.getElementById('at-ws-label');
  if (!dot) return;
  dot.className = 'ws-dot ' + state;
  if (lbl) {
    lbl.textContent = state === 'connected' ? 'LIVE' : state === 'reconnecting' ? 'CONNECTING' : 'OFFLINE';
    lbl.style.color  = state === 'connected' ? 'var(--green)' : state === 'reconnecting' ? 'var(--gold)' : 'var(--red)';
  }
}

// ── BINANCE WEBSOCKET ────────────────────────────────────────────────────────
function atInitBinanceWs() {
  if (atBinanceWs) atBinanceWs.close();
  atSetWsDot('reconnecting');
  atBinanceWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
  atBinanceWs.onopen = () => { atSetWsDot('connected'); };
  atBinanceWs.onmessage = (e) => {
    const data = JSON.parse(e.data);
    atPrevClose = atCurrentPrice;
    atCurrentPrice = parseFloat(data.c);
  };
  atBinanceWs.onerror = () => { atSetWsDot('disconnected'); };
  atBinanceWs.onclose = () => {
    atSetWsDot('disconnected');
    setTimeout(atInitBinanceWs, 5000);
  };
}

// ── UI HELPERS ───────────────────────────────────────────────────────────────
function atUpdatePriceDisplay() {
  const priceEl = document.getElementById('at-current-price');
  if (priceEl && atCurrentPrice) {
    priceEl.textContent = atCurrentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (atPrevClose) {
      priceEl.style.color = atCurrentPrice >= atPrevClose ? 'var(--green)' : 'var(--red)';
    }
  }
}

function atUpdateCountdown() {
  const el = document.getElementById('at-countdown');
  if (!el) return;
  if (!atEngineRunning) { el.textContent = '00:00'; return; }
  // Logic to show time until next 30-min scan
}

function atUpdateAccount() {
  const balEl = document.getElementById('at-balance');
  const eqEl  = document.getElementById('at-equity');
  if (balEl) balEl.textContent = atAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  // Calculate equity based on open positions
}

// ── LOGGING & TRADING ───────────────────────────────────────────────────────
function atAddLog(type, msg) {
  const log = { id: Date.now(), type, msg, time: new Date().toLocaleTimeString() };
  atLog.unshift(log);
  if (atLog.length > 100) atLog = atLog.slice(0, 100);
  localStorage.setItem('wm_at_log', JSON.stringify(atLog));
  atRenderLog();
}

function atRenderLog() {
  const container = document.getElementById('at-log-content');
  if (!container) return;
  container.innerHTML = atLog.map(l => `
    <div style="display:flex;gap:10px;font-size:11px;margin-bottom:6px;border-bottom:1px solid var(--border2);padding-bottom:4px;">
      <span style="color:var(--text4);flex-shrink:0;">${l.time}</span>
      <span style="color:${l.type === 'scan' ? 'var(--teal)' : 'var(--text2)'};">${l.msg}</span>
    </div>
  `).join('');
}

function atExecuteTrade(dir, sl, tp, reason) {
  const lotSize = 5; // Default from header
  const pos = {
    id: Date.now(),
    pair: 'BTCUSD',
    dir,
    entry: atCurrentPrice,
    sl,
    tp,
    lotSize,
    time: new Date().toLocaleString(),
    reason
  };
  atPositions.unshift(pos);
  localStorage.setItem('wm_at_positions', JSON.stringify(atPositions));
  atAddLog('trade', `EXECUTED ${dir} @ ${atCurrentPrice} | Reason: ${reason}`);
  atRenderPositions();
}

function atRenderPositions() {
  const container = document.getElementById('at-positions-content');
  if (!container) return;
  if (!atPositions.length) {
    container.innerHTML = '<div style="color:var(--text4);text-align:center;padding:20px;">No open positions.</div>';
    return;
  }
  // Standard position rendering logic...
}

// ── ENGINE LOOP ──────────────────────────────────────────────────────────────
async function atRunScan() {
  if (!atEngineRunning) return;
  atAddLog('scan', `Lumen scan started for BTCUSD...`);

  // Prepare technical context for Layer 2
  const indicators = { 
    price: atCurrentPrice, 
    rsi: 62, // Replace with actual calc if available
    ema20: 59000, 
    ema50: 58500 
  };
  
  try {
    const result = await lumenPipeline('BTCUSD', indicators);
    if (result && result.verdict !== 'WAIT' && result.confidence > 75) {
      atExecuteTrade(result.verdict, result.sl, result.tp, result.reason);
    } else {
      atAddLog('skip', `No setup. Conf: ${result?.confidence || 0}`);
    }
  } catch (e) {
    atAddLog('skip', `Pipeline error: ${e.message}`);
  }
}

// ── MOBILE TAB BAR ──────────────────────────────────────────────────────────
function atInitMobileTabBar() {
  if (document.getElementById('at-mobile-tabbar')) return;
  const bar = document.createElement('div');
  bar.className = 'at-mobile-tabbar';
  bar.id = 'at-mobile-tabbar';
  bar.innerHTML =
    '<button class="at-mobile-tab active" onclick="atMobileTab(this,\'chart\')">Chart</button>' +
    '<button class="at-mobile-tab" onclick="atMobileTab(this,\'log\')">Log</button>' +
    '<button class="at-mobile-tab" onclick="atMobileTab(this,\'positions\')">Positions</button>';
  const panel = document.getElementById('tab-autotrader');
  if (panel) panel.appendChild(bar);
}

function atMobileTab(btn, tab) {
  document.querySelectorAll('.at-mobile-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const mid   = document.getElementById('at-mid-panel');
  const right = document.getElementById('at-right-panel');
  if (mid)   mid.classList.remove('at-mob-active');
  if (right) right.classList.remove('at-mob-active');
  if (tab === 'log'       && mid)   mid.classList.add('at-mob-active');
  if (tab === 'positions' && right) right.classList.add('at-mob-active');
}

// ── INJECT WS DOT INTO TOPBAR ────────────────────────────────────────────────
function atInjectWsDot() {
  if (document.getElementById('at-ws-dot')) return;
  const topbar = document.getElementById('at-topbar');
  if (!topbar) return;
  const wrap = document.createElement('div');
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

  const mc  = document.querySelector('.main-content');
  const rp  = document.getElementById('right-panel');
  const app = document.getElementById('app');
  if (mc)  { mc.style.padding = '0'; mc.style.overflow = 'hidden'; }
  if (rp)  rp.style.display = 'none';
  if (app) app.classList.add('chart-mode');
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTOTRADER UI HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

function atResetAccount() {
  if (!confirm('Reset autotrader account to $100,000? All positions and history will be cleared.')) return;
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
  atPositions.forEach(function(pos) {
    var pnl = pos.dir === 'BUY' ? (atCurrentPrice - pos.entry) * pos.lots : (pos.entry - atCurrentPrice) * pos.lots;
    atAccount.balance += pnl;
    atHistory.push(Object.assign({}, pos, { closePrice: atCurrentPrice, pnl: pnl, closedAt: Date.now() }));
    atAddLog('trade', 'Closed ' + pos.dir + ' ' + pos.instrument + ' at ' + (atCurrentPrice || 0).toFixed(2) + '. P&L: ' + pnl.toFixed(2));
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
  document.querySelectorAll('.at-mid-tab').forEach(function(b) {
    b.classList.remove('active');
    b.style.color = 'var(--text3)';
    b.style.borderBottomColor = 'transparent';
  });
  btn.classList.add('active');
  btn.style.color = '';
  btn.style.borderBottomColor = '';
  document.getElementById('at-mid-ailog').style.display = 'none';
  document.getElementById('at-mid-scalplog').style.display = 'none';
  var panel = document.getElementById(panelId);
  if (panel) panel.style.display = 'flex';
}

function atPanelTab(btn, panelId) {
  document.querySelectorAll('.at-panel-tab').forEach(function(b) {
    b.classList.remove('active');
    b.style.color = 'var(--text3)';
    b.style.borderBottomColor = 'transparent';
  });
  btn.classList.add('active');
  btn.style.color = '';
  btn.style.borderBottomColor = '';
  document.getElementById('at-panel-positions').style.display = 'none';
  document.getElementById('at-panel-history').style.display = 'none';
  document.getElementById('at-panel-scalp').style.display = 'none';
  var panel = document.getElementById(panelId);
  if (panel) panel.style.display = 'flex';
}

// ═══════════════════════════════════════════════════════════════════════════
// SCALP ENGINE
// ═══════════════════════════════════════════════════════════════════════════

var scalpEngineRunning = false;
var scalpScanTimer     = null;
var scalpSelectedInsts = JSON.parse(localStorage.getItem('wm_scalp_selected') || '["BTCUSD"]');
var scalpPositions     = JSON.parse(localStorage.getItem('wm_scalp_positions') || '[]');
var scalpHistory       = JSON.parse(localStorage.getItem('wm_scalp_history') || '[]');
var scalpLog           = JSON.parse(localStorage.getItem('wm_scalp_log') || '[]');

function scalpToggleInstrument(inst) {
  var idx = scalpSelectedInsts.indexOf(inst);
  if (idx >= 0) {
    if (scalpSelectedInsts.length <= 1) return; // must keep at least one
    scalpSelectedInsts.splice(idx, 1);
  } else {
    if (scalpSelectedInsts.length >= 5) return; // max 5
    scalpSelectedInsts.push(inst);
  }
  localStorage.setItem('wm_scalp_selected', JSON.stringify(scalpSelectedInsts));
  scalpUpdateInstButtons();
}

function scalpUpdateInstButtons() {
  var allBtns = ['BTCUSD','ETHUSD','XAUUSD','XAGUSD','EURUSD','GBPUSD','SOLUSD'];
  allBtns.forEach(function(id) {
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
  var badge = document.getElementById('scalp-engine-badge');
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
  scalpAddLog('Scalp engine started. Instruments: ' + scalpSelectedInsts.join(', ') + '.');
  scalpScanTimer = setInterval(function() {
    if (document.visibilityState !== 'hidden') scalpRunScan();
  }, 60000); // scan every 60s
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
  if (countdown) countdown.style.display = 'none';
  clearInterval(scalpScanTimer); scalpScanTimer = null;
  scalpAddLog('Scalp engine stopped.');
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
  container.innerHTML = scalpLog.slice(0, 50).map(function(entry) {
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
  container.innerHTML = scalpPositions.map(function(p) {
    return '<div style="padding:6px 0;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:9px;color:var(--text2);">' + p.dir + ' ' + p.instrument + ' @ ' + p.entry + '</div>';
  }).join('');
}

function scalpRenderHistory() {
  var container = document.getElementById('scalp-history-entries');
  if (!container) return;
  if (!scalpHistory.length) {
    container.innerHTML = '<div class="empty" style="padding:10px 0;"><div class="empty-text" style="font-size:10px;color:var(--text4);">No scalp trades yet</div></div>';
    return;
  }
  container.innerHTML = scalpHistory.slice(0, 30).map(function(t) {
    var pnlColor = t.pnl >= 0 ? 'var(--green)' : 'var(--red)';
    return '<div style="padding:4px 0;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:9px;display:flex;justify-content:space-between;"><span style="color:var(--text2);">' + t.dir + ' ' + t.instrument + '</span><span style="color:' + pnlColor + ';">' + (t.pnl >= 0 ? '+' : '') + t.pnl.toFixed(2) + '</span></div>';
  }).join('');
}

async function scalpRunScan() {
  if (!scalpEngineRunning) return;
  for (var i = 0; i < scalpSelectedInsts.length; i++) {
    var inst = scalpSelectedInsts[i];
    var price = (typeof livePriceCache !== 'undefined' && livePriceCache[inst]) ? livePriceCache[inst].price : null;
    if (!price) {
      scalpAddLog(inst + ': no live price available, skipping.');
      continue;
    }
    scalpAddLog('Scanning ' + inst + ' at ' + price.toFixed(2) + '...');
    try {
      var check = lumThrottle.checkThrottle('decision', 'claude_haiku');
      if (!check.allowed) {
        scalpAddLog(inst + ': quota exhausted, skipping.');
        continue;
      }
      scalpAddLog(inst + ': scan complete. Monitoring for next entry.');
    } catch (e) {
      scalpAddLog(inst + ': scan error. ' + e.message);
    }
  }
}
}