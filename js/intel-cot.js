'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// LUMEN INTELLIGENCE: COT (COMMITMENT OF TRADERS)
// ───────────────────────────────────────────────────────────────────────────
// Pulls the CFTC Legacy Combined report from /api/cot for an asset and
// derives a positioning bias from the 26 week range.
//
// A commercial net at the 90th percentile typically marks extreme bearish
// hedging and often precedes a turn higher. A commercial net at the 10th
// percentile marks extreme bullish institutional demand. The dispersion
// between commercial and large speculator percentiles is the divergence
// score.
//
// Cache: localStorage 7 days (CFTC publishes Friday).
//
// Public API:
//   await LumenIntel.cot('gold')         returns analysis object
//   LumenIntel.cot.legacyCacheRow(asset) returns { commercial, large, small }
//                                        in the historical COT_CACHE shape
//                                        used by the Markets tab renderer
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  if (typeof window === 'undefined') return;
  var ROOT = window.LumenIntel = window.LumenIntel || {};

  var TTL_MS = 7 * 24 * 3600 * 1000;
  var keyFor = function (asset) { return 'wm_intel_cot_' + asset; };

  function readCache(asset) {
    try {
      var raw = localStorage.getItem(keyFor(asset));
      if (!raw) return null;
      var p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return null;
      if (Date.now() - (p._fetchedAt || 0) > TTL_MS) return null;
      return p;
    } catch (_) { return null; }
  }

  function writeCache(asset, payload) {
    try {
      localStorage.setItem(keyFor(asset),
        JSON.stringify(Object.assign({}, payload, { _fetchedAt: Date.now() })));
    } catch (_) {}
  }

  function percentile(arr, value) {
    if (!arr.length) return 50;
    var below = 0;
    for (var i = 0; i < arr.length; i++) if (arr[i] <= value) below++;
    return (below / arr.length) * 100;
  }

  function classifyBias(commPct, specPct) {
    if (commPct > 75 && specPct < 25) return 'strongly_bullish';
    if (commPct > 60)                  return 'mildly_bullish';
    if (commPct < 25 && specPct > 75) return 'strongly_bearish';
    if (commPct < 40)                  return 'mildly_bearish';
    return 'neutral';
  }

  async function compute(asset) {
    asset = String(asset || 'gold').toLowerCase();
    var cached = readCache(asset);
    if (cached) return cached;

    try {
      var r = await fetch('/api/intel?source=cot&asset=' + encodeURIComponent(asset) + '&weeks=26');
      if (!r.ok) throw new Error('cot status ' + r.status);
      var d = await r.json();
      if (!d || !Array.isArray(d.series) || d.series.length === 0) throw new Error('cot empty');

      // Server returns newest first; reverse for chronological math.
      var series = d.series.slice().reverse();
      var commNets = series.map(function (w) { return w.commercial_net; });
      var specNets = series.map(function (w) { return w.spec_net; });
      var latest = series[series.length - 1];

      var commPct = percentile(commNets, latest.commercial_net);
      var specPct = percentile(specNets, latest.spec_net);
      var divergence = Math.abs(commPct - (100 - specPct)) / 100;

      var payload = {
        asset: asset,
        commercial_net_current: latest.commercial_net,
        commercial_long: latest.commercial_long,
        commercial_short: latest.commercial_short,
        spec_long: latest.spec_long,
        spec_short: latest.spec_short,
        small_net: latest.small_net,
        commercial_percentile_26w: Number(commPct.toFixed(1)),
        spec_large_percentile_26w: Number(specPct.toFixed(1)),
        divergence_score: Number(divergence.toFixed(3)),
        cot_bias: classifyBias(commPct, specPct),
        week_ending: latest.week_ending,
        weeks_available: series.length,
        source: 'CFTC Legacy Combined'
      };
      writeCache(asset, payload);
      return payload;
    } catch (e) {
      return {
        asset: asset,
        cot_bias: 'unknown',
        commercial_net_current: null,
        week_ending: null,
        source: 'unavailable',
        error: e.message
      };
    }
  }

  // Returns {commercial, large, small, updated} matching the legacy
  // COT_CACHE shape used by markets.js renderCotReport. Falls back to the
  // last cached value when network is unavailable.
  function legacyCacheRow(asset) {
    var cached = readCache(asset);
    if (!cached) return null;
    return {
      commercial: cached.commercial_net_current,
      large: (cached.spec_long || 0) - (cached.spec_short || 0),
      small: cached.small_net,
      updated: cached.week_ending || 'Latest available',
      bias: cached.cot_bias,
      pct_commercial_26w: cached.commercial_percentile_26w
    };
  }

  ROOT.cot = compute;
  ROOT.cot.cached = readCache;
  ROOT.cot.legacyCacheRow = legacyCacheRow;
  ROOT.cot.clear = function (asset) {
    try {
      if (asset) localStorage.removeItem(keyFor(asset));
      else {
        ['gold','silver','copper','oil','natgas','eurusd','gbpusd','jpyusd','chfusd','cadusd','audusd','nzdusd','dxy','btc','ether'].forEach(function (a) {
          localStorage.removeItem(keyFor(a));
        });
      }
    } catch (_) {}
  };
})();
