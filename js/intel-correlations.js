'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// LUMEN INTELLIGENCE: DYNAMIC CORRELATION MATRIX
// ───────────────────────────────────────────────────────────────────────────
// Maintains a live Pearson correlation matrix across the Wingman intelligence
// universe. Detects pairs whose correlation is at a structural extreme or
// breaking down vs the historical average, both of which are tradeable
// signals in their own right.
//
// Refresh cadence: every 4 hours, gated by the latest H4 bar timestamp on
// the anchor instrument so the matrix only rebuilds when fresh candles
// arrive. Each candle pull goes through the existing /api/candles route
// which is Upstash Redis cached at 2 hour TTL on H4.
//
// Public API:
//   await LumenIntel.correlations()        returns { matrix, breakdowns, ... }
//   LumenIntel.correlations.cached()       returns last cached payload
//   LumenIntel.correlations.clear()        wipes the cache
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  if (typeof window === 'undefined') return;
  var ROOT = window.LumenIntel = window.LumenIntel || {};

  var CACHE_KEY = 'wm_intel_correlations';
  var TTL_MS = 4 * 3600 * 1000;
  var ANCHOR = 'XAUUSD';

  // The blueprint Tier 1+2+3 universe. Crypto correlates loosely; metals,
  // FX and indices anchor the macro thesis. AUDUSD is included for the
  // gold producer linkage.
  var UNIVERSE = [
    'XAUUSD','XAGUSD','EURUSD','USDJPY','GBPUSD','USDCAD','AUDUSD',
    'US30','SPX500','NAS100','USOIL','BTCUSD','ETHUSD'
  ];

  // ── Math helpers ──────────────────────────────────────────────────────────

  function pctReturns(closes) {
    var out = [];
    for (var i = 1; i < closes.length; i++) {
      var prev = closes[i - 1];
      if (prev) out.push((closes[i] - prev) / prev);
    }
    return out;
  }

  function pearson(a, b) {
    var n = Math.min(a.length, b.length);
    if (n < 5) return 0;
    var meanA = 0, meanB = 0;
    for (var i = 0; i < n; i++) { meanA += a[i]; meanB += b[i]; }
    meanA /= n; meanB /= n;
    var num = 0, denA = 0, denB = 0;
    for (var j = 0; j < n; j++) {
      var da = a[j] - meanA, db = b[j] - meanB;
      num += da * db;
      denA += da * da;
      denB += db * db;
    }
    var den = Math.sqrt(denA * denB);
    return den ? num / den : 0;
  }

  // ── Cache ─────────────────────────────────────────────────────────────────

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return null;
      if (Date.now() - (p._fetchedAt || 0) > TTL_MS) return null;
      return p;
    } catch (_) { return null; }
  }

  function writeCache(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(
        Object.assign({}, payload, { _fetchedAt: Date.now() })
      ));
    } catch (_) {}
  }

  function fallback(reason) {
    return {
      matrix: {},
      breakdowns: [],
      anchor: ANCHOR,
      universe: UNIVERSE,
      narrative: 'Correlation matrix unavailable. ' + reason,
      source: 'unavailable'
    };
  }

  // ── Public ────────────────────────────────────────────────────────────────

  // Returns the correlation between two instruments from the cached matrix
  // when available. Convenience helper for the portfolio module.
  function lookup(a, b) {
    var cached = readCache();
    if (!cached || !cached.matrix) return null;
    var row = cached.matrix[a];
    if (!row) return null;
    return typeof row[b] === 'number' ? row[b] : null;
  }

  async function compute() {
    if (typeof fetchCandles !== 'function') return fallback('fetchCandles helper missing.');

    var cached = readCache();
    if (cached) return cached;

    // Pull H4 candles for every instrument in the universe in parallel.
    // /api/candles is Upstash Redis cached at 2 hour TTL on H4 so the
    // first browser to call this in any 2 hour window pays the upstream
    // cost; everyone else hits Redis.
    var pulls = UNIVERSE.map(function (inst) {
      return fetchCandles(inst, '4h', 100)
        .then(function (candles) { return { inst: inst, candles: candles }; })
        .catch(function (e) { return { inst: inst, error: e.message }; });
    });

    var results;
    try {
      results = await Promise.all(pulls);
    } catch (e) {
      return fallback('candle fetch failed: ' + e.message);
    }

    var available = {};
    var anchorBarTime = null;
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      if (r.error || !Array.isArray(r.candles) || r.candles.length < 30) continue;
      var closes = r.candles.slice().reverse()
        .map(function (c) { return parseFloat(c.close); })
        .filter(function (n) { return Number.isFinite(n); });
      if (closes.length < 30) continue;
      available[r.inst] = pctReturns(closes);
      if (r.inst === ANCHOR) anchorBarTime = r.candles[0].datetime;
    }

    var instruments = Object.keys(available);
    if (instruments.length < 3) return fallback('too few instruments returned candles.');

    var matrix = {};
    var BREAKDOWN_THRESHOLD = 0.35;
    var breakdowns = [];

    // Historical correlation reference: long arm of the same return series.
    // We split each return series in half and compare current half vs prior
    // half to detect breakdowns without a separate 90 day fetch.
    var historical = {};
    for (var k = 0; k < instruments.length; k++) {
      var inst = instruments[k];
      var rets = available[inst];
      var halfPoint = Math.max(15, Math.floor(rets.length / 2));
      historical[inst] = {
        recent: rets.slice(-halfPoint),
        older:  rets.slice(0, halfPoint)
      };
    }

    for (var x = 0; x < instruments.length; x++) {
      var instA = instruments[x];
      matrix[instA] = matrix[instA] || {};
      for (var y = x; y < instruments.length; y++) {
        var instB = instruments[y];
        if (instA === instB) { matrix[instA][instB] = 1.0; continue; }

        var current = pearson(historical[instA].recent, historical[instB].recent);
        var prior   = pearson(historical[instA].older,  historical[instB].older);
        matrix[instA][instB] = Number(current.toFixed(3));
        matrix[instB] = matrix[instB] || {};
        matrix[instB][instA] = Number(current.toFixed(3));

        var delta = Math.abs(current - prior);
        if (delta >= BREAKDOWN_THRESHOLD) {
          breakdowns.push({
            pair: instA + '/' + instB,
            historical_corr: Number(prior.toFixed(3)),
            current_corr: Number(current.toFixed(3)),
            breakdown_magnitude: Number(delta.toFixed(3))
          });
        }
      }
    }

    breakdowns.sort(function (a, b) { return b.breakdown_magnitude - a.breakdown_magnitude; });

    var payload = {
      matrix: matrix,
      breakdowns: breakdowns.slice(0, 6),
      anchor: ANCHOR,
      universe: instruments,
      missing: UNIVERSE.filter(function (u) { return !available[u]; }),
      anchor_bar_time: anchorBarTime,
      source: 'browser'
    };
    writeCache(payload);
    return payload;
  }

  ROOT.correlations = compute;
  ROOT.correlations.cached = readCache;
  ROOT.correlations.lookup = lookup;
  ROOT.correlations.universe = UNIVERSE;
  ROOT.correlations.clear = function () { try { localStorage.removeItem(CACHE_KEY); } catch (_) {} };
})();
