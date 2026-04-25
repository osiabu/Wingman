'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// LUMEN INTELLIGENCE: PORTFOLIO AWARENESS LAYER
// ───────────────────────────────────────────────────────────────────────────
// Reads every open position across the three Wingman execution surfaces:
//   - Lumen Intraday (wm_at_positions)
//   - Lumen Scalper  (wm_scalp_positions)
//   - Sim Trader     (wm_sim_trades, status open)
//
// Computes total risk percentage, cumulative directional exposure, and
// detects clusters of correlated positions that may secretly represent
// the same macro thesis. Uses the cached correlation matrix from
// LumenIntel.correlations.lookup so this layer never refetches candles
// itself.
//
// Public API:
//   LumenIntel.portfolio()                    returns analysis object
//   LumenIntel.portfolio.cluster(positions)   pure helper for diagnostics
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  if (typeof window === 'undefined') return;
  var ROOT = window.LumenIntel = window.LumenIntel || {};

  function safeJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_) { return fallback; }
  }

  function normalisePosition(p, source) {
    if (!p) return null;
    var direction = (p.dir || p.direction || '').toUpperCase();
    if (direction !== 'BUY' && direction !== 'SELL') return null;
    var instrument = p.instrument || p.pair || null;
    if (!instrument) return null;
    var lots = parseFloat(p.lots != null ? p.lots : p.lotSize);
    if (!Number.isFinite(lots)) lots = 0.01;
    var entry = parseFloat(p.entry);
    var sl    = parseFloat(p.sl);
    var riskPerUnit = (Number.isFinite(entry) && Number.isFinite(sl)) ? Math.abs(entry - sl) : null;
    return {
      source: source,
      instrument: instrument,
      direction: direction,
      lots: lots,
      entry: Number.isFinite(entry) ? entry : null,
      sl: Number.isFinite(sl) ? sl : null,
      tp: Number.isFinite(parseFloat(p.tp)) ? parseFloat(p.tp) : null,
      risk_per_unit: riskPerUnit,
      opened_at: p.openedAt || p.time || null
    };
  }

  function readAllOpenPositions() {
    var atPos    = safeJSON('wm_at_positions', []);
    var scalpPos = safeJSON('wm_scalp_positions', []);
    var simTrades = safeJSON('wm_sim_trades', []);
    var simOpen = simTrades.filter(function (t) { return t && (t.status === 'open' || t.open === true || t.closedAt == null && t.exit == null); });

    var positions = [];
    atPos.forEach(function (p)    { var n = normalisePosition(p, 'lumen_intraday'); if (n) positions.push(n); });
    scalpPos.forEach(function (p) { var n = normalisePosition(p, 'lumen_scalper');  if (n) positions.push(n); });
    simOpen.forEach(function (p)  { var n = normalisePosition(p, 'sim_trader');     if (n) positions.push(n); });
    return positions;
  }

  function estimateRiskPct(p, accountBalance) {
    if (!accountBalance || !p.risk_per_unit) return null;
    // Rough proxy: risk_per_unit * lots, expressed as a percent of balance.
    // The exact tick value varies by instrument so we only use this as an
    // ordering signal between positions, not an exact dollar value.
    var dollarRisk = p.risk_per_unit * p.lots * 100; // multiply by a coarse contract size proxy
    return Number(((dollarRisk / accountBalance) * 100).toFixed(2));
  }

  function lookupCorrelation(a, b) {
    if (a === b) return 1;
    if (ROOT.correlations && typeof ROOT.correlations.lookup === 'function') {
      var v = ROOT.correlations.lookup(a, b);
      if (v != null) return v;
    }
    return null;
  }

  function detectClusters(positions) {
    var clusters = [];
    for (var i = 0; i < positions.length; i++) {
      for (var j = i + 1; j < positions.length; j++) {
        var pa = positions[i], pb = positions[j];
        var corr = lookupCorrelation(pa.instrument, pb.instrument);
        if (corr == null) continue;
        var effective = pa.direction === pb.direction ? corr : -corr;
        if (effective >= 0.6) {
          clusters.push({
            position_a: pa.instrument + ' ' + pa.direction + ' (' + pa.source + ')',
            position_b: pb.instrument + ' ' + pb.direction + ' (' + pb.source + ')',
            correlation: Number(corr.toFixed(3)),
            effective_correlation: Number(effective.toFixed(3)),
            warning: 'These positions may represent the same macro thesis.'
          });
        }
      }
    }
    return clusters;
  }

  function compute() {
    var positions = readAllOpenPositions();
    var atAccount = safeJSON('wm_at_account', null);
    var simAccount = safeJSON('wm_sim_account', null);
    var balance = (atAccount && atAccount.balance) || (simAccount && simAccount.balance) || null;

    var totalRiskPct = 0;
    var directionalCount = { BUY: 0, SELL: 0 };
    positions.forEach(function (p) {
      var r = estimateRiskPct(p, balance);
      if (r) totalRiskPct += r;
      directionalCount[p.direction] += 1;
    });

    var clusters = detectClusters(positions);
    var health = (totalRiskPct > 6 || clusters.length > 0) ? 'caution' : 'healthy';

    return {
      open_positions_count: positions.length,
      open_positions: positions,
      total_risk_percentage: Number(totalRiskPct.toFixed(2)),
      directional_count: directionalCount,
      correlated_clusters: clusters,
      portfolio_health: health,
      account_balance: balance,
      narrative: positions.length === 0
        ? 'No open positions across Lumen and Sim Trader.'
        : clusters.length > 0
        ? 'Caution: ' + clusters.length + ' correlated cluster' + (clusters.length === 1 ? '' : 's') + ' detected.'
        : 'Portfolio healthy. ' + positions.length + ' open position' + (positions.length === 1 ? '' : 's') + '.'
    };
  }

  ROOT.portfolio = compute;
  ROOT.portfolio.cluster = detectClusters;
})();
