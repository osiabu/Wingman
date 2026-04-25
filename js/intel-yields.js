'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// LUMEN INTELLIGENCE: REAL YIELDS ENGINE
// ───────────────────────────────────────────────────────────────────────────
// Tracks the US 10 year real yield (DFII10) and nominal yield (DGS10) from
// the St Louis Fed. Falling real yields are structurally bullish for gold;
// rising real yields are bearish.
//
// Cache: localStorage 24 hours. FRED publishes daily and the network round
// trip already fans through Upstash Redis on the server side, so the local
// cache is purely a network saver.
//
// Public API:
//   await LumenIntel.yields()        returns { current_real_yield, ... }
//   LumenIntel.yields.cached()       returns last cached payload or null
//   LumenIntel.yields.clear()        wipes the local cache
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  if (typeof window === 'undefined') return;
  var ROOT = window.LumenIntel = window.LumenIntel || {};

  var CACHE_KEY = 'wm_intel_yields';
  var TTL_MS = 24 * 3600 * 1000;

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (Date.now() - (parsed._fetchedAt || 0) > TTL_MS) return null;
      return parsed;
    } catch (_) { return null; }
  }

  function writeCache(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(
        Object.assign({}, payload, { _fetchedAt: Date.now() })
      ));
    } catch (_) { /* quota or private mode, ignore */ }
  }

  async function fetchSeries(series, days) {
    var r = await fetch('/api/intel?source=fred&series=' + series + '&days=' + (days || 60));
    if (!r.ok) throw new Error('FRED ' + series + ' status ' + r.status);
    var d = await r.json();
    if (!d || !Array.isArray(d.observations) || d.observations.length === 0) {
      throw new Error('FRED ' + series + ' empty');
    }
    return d.observations;
  }

  function classifyLevel(yieldVal) {
    if (yieldVal < 0)    return 'negative_real_yields_strongly_bullish_gold';
    if (yieldVal < 0.5)  return 'low_real_yields_supportive_gold';
    if (yieldVal < 1.5)  return 'moderate_real_yields_neutral';
    return 'high_real_yields_bearish_gold';
  }

  async function compute() {
    var cached = readCache();
    if (cached) return cached;

    try {
      var tips = await fetchSeries('DFII10', 60);
      var nominal = null;
      try { nominal = await fetchSeries('DGS10', 60); } catch (_) { /* nominal optional */ }

      var current = tips[tips.length - 1].value;
      var twentyAgo = tips[Math.max(0, tips.length - 21)].value;
      var direction = current < twentyAgo ? 'falling' : current > twentyAgo ? 'rising' : 'flat';
      var changeBp = Number(((current - twentyAgo) * 100).toFixed(1));

      var currentNominal = nominal ? nominal[nominal.length - 1].value : null;
      var impliedInflation = (currentNominal != null) ? Number((currentNominal - current).toFixed(2)) : null;

      var payload = {
        current_real_yield: Number(current.toFixed(3)),
        real_yield_20d_ago: Number(twentyAgo.toFixed(3)),
        direction_20d: direction,
        change_20d_basis_points: changeBp,
        level_classification: classifyLevel(current),
        macro_bias_for_gold: direction === 'falling' ? 'bullish' : direction === 'rising' ? 'bearish' : 'neutral',
        nominal_10y: currentNominal,
        implied_inflation_expectation: impliedInflation,
        as_of: tips[tips.length - 1].date,
        source: 'FRED DFII10/DGS10'
      };
      writeCache(payload);
      return payload;
    } catch (e) {
      // Fall back to a neutral payload so downstream synthesis keeps running.
      return {
        current_real_yield: null,
        direction_20d: 'unknown',
        level_classification: 'unknown',
        macro_bias_for_gold: 'neutral',
        as_of: null,
        source: 'unavailable',
        error: e.message
      };
    }
  }

  ROOT.yields = compute;
  ROOT.yields.cached = readCache;
  ROOT.yields.clear  = function () { try { localStorage.removeItem(CACHE_KEY); } catch (_) {} };
})();
