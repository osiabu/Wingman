'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// LUMEN INTELLIGENCE: LIQUIDITY POOL MAPPER
// ───────────────────────────────────────────────────────────────────────────
// Identifies where retail stop orders are likely clustered. Liquidity pools
// sit above swing highs and below swing lows, at round numbers, at prior
// session highs and lows, and at weekly and monthly open levels.
//
// Strength of a level scales with: number of touches, recency, and
// alignment across multiple timeframes. The output is a ranked list of
// the three nearest pools above and below the current price.
//
// All computation is browser side. The H1, H4 and D1 candle pulls go
// through the Redis cached /api/candles route on non crypto, and direct
// to Binance on crypto.
//
// Cache: localStorage one hour, keyed by latest H1 bar timestamp.
//
// Public API:
//   await LumenIntel.liquidity(instrument)        returns analysis object
//   LumenIntel.liquidity.cached(instrument)       returns last cached payload
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  if (typeof window === 'undefined') return;
  var ROOT = window.LumenIntel = window.LumenIntel || {};

  var keyFor = function (inst) { return 'wm_intel_liquidity_' + inst; };
  var TTL_MS = 60 * 60 * 1000;

  // ── Helpers ───────────────────────────────────────────────────────────────

  // A swing high is a candle whose high exceeds the highs of the surrounding
  // 'window' bars on each side. Same idea for swing lows.
  function detectSwings(candles, win, kind) {
    var out = [];
    if (!Array.isArray(candles) || candles.length < win * 2 + 1) return out;
    for (var i = win; i < candles.length - win; i++) {
      var h = parseFloat(candles[i].high);
      var l = parseFloat(candles[i].low);
      var isHigh = true, isLow = true;
      for (var j = 1; j <= win; j++) {
        if (parseFloat(candles[i - j].high) >= h) isHigh = false;
        if (parseFloat(candles[i + j].high) >= h) isHigh = false;
        if (parseFloat(candles[i - j].low)  <= l) isLow = false;
        if (parseFloat(candles[i + j].low)  <= l) isLow = false;
      }
      if (kind === 'high' && isHigh) out.push({ price: h, time: candles[i].datetime });
      if (kind === 'low'  && isLow)  out.push({ price: l, time: candles[i].datetime });
    }
    return out;
  }

  function roundNumberStep(price) {
    if (price >= 50000) return 1000;     // BTC
    if (price >= 5000)  return 100;
    if (price >= 1000)  return 50;
    if (price >= 100)   return 5;
    if (price >= 10)    return 1;
    if (price >= 1)     return 0.1;
    return 0.01;
  }

  function generateRoundNumbers(low, high, price) {
    var step = roundNumberStep(price);
    var levels = [];
    var first = Math.ceil(low / step) * step;
    for (var p = first; p <= high; p = Number((p + step).toFixed(6))) {
      levels.push(Number(p.toFixed(6)));
    }
    return levels;
  }

  function getWeeklyOpen(candlesD1) {
    if (!Array.isArray(candlesD1) || !candlesD1.length) return null;
    // Candles are newest first. Walk back to the most recent Monday opening.
    for (var i = 0; i < candlesD1.length; i++) {
      var d = new Date(candlesD1[i].datetime);
      if (d.getUTCDay() === 1) return parseFloat(candlesD1[i].open);
    }
    return parseFloat(candlesD1[candlesD1.length - 1].open);
  }

  function getMonthlyOpen(candlesD1) {
    if (!Array.isArray(candlesD1) || !candlesD1.length) return null;
    // First trading day of the most recent calendar month.
    for (var i = 0; i < candlesD1.length; i++) {
      var d = new Date(candlesD1[i].datetime);
      if (d.getUTCDate() <= 3) return parseFloat(candlesD1[i].open);
    }
    return null;
  }

  // ── Cache ─────────────────────────────────────────────────────────────────

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
      current_price: null,
      liquidity_above: [],
      liquidity_below: [],
      narrative: 'Liquidity map unavailable. ' + reason,
      source: 'unavailable'
    };
  }

  // ── Public ────────────────────────────────────────────────────────────────

  async function compute(inst) {
    if (typeof fetchCandles !== 'function') return fallback(inst, 'fetchCandles helper missing.');

    var h1, h4, d1;
    try {
      var pulls = await Promise.all([
        fetchCandles(inst, '1h', 168),    // one week
        fetchCandles(inst, '4h', 120),    // three weeks
        fetchCandles(inst, '1day', 60)    // two months
      ]);
      h1 = pulls[0]; h4 = pulls[1]; d1 = pulls[2];
    } catch (e) {
      var prior = readCache(inst);
      return prior || fallback(inst, 'candle fetch failed: ' + e.message);
    }
    if (!Array.isArray(h1) || h1.length < 24) {
      var priorShort = readCache(inst);
      return priorShort || fallback(inst, 'insufficient H1 candle history.');
    }

    var latestBarTime = h1[0].datetime;
    var cached = readCache(inst);
    if (cached && cached.basedOnBarTime === latestBarTime
        && (Date.now() - (cached._fetchedAt || 0)) < TTL_MS) {
      return cached;
    }

    var current = parseFloat(h1[0].close);
    var swingsH1High = detectSwings(h1, 3, 'high');
    var swingsH1Low  = detectSwings(h1, 3, 'low');
    var swingsH4High = detectSwings(h4 || [], 4, 'high');
    var swingsH4Low  = detectSwings(h4 || [], 4, 'low');
    var swingsD1High = detectSwings(d1 || [], 5, 'high');
    var swingsD1Low  = detectSwings(d1 || [], 5, 'low');

    // Aggregate swings into one list with weights by timeframe.
    var swings = [];
    swingsH1High.forEach(function (s) { swings.push({ price: s.price, type: 'swing_high', tf: 'H1', weight: 1, time: s.time }); });
    swingsH1Low.forEach(function (s)  { swings.push({ price: s.price, type: 'swing_low',  tf: 'H1', weight: 1, time: s.time }); });
    swingsH4High.forEach(function (s) { swings.push({ price: s.price, type: 'swing_high', tf: 'H4', weight: 2, time: s.time }); });
    swingsH4Low.forEach(function (s)  { swings.push({ price: s.price, type: 'swing_low',  tf: 'H4', weight: 2, time: s.time }); });
    swingsD1High.forEach(function (s) { swings.push({ price: s.price, type: 'swing_high', tf: 'D1', weight: 3, time: s.time }); });
    swingsD1Low.forEach(function (s)  { swings.push({ price: s.price, type: 'swing_low',  tf: 'D1', weight: 3, time: s.time }); });

    // Round numbers within +/- 2 percent of current price.
    var rounds = generateRoundNumbers(current * 0.98, current * 1.02, current);
    rounds.forEach(function (price) {
      swings.push({ price: price, type: 'round_number', tf: 'all', weight: 1, time: null });
    });

    // Session levels.
    var yesterdayH = h1.length >= 24 ? Math.max.apply(null, h1.slice(0, 24).map(function (c) { return parseFloat(c.high); })) : null;
    var yesterdayL = h1.length >= 24 ? Math.min.apply(null, h1.slice(0, 24).map(function (c) { return parseFloat(c.low);  })) : null;
    var weeklyOpen  = getWeeklyOpen(d1);
    var monthlyOpen = getMonthlyOpen(d1);

    if (yesterdayH != null) swings.push({ price: yesterdayH, type: 'yesterday_high', tf: 'H1', weight: 2, time: null });
    if (yesterdayL != null) swings.push({ price: yesterdayL, type: 'yesterday_low',  tf: 'H1', weight: 2, time: null });
    if (weeklyOpen  != null) swings.push({ price: weeklyOpen,  type: 'weekly_open',  tf: 'D1', weight: 2, time: null });
    if (monthlyOpen != null) swings.push({ price: monthlyOpen, type: 'monthly_open', tf: 'D1', weight: 3, time: null });

    // Cluster nearby levels (within 0.1 percent of each other) and sum weights.
    var clusterTol = current * 0.001;
    var clusters = [];
    swings.sort(function (a, b) { return a.price - b.price; });
    swings.forEach(function (s) {
      var existing = clusters.find(function (c) { return Math.abs(c.price - s.price) <= clusterTol; });
      if (existing) {
        existing.weight += s.weight;
        existing.touches += 1;
        existing.types.add(s.type);
        existing.tfs.add(s.tf);
      } else {
        clusters.push({
          price: Number(s.price.toFixed(6)),
          weight: s.weight,
          touches: 1,
          types: new Set([s.type]),
          tfs: new Set([s.tf])
        });
      }
    });

    // Score = weight + touches bonus + multi timeframe bonus.
    clusters.forEach(function (c) {
      c.score = c.weight + (c.touches > 1 ? c.touches * 0.5 : 0)
        + (c.tfs.size > 1 ? c.tfs.size : 0);
      c.types = Array.from(c.types);
      c.tfs   = Array.from(c.tfs);
    });

    var above = clusters.filter(function (c) { return c.price > current; })
      .sort(function (a, b) { return a.price - b.price; }).slice(0, 5);
    var below = clusters.filter(function (c) { return c.price < current; })
      .sort(function (a, b) { return b.price - a.price; }).slice(0, 5);

    // Trim to top three by score, keeping the nearest first ordering.
    above = above.sort(function (a, b) { return b.score - a.score; }).slice(0, 3)
      .sort(function (a, b) { return a.price - b.price; });
    below = below.sort(function (a, b) { return b.score - a.score; }).slice(0, 3)
      .sort(function (a, b) { return b.price - a.price; });

    var payload = {
      instrument: inst,
      current_price: Number(current.toFixed(6)),
      liquidity_above: above,
      liquidity_below: below,
      yesterday_high: yesterdayH,
      yesterday_low: yesterdayL,
      weekly_open: weeklyOpen,
      monthly_open: monthlyOpen,
      basedOnBarTime: latestBarTime,
      source: 'browser'
    };
    writeCache(inst, payload);
    return payload;
  }

  ROOT.liquidity = compute;
  ROOT.liquidity.cached = readCache;
  ROOT.liquidity.clear = function (inst) {
    try { if (inst) localStorage.removeItem(keyFor(inst)); } catch (_) {}
  };
})();
