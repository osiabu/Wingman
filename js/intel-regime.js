'use strict';
// ═══════════════════════════════════════════════════════════════════════════
// LUMEN INTELLIGENCE: MARKET REGIME CLASSIFIER
// ───────────────────────────────────────────────────────────────────────────
// Classifies the current market environment along two dimensions:
//   trend character: Strong Uptrend, Weak Uptrend, Ranging,
//                    Weak Downtrend, Strong Downtrend
//   volatility character: Compression, Normal, Elevated, Spike
//
// All computation runs in the browser. No LLM call. No daily budget impact.
// Uses ADX 14 for trend strength, ATR 14 with a percentile vs the lookback
// window for volatility level, and Bollinger band width percentile for
// compression detection. Combines the result with the cached Wyckoff phase
// when available to refine the label.
//
// Cache: localStorage four hours, keyed by latest H4 bar time.
//
// Public API:
//   await LumenIntel.regime(instrument)         returns analysis object
//   LumenIntel.regime.cached(instrument)        returns last cached payload
//   LumenIntel.regime.clear(instrument)         wipes the local cache
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  if (typeof window === 'undefined') return;
  var ROOT = window.LumenIntel = window.LumenIntel || {};

  var keyFor = function (inst) { return 'wm_intel_regime_' + inst; };
  var TTL_MS = 4 * 3600 * 1000;

  // ── Pure JS indicator math ────────────────────────────────────────────────

  function sma(values, period) {
    if (values.length < period) return null;
    var sum = 0;
    for (var i = values.length - period; i < values.length; i++) sum += values[i];
    return sum / period;
  }

  function stddev(values, period) {
    var mean = sma(values, period);
    if (mean == null) return null;
    var sumSq = 0;
    for (var i = values.length - period; i < values.length; i++) {
      var d = values[i] - mean;
      sumSq += d * d;
    }
    return Math.sqrt(sumSq / period);
  }

  function trueRanges(highs, lows, closes) {
    var tr = [];
    for (var i = 0; i < highs.length; i++) {
      if (i === 0) { tr.push(highs[i] - lows[i]); continue; }
      var prev = closes[i - 1];
      tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - prev), Math.abs(lows[i] - prev)));
    }
    return tr;
  }

  // Wilder smoothing: first value is the simple average, then
  // value = (prior * (period - 1) + current) / period.
  function wilderSmooth(values, period) {
    if (values.length < period) return [];
    var out = [];
    var first = 0;
    for (var i = 0; i < period; i++) first += values[i];
    out.push(first / period);
    for (var j = period; j < values.length; j++) {
      var prior = out[out.length - 1];
      out.push((prior * (period - 1) + values[j]) / period);
    }
    return out;
  }

  function adxSeries(highs, lows, closes, period) {
    if (highs.length < period * 2 + 1) return null;
    var plusDM = [0], minusDM = [0];
    for (var i = 1; i < highs.length; i++) {
      var upMove = highs[i] - highs[i - 1];
      var downMove = lows[i - 1] - lows[i];
      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    }
    var tr = trueRanges(highs, lows, closes);

    var trSmooth = wilderSmooth(tr, period);
    var plusDmSmooth = wilderSmooth(plusDM, period);
    var minusDmSmooth = wilderSmooth(minusDM, period);

    if (!trSmooth.length || !plusDmSmooth.length || !minusDmSmooth.length) return null;

    var plusDI = [], minusDI = [], dx = [];
    for (var k = 0; k < trSmooth.length; k++) {
      var tt = trSmooth[k] || 1e-9;
      var pdi = (plusDmSmooth[k] / tt) * 100;
      var mdi = (minusDmSmooth[k] / tt) * 100;
      plusDI.push(pdi);
      minusDI.push(mdi);
      var sum = pdi + mdi || 1e-9;
      dx.push((Math.abs(pdi - mdi) / sum) * 100);
    }
    var adx = wilderSmooth(dx, period);
    return {
      adx: adx[adx.length - 1],
      plusDI: plusDI[plusDI.length - 1],
      minusDI: minusDI[minusDI.length - 1]
    };
  }

  function atr(highs, lows, closes, period) {
    var tr = trueRanges(highs, lows, closes);
    var smooth = wilderSmooth(tr, period);
    return smooth.length ? smooth[smooth.length - 1] : null;
  }

  function bbWidthSeries(closes, period, mult) {
    var widths = [];
    for (var i = period; i <= closes.length; i++) {
      var slice = closes.slice(i - period, i);
      var mean = slice.reduce(function (a, b) { return a + b; }, 0) / period;
      var sumSq = 0;
      for (var j = 0; j < slice.length; j++) {
        var d = slice[j] - mean;
        sumSq += d * d;
      }
      var sd = Math.sqrt(sumSq / period);
      var upper = mean + mult * sd;
      var lower = mean - mult * sd;
      widths.push((upper - lower) / Math.max(1e-9, mean));
    }
    return widths;
  }

  function percentileOfLast(arr) {
    if (!arr.length) return 50;
    var current = arr[arr.length - 1];
    var below = 0;
    for (var i = 0; i < arr.length; i++) if (arr[i] <= current) below++;
    return (below / arr.length) * 100;
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
      trend_character: 'Ranging',
      volatility_character: 'Normal',
      adx: null,
      atr: null,
      atr_percentile: null,
      bb_width_percentile: null,
      regime_label: 'Indeterminate',
      narrative: 'Regime analysis unavailable. ' + reason,
      source: 'unavailable'
    };
  }

  function buildLabel(trend, vol) {
    return trend + ' / ' + vol;
  }

  // ── Public ────────────────────────────────────────────────────────────────

  async function compute(inst) {
    if (typeof fetchCandles !== 'function') return fallback(inst, 'fetchCandles helper missing.');

    var candles;
    try {
      candles = await fetchCandles(inst, '4h', 200);
    } catch (e) {
      var prior = readCache(inst);
      return prior || fallback(inst, 'candle fetch failed: ' + e.message);
    }
    if (!Array.isArray(candles) || candles.length < 60) {
      var priorShort = readCache(inst);
      return priorShort || fallback(inst, 'insufficient candle history.');
    }

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

    var adxObj = adxSeries(highs, lows, closes, 14);
    var atrNow = atr(highs, lows, closes, 14);

    // ATR percentile vs lookback window (use up to 90 most recent bars or
    // however many are available).
    var atrLookback = Math.min(90, chrono.length - 14);
    var atrSeries = [];
    for (var i = chrono.length - atrLookback; i <= chrono.length; i++) {
      var slice = chrono.slice(0, i);
      if (slice.length >= 15) {
        atrSeries.push(atr(slice.map(function (c) { return parseFloat(c.high); }),
                           slice.map(function (c) { return parseFloat(c.low); }),
                           slice.map(function (c) { return parseFloat(c.close); }),
                           14));
      }
    }
    var atrPct = atrSeries.length ? percentileOfLast(atrSeries) : 50;

    var bbWidths = bbWidthSeries(closes, 20, 2);
    var bbPct = bbWidths.length ? percentileOfLast(bbWidths) : 50;

    // Trend character from ADX. The Wilder threshold is 25.
    var trend = 'Ranging';
    if (adxObj) {
      if (adxObj.adx >= 35) {
        trend = adxObj.plusDI > adxObj.minusDI ? 'Strong Uptrend' : 'Strong Downtrend';
      } else if (adxObj.adx >= 22) {
        trend = adxObj.plusDI > adxObj.minusDI ? 'Weak Uptrend' : 'Weak Downtrend';
      } else {
        trend = 'Ranging';
      }
    }

    // Volatility character. Compression takes priority when BB width is in
    // the bottom quintile. Spike when ATR percentile is in the top decile.
    var vol = 'Normal';
    if (bbPct < 20) vol = 'Compression';
    else if (atrPct >= 90) vol = 'Spike';
    else if (atrPct >= 70) vol = 'Elevated';

    // Layer in the cached Wyckoff phase when available so the label
    // includes structural context without re calling the LLM.
    var wyckoff = (ROOT.wyckoff && typeof ROOT.wyckoff.cached === 'function')
      ? ROOT.wyckoff.cached(inst) : null;
    var phase = wyckoff && wyckoff.phase ? wyckoff.phase : null;

    var narrativeParts = [];
    narrativeParts.push(trend + ' on H4.');
    narrativeParts.push(vol === 'Compression' ? 'Volatility compressed; expect a directional break.'
                  : vol === 'Spike' ? 'Volatility spiking; widen stops or stand aside.'
                  : vol === 'Elevated' ? 'Volatility elevated; reduce position size.'
                  : 'Volatility within normal range.');
    if (phase) narrativeParts.push('Wyckoff phase context: ' + phase + '.');

    var payload = {
      instrument: inst,
      trend_character: trend,
      volatility_character: vol,
      adx: adxObj ? Number(adxObj.adx.toFixed(2)) : null,
      plus_di: adxObj ? Number(adxObj.plusDI.toFixed(2)) : null,
      minus_di: adxObj ? Number(adxObj.minusDI.toFixed(2)) : null,
      atr: atrNow ? Number(atrNow.toFixed(5)) : null,
      atr_percentile: Number(atrPct.toFixed(1)),
      bb_width_percentile: Number(bbPct.toFixed(1)),
      wyckoff_phase: phase,
      regime_label: buildLabel(trend, vol),
      narrative: narrativeParts.join(' '),
      basedOnBarTime: latestBarTime,
      bars_analysed: chrono.length,
      source: 'browser'
    };
    writeCache(inst, payload);
    return payload;
  }

  ROOT.regime = compute;
  ROOT.regime.cached = readCache;
  ROOT.regime.clear = function (inst) {
    try { if (inst) localStorage.removeItem(keyFor(inst)); } catch (_) {}
  };
})();
