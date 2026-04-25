'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// LUMEN INTELLIGENCE: WYCKOFF PHASE DETECTOR
// ───────────────────────────────────────────────────────────────────────────
// Classifies the current market phase using the Wyckoff Method:
//   Accumulation, Markup, Distribution, Markdown
// plus the structural sub events the framework names: SC, AR, ST, Spring,
// LPS, SOS for accumulation; PSY, BC, AR, ST, SOW, LPSY, UTAD for
// distribution.
//
// Method: pull the last H4 candles, compute range and position metrics,
// summarise the last ten bars, then ask Sonnet to classify the phase. The
// result is cached against the latest H4 bar timestamp so the LLM only
// fires when a new H4 candle closes (six times per day per instrument
// maximum). This keeps every Wingman client well inside the existing daily
// LLM budget without a separate quota.
//
// Public API:
//   await LumenIntel.wyckoff(instrument)        returns analysis object
//   LumenIntel.wyckoff.cached(instrument)       returns last cached payload
//   LumenIntel.wyckoff.clear(instrument)        wipes the local cache
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  if (typeof window === 'undefined') return;
  var ROOT = window.LumenIntel = window.LumenIntel || {};

  var keyFor = function (inst) { return 'wm_intel_wyckoff_' + inst; };
  var TTL_MS = 4 * 3600 * 1000; // safety net even if bar timestamp is missing

  var WYCKOFF_SYSTEM = [
    'You are Lumen, a market intelligence engine grounded in the Wyckoff Method.',
    'Classify the current market phase from the structured price summary you receive.',
    'You return only valid JSON. No prose outside JSON. No hyphens.',
    'Output format:',
    '{"phase":"Accumulation|Markup|Distribution|Markdown|Transition",',
    ' "sub_phase":"string under thirty characters or null",',
    ' "confidence":float between zero and one,',
    ' "narrative":"two short sentences in plain English"}',
    'Phase definitions:',
    'Accumulation: institutional absorption inside a basing range. Look for SC, AR, ST, Spring, LPS, SOS.',
    'Markup: trending higher after accumulation. Higher highs and higher lows on the range break.',
    'Distribution: institutional offloading at the highs. Look for PSY, BC, AR, ST, SOW, LPSY, UTAD.',
    'Markdown: trending lower after distribution. Lower highs and lower lows on the range break.',
    'Transition: data is mixed. Use only when phase is genuinely ambiguous.',
    'Set sub_phase to one of SC, AR, ST, Spring, LPS, SOS, PSY, BC, SOW, LPSY, UTAD when a specific event is visible.',
    'Set confidence below 0.5 when evidence conflicts. Be honest about ambiguity.'
  ].join('\n');

  function summariseCandle(c, prevClose) {
    var open  = parseFloat(c.open);
    var high  = parseFloat(c.high);
    var low   = parseFloat(c.low);
    var close = parseFloat(c.close);
    var direction = close > open ? 'up' : close < open ? 'down' : 'flat';
    var spread = high - low;
    var changePct = prevClose ? Number((((close - prevClose) / prevClose) * 100).toFixed(2)) : 0;
    return {
      time: c.datetime,
      o: open, h: high, l: low, c: close,
      dir: direction,
      spread: Number(spread.toFixed(5)),
      changePct: changePct
    };
  }

  function readCache(inst) {
    try {
      var raw = localStorage.getItem(keyFor(inst));
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return null;
      return p;
    } catch (_) { return null; }
  }

  function writeCache(inst, payload) {
    try {
      localStorage.setItem(keyFor(inst),
        JSON.stringify(Object.assign({}, payload, { _fetchedAt: Date.now() })));
    } catch (_) {}
  }

  function fallback(inst, reason) {
    return {
      instrument: inst,
      phase: 'Transition',
      sub_phase: null,
      confidence: 0,
      narrative: 'Wyckoff phase unavailable. ' + reason,
      source: 'unavailable'
    };
  }

  async function compute(inst) {
    if (typeof fetchCandles !== 'function') return fallback(inst, 'fetchCandles helper missing.');

    var candles;
    try {
      candles = await fetchCandles(inst, '4h', 100);
    } catch (e) {
      // Fall back to last cached value if available, otherwise neutral.
      var prior = readCache(inst);
      if (prior) return prior;
      return fallback(inst, 'candle fetch failed: ' + e.message);
    }
    if (!Array.isArray(candles) || candles.length < 30) {
      var priorShort = readCache(inst);
      if (priorShort) return priorShort;
      return fallback(inst, 'insufficient candle history.');
    }

    // Newest first from fetchCandles. Latest bar drives the cache key.
    var latestBarTime = candles[0].datetime;
    var cached = readCache(inst);
    if (cached && cached.basedOnBarTime === latestBarTime
        && (Date.now() - (cached._fetchedAt || 0)) < TTL_MS) {
      return cached;
    }

    // Chronological order for math.
    var chrono = candles.slice().reverse();
    var closes = chrono.map(function (c) { return parseFloat(c.close); });
    var highs  = chrono.map(function (c) { return parseFloat(c.high); });
    var lows   = chrono.map(function (c) { return parseFloat(c.low); });

    var rangeHigh = Math.max.apply(null, highs);
    var rangeLow  = Math.min.apply(null, lows);
    var current = closes[closes.length - 1];
    var pricePosition = (current - rangeLow) / Math.max(1e-9, rangeHigh - rangeLow);

    // Average true range proxy from the last fifty bars.
    var atrLookback = Math.min(50, chrono.length - 1);
    var atrSum = 0;
    for (var i = chrono.length - atrLookback; i < chrono.length; i++) {
      var prev = closes[i - 1];
      var hi = highs[i], lo = lows[i];
      atrSum += Math.max(hi - lo, Math.abs(hi - prev), Math.abs(lo - prev));
    }
    var atr = atrSum / atrLookback;

    // Last ten bars summary for the LLM context.
    var lastTen = [];
    for (var j = Math.max(1, chrono.length - 10); j < chrono.length; j++) {
      lastTen.push(summariseCandle(chrono[j], closes[j - 1]));
    }

    // Cumulative range vs ATR helps the LLM detect compression vs expansion.
    var rangeAtrRatio = Number(((rangeHigh - rangeLow) / Math.max(1e-9, atr)).toFixed(2));

    var context = {
      instrument: inst,
      timeframe: '4h',
      bars_analysed: chrono.length,
      latest_bar_time: latestBarTime,
      current_price: Number(current.toFixed(5)),
      range_high: Number(rangeHigh.toFixed(5)),
      range_low: Number(rangeLow.toFixed(5)),
      price_position_in_range: Number(pricePosition.toFixed(3)),
      atr_50: Number(atr.toFixed(5)),
      range_atr_ratio: rangeAtrRatio,
      last_ten_bars: lastTen
    };

    try {
      var r = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          system: WYCKOFF_SYSTEM,
          messages: [{ role: 'user', content: JSON.stringify(context) }]
        })
      });
      if (!r.ok) throw new Error('scan status ' + r.status);
      var d = await r.json();
      var text = d && d.content && d.content[0] && d.content[0].text;
      var parsed = (typeof safeParseJSON === 'function' ? safeParseJSON(text) : null);
      if (!parsed || !parsed.phase) throw new Error('no usable phase in response');

      var payload = {
        instrument: inst,
        phase: parsed.phase,
        sub_phase: parsed.sub_phase || null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        narrative: parsed.narrative || '',
        basedOnBarTime: latestBarTime,
        rangeHigh: context.range_high,
        rangeLow: context.range_low,
        pricePosition: context.price_position_in_range,
        source: 'sonnet-4-6'
      };
      writeCache(inst, payload);
      return payload;
    } catch (e) {
      var stale = readCache(inst);
      if (stale) {
        stale.narrative = (stale.narrative || '') + ' (stale, refresh failed)';
        return stale;
      }
      return fallback(inst, 'detector call failed: ' + e.message);
    }
  }

  ROOT.wyckoff = compute;
  ROOT.wyckoff.cached = readCache;
  ROOT.wyckoff.clear = function (inst) {
    try {
      if (inst) localStorage.removeItem(keyFor(inst));
    } catch (_) {}
  };
})();
