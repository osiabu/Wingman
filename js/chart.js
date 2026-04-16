// ═══════════════════════════════════════════
// TRADINGVIEW CHART PRICE SYNC
// Listen for postMessage events broadcast by the TradingView widget embed iframe.
// TV sends quote updates as: { name: "quoteUpdate", data: { lp: <last price>, ... } }
// We pipe these directly into livePriceCache so simGetPrice (and therefore all
// open P&L calculations) use the exact same price the chart is displaying.
// ═══════════════════════════════════════════
(function setupTVPriceSync() {
  // Reverse-map from TV symbol string → our pair id (e.g. "BINANCE:BTCUSDT" → "BTCUSD")
  const tvToPairId = {};
  if (typeof TV_SYMBOLS !== 'undefined') {
    Object.entries(TV_SYMBOLS).forEach(([pairId, tvSym]) => {
      tvToPairId[tvSym.toUpperCase()] = pairId;
      // Also map without exchange prefix (e.g. "BTCUSDT" → "BTCUSD")
      const bare = tvSym.split(':').pop();
      if (bare) tvToPairId[bare.toUpperCase()] = pairId;
    });
  }

  let _tvSidebarDebounce = null;

  window.addEventListener('message', (evt) => {
    // TradingView embeds come from tradingview.com
    if (!evt.origin.includes('tradingview.com')) return;

    let msg;
    try { msg = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data; }
    catch { return; }

    // Quote update payload
    if (msg && msg.name === 'quoteUpdate' && msg.data) {
      const d = msg.data;
      const price = parseFloat(d.lp || d.last_price || d.close);
      if (isNaN(price) || price <= 0) return;

      // Identify which pair this quote belongs to
      const rawSym = (d.symbol || d.name || '').toUpperCase();
      const pairId = tvToPairId[rawSym] || currentChartPair;

      if (pairId) {
        livePriceCache[pairId] = price;
        priceSourceCache[pairId] = 'tv';
      }

      // Also always update currentChartPair with whatever the chart shows
      if (currentChartPair) {
        livePriceCache[currentChartPair] = price;
        priceSourceCache[currentChartPair] = 'tv';
      }

      // Also update the sim chart instrument if it differs from currentChartPair
      if (typeof currentSimChartPair !== 'undefined' && currentSimChartPair && currentSimChartPair !== currentChartPair) {
        livePriceCache[currentSimChartPair] = price;
        priceSourceCache[currentSimChartPair] = 'tv';
        // Refresh sim price display
        if (typeof simUpdatePrice === 'function') simUpdatePrice();
      }

      // Debounced sidebar refresh — at most once per second from TV ticks
      clearTimeout(_tvSidebarDebounce);
      _tvSidebarDebounce = setTimeout(() => {
        updateSidebarStats();
      }, 1000);
    }
  });
})();

// ═══════════════════════════════════════════
// WINGMAN CHART — CONSTANTS
// ═══════════════════════════════════════════
var WC_COLORS = {
  ema9:    '#00C8FF',
  ema21:   '#F0B429',
  ema50:   '#A855F7',
  ema200:  '#FF3D5A',
  bbLine:  '#00C9B1',
  bbMid:   '#00C9B170',
  rsi:     '#00C9B1',
  macd:    '#00C8FF',
  signal:  '#F0B429'
};

var WC_BINANCE_PAIRS = {
  'BTCUSD': 'BTCUSDT', 'ETHUSD': 'ETHUSDT', 'SOLUSD': 'SOLUSDT',
  'BNBUSD': 'BNBUSDT', 'XRPUSD': 'XRPUSDT', 'ADAUSD': 'ADAUSDT',
  'DOTUSD': 'DOTUSDT', 'LINKUSD': 'LINKUSDT'
};

var WC_TWELVEDATA_PAIRS = {
  'EURUSD': 'EUR/USD', 'GBPUSD': 'GBP/USD', 'USDJPY': 'USD/JPY',
  'XAUUSD': 'XAU/USD', 'XAGUSD': 'XAG/USD', 'US500': 'SPX',
  'NAS100': 'NDX',     'GBPJPY': 'GBP/JPY', 'AUDUSD': 'AUD/USD',
  'USDCAD': 'USD/CAD', 'NZDUSD': 'NZD/USD', 'USDCHF': 'USD/CHF',
  'EURGBP': 'EUR/GBP', 'EURJPY': 'EUR/JPY'
};

var WC_TF_BINANCE = {
  '1': '1m', '5': '5m', '15': '15m', '60': '1h', '240': '4h', 'D': '1d'
};

var WC_TF_TWELVEDATA = {
  '1': '1min', '5': '5min', '15': '15min', '60': '1h', '240': '4h', 'D': '1day'
};

var WC_TF_SECONDS = {
  '1': 60, '5': 300, '15': 900, '60': 3600, '240': 14400, 'D': 86400
};

// Deriv granularity values (seconds) for candle requests
var WC_TF_DERIV = {
  '1': 60, '5': 300, '15': 900, '60': 3600, '240': 14400, 'D': 86400
};

// ═══════════════════════════════════════════
// INDICATOR CALCULATIONS
// ═══════════════════════════════════════════

function calcEMA(closes, period) {
  var k = 2 / (period + 1);
  var ema = [];
  var sum = 0;
  for (var i = 0; i < closes.length; i++) {
    if (i < period - 1) { sum += closes[i]; ema.push(null); continue; }
    if (i === period - 1) { sum += closes[i]; ema.push(sum / period); continue; }
    ema.push(closes[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

function calcBB(closes, period, mult) {
  period = period || 20;
  mult   = mult   || 2;
  var upper = [], lower = [], mid = [];
  for (var i = 0; i < closes.length; i++) {
    if (i < period - 1) { upper.push(null); lower.push(null); mid.push(null); continue; }
    var slice = closes.slice(i - period + 1, i + 1);
    var mean  = slice.reduce(function(a, b) { return a + b; }, 0) / period;
    var variance = slice.reduce(function(a, b) { return a + Math.pow(b - mean, 2); }, 0) / period;
    var sd = Math.sqrt(variance);
    mid.push(mean);
    upper.push(mean + mult * sd);
    lower.push(mean - mult * sd);
  }
  return { upper: upper, lower: lower, mid: mid };
}

function calcRSI(closes, period) {
  period = period || 14;
  var rsi = [];
  var avgGain = 0, avgLoss = 0;
  for (var i = 0; i < closes.length; i++) {
    if (i === 0) { rsi.push(null); continue; }
    var change = closes[i] - closes[i - 1];
    var gain   = Math.max(change, 0);
    var loss   = Math.max(-change, 0);
    if (i < period) {
      avgGain += gain / period;
      avgLoss += loss / period;
      rsi.push(null);
      continue;
    }
    if (i === period) {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    var rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }
  return rsi;
}

function calcMACD(closes, fast, slow, sig) {
  fast = fast || 12; slow = slow || 26; sig = sig || 9;
  var emaFast = calcEMA(closes, fast);
  var emaSlow = calcEMA(closes, slow);
  var macdLine = emaFast.map(function(v, i) {
    return (v !== null && emaSlow[i] !== null) ? v - emaSlow[i] : null;
  });
  // Build signal line over valid MACD values only
  var validMacd = [];
  macdLine.forEach(function(v) { if (v !== null) validMacd.push(v); });
  var sigArr = calcEMA(validMacd, sig);
  var sigIdx = 0;
  var signalLine = macdLine.map(function(v) {
    if (v === null) return null;
    return sigArr[sigIdx++] !== undefined ? sigArr[sigIdx - 1] : null;
  });
  var histogram = macdLine.map(function(v, i) {
    return (v !== null && signalLine[i] !== null) ? v - signalLine[i] : null;
  });
  return { macd: macdLine, signal: signalLine, histogram: histogram };
}

// ═══════════════════════════════════════════
// WINGMAN CHART FACTORY
// ═══════════════════════════════════════════

function createWingmanChart(mainId, rsiId, macdId, volId) {
  if (typeof LightweightCharts === 'undefined') {
    console.warn('Wingman Chart: LightweightCharts library not loaded.');
    return null;
  }

  var mainContainer = document.getElementById(mainId);
  var rsiContainer  = document.getElementById(rsiId);
  var macdContainer = document.getElementById(macdId);
  var volContainer  = document.getElementById(volId);
  if (!mainContainer) { console.warn('Wingman Chart: container #' + mainId + ' not found.'); return null; }

  var baseOpts = {
    autoSize: true,
    layout: {
      background: { type: 'solid', color: '#060608' },
      textColor: '#A0A0B8',
      fontSize: 10,
      fontFamily: "'JetBrains Mono', monospace"
    },
    grid: {
      vertLines: { color: '#12121A', style: 0 },
      horzLines: { color: '#12121A', style: 0 }
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Magnet,
      vertLine: { color: '#6B6B8580', width: 1, style: 2, labelBackgroundColor: '#1C1C25' },
      horzLine: { color: '#6B6B8580', width: 1, style: 2, labelBackgroundColor: '#1C1C25' }
    },
    rightPriceScale: {
      borderColor: '#1E1E28',
      textColor: '#8888A0',
      scaleMargins: { top: 0.05, bottom: 0.05 }
    },
    timeScale: {
      borderColor: '#1E1E28',
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 12,
      barSpacing: 10,
      minBarSpacing: 2,
      fixRightEdge: true
    }
  };

  var subOpts = {
    autoSize: true,
    layout: {
      background: { type: 'solid', color: '#060608' },
      textColor: '#6B6B85',
      fontSize: 9,
      fontFamily: "'JetBrains Mono', monospace"
    },
    grid: {
      vertLines: { color: '#12121A40', style: 0 },
      horzLines: { color: '#12121A40', style: 0 }
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: { color: '#6B6B8560', width: 1, style: 2, labelBackgroundColor: '#1C1C25' },
      horzLine: { color: '#6B6B8560', width: 1, style: 2, labelBackgroundColor: '#1C1C25' }
    },
    rightPriceScale: { borderColor: '#1E1E28', textColor: '#6B6B85', scaleMargins: { top: 0.1, bottom: 0.1 } },
    leftPriceScale: { visible: false },
    timeScale: { visible: false, borderColor: '#1E1E28' },
    handleScroll: false,
    handleScale: false
  };

  // Create chart instances
  var mainChart = LightweightCharts.createChart(mainContainer, baseOpts);
  var rsiChart  = rsiContainer  ? LightweightCharts.createChart(rsiContainer,  subOpts) : null;
  var macdChart = macdContainer ? LightweightCharts.createChart(macdContainer, subOpts) : null;
  var volChart  = volContainer  ? LightweightCharts.createChart(volContainer,  subOpts) : null;

  // ── Main series ──
  var candleSeries = mainChart.addCandlestickSeries({
    upColor: '#00E87A', downColor: '#FF3D5A',
    borderUpColor: '#00E87A', borderDownColor: '#FF3D5A',
    wickUpColor: '#00E87A90', wickDownColor: '#FF3D5A90',
    priceLineVisible: true,
    priceLineColor: '#F0B429',
    priceLineWidth: 1,
    priceLineStyle: LightweightCharts.LineStyle.Dotted,
    lastValueVisible: true
  });

  // ── Overlay line series ──
  function makeLineSeries(chart, color, width, style) {
    return chart.addLineSeries({
      color: color,
      lineWidth: width || 1,
      lineStyle: style || 0,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false
    });
  }

  var overlaySeries = {
    ema9:    makeLineSeries(mainChart, WC_COLORS.ema9,   1),
    ema21:   makeLineSeries(mainChart, WC_COLORS.ema21,  1),
    ema50:   makeLineSeries(mainChart, WC_COLORS.ema50,  1),
    ema200:  makeLineSeries(mainChart, WC_COLORS.ema200, 1),
    bbUpper: makeLineSeries(mainChart, WC_COLORS.bbLine, 1, 2),
    bbLower: makeLineSeries(mainChart, WC_COLORS.bbLine, 1, 2),
    bbMid:   makeLineSeries(mainChart, WC_COLORS.bbMid,  1, 2)
  };

  // ── RSI sub-panel series ──
  var rsiSeries    = rsiChart ? rsiChart.addLineSeries({ color: WC_COLORS.rsi, lineWidth: 1, priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: false }) : null;
  var rsiOB        = rsiChart ? makeLineSeries(rsiChart, '#FF3D5A40', 1, 2) : null;
  var rsiOS        = rsiChart ? makeLineSeries(rsiChart, '#00E87A40', 1, 2) : null;

  // ── MACD sub-panel series ──
  var macdLineSer  = macdChart ? makeLineSeries(macdChart, WC_COLORS.macd,   1) : null;
  var macdSigSer   = macdChart ? makeLineSeries(macdChart, WC_COLORS.signal, 1) : null;
  var macdHistSer  = macdChart ? macdChart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false, base: 0 }) : null;

  // ── Volume sub-panel series ──
  var volSeries    = volChart  ? volChart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false, priceFormat: { type: 'volume' } }) : null;

  // ── State ──
  var _visInd   = { ema9: true, ema21: true, ema50: false, ema200: false, bb: false };
  var _visSub   = { rsi: true, macd: false, vol: true };
  var _activeTool   = null;
  var _drawPhase    = 0;
  var _pendingPt    = null;
  var _drawings     = [];
  var _markers      = [];
  var _lastCandles  = [];       // stored for real-time tick updates
  var _currentTFSeconds = 900;  // default 15m

  // Apply initial indicator visibility (ema50, ema200, bb start hidden)
  overlaySeries.ema50.applyOptions({ visible: false });
  overlaySeries.ema200.applyOptions({ visible: false });
  overlaySeries.bbUpper.applyOptions({ visible: false });
  overlaySeries.bbLower.applyOptions({ visible: false });
  overlaySeries.bbMid.applyOptions({ visible: false });

  // ── Sync sub-panel time scales to main ──
  mainChart.timeScale().subscribeVisibleLogicalRangeChange(function(range) {
    if (!range) return;
    if (rsiChart)  rsiChart.timeScale().setVisibleLogicalRange(range);
    if (macdChart) macdChart.timeScale().setVisibleLogicalRange(range);
    if (volChart)  volChart.timeScale().setVisibleLogicalRange(range);
  });

  // ── loadCandles: sets all series data and calculates indicators ──
  function loadCandles(rawData) {
    if (!rawData || !rawData.length) return;

    // Sort and deduplicate by time
    var sorted = rawData.slice().sort(function(a, b) { return a.time - b.time; });
    var seen = {};
    sorted = sorted.filter(function(d) {
      if (seen[d.time]) return false;
      seen[d.time] = true;
      return true;
    });

    var times  = sorted.map(function(d) { return d.time; });
    var closes = sorted.map(function(d) { return d.close; });

    _lastCandles = sorted;  // store for real-time tick updates
    candleSeries.setData(sorted);

    function toSeries(vals) {
      var out = [];
      for (var i = 0; i < vals.length; i++) {
        if (vals[i] !== null && vals[i] !== undefined && !isNaN(vals[i])) {
          out.push({ time: times[i], value: vals[i] });
        }
      }
      return out;
    }

    // EMAs
    overlaySeries.ema9.setData(toSeries(calcEMA(closes, 9)));
    overlaySeries.ema21.setData(toSeries(calcEMA(closes, 21)));
    overlaySeries.ema50.setData(toSeries(calcEMA(closes, 50)));
    overlaySeries.ema200.setData(toSeries(calcEMA(closes, 200)));

    // Bollinger Bands
    var bb = calcBB(closes, 20, 2);
    overlaySeries.bbUpper.setData(toSeries(bb.upper));
    overlaySeries.bbLower.setData(toSeries(bb.lower));
    overlaySeries.bbMid.setData(toSeries(bb.mid));

    // RSI
    if (rsiSeries) {
      var rsiVals = calcRSI(closes, 14);
      rsiSeries.setData(toSeries(rsiVals));
      // Overbought 70 / Oversold 30 reference lines spanning the visible range
      var validTimes = times.filter(function(_, i) { return rsiVals[i] !== null; });
      if (validTimes.length >= 2) {
        var t0 = validTimes[0], t1 = validTimes[validTimes.length - 1];
        if (rsiOB) rsiOB.setData([{ time: t0, value: 70 }, { time: t1, value: 70 }]);
        if (rsiOS) rsiOS.setData([{ time: t0, value: 30 }, { time: t1, value: 30 }]);
      }
    }

    // MACD
    if (macdLineSer && macdSigSer && macdHistSer) {
      var macdData = calcMACD(closes, 12, 26, 9);
      macdLineSer.setData(toSeries(macdData.macd));
      macdSigSer.setData(toSeries(macdData.signal));
      var histArr = [];
      for (var j = 0; j < macdData.histogram.length; j++) {
        var hv = macdData.histogram[j];
        if (hv !== null && !isNaN(hv)) {
          histArr.push({ time: times[j], value: hv, color: hv >= 0 ? '#00E87AB3' : '#FF3D5AB3' });
        }
      }
      macdHistSer.setData(histArr);
    }

    // Volume
    if (volSeries) {
      var volArr = sorted.map(function(d) {
        return { time: d.time, value: d.volume || 0, color: d.close >= d.open ? '#00E87A80' : '#FF3D5A80' };
      });
      volSeries.setData(volArr);
    }

    mainChart.timeScale().fitContent();
  }

  // ── addMarker ──
  function addMarker(marker) {
    _markers.push({
      time:     marker.time,
      position: marker.position || 'belowBar',
      color:    marker.color    || WC_COLORS.ema21,
      shape:    marker.shape    || 'arrowUp',
      text:     marker.text     || ''
    });
    _markers.sort(function(a, b) { return a.time - b.time; });
    candleSeries.setMarkers(_markers);
  }

  // ── toggleIndicator ──
  function toggleIndicator(name, state) {
    if (state === undefined) state = !_visInd[name];
    _visInd[name] = state;
    if (name === 'ema9')   overlaySeries.ema9.applyOptions({ visible: state });
    if (name === 'ema21')  overlaySeries.ema21.applyOptions({ visible: state });
    if (name === 'ema50')  overlaySeries.ema50.applyOptions({ visible: state });
    if (name === 'ema200') overlaySeries.ema200.applyOptions({ visible: state });
    if (name === 'bb') {
      overlaySeries.bbUpper.applyOptions({ visible: state });
      overlaySeries.bbLower.applyOptions({ visible: state });
      overlaySeries.bbMid.applyOptions({ visible: state });
    }
  }

  // ── toggleSubpanel ──
  function toggleSubpanel(name, state) {
    if (state === undefined) state = !_visSub[name];
    _visSub[name] = state;
    var wrapMap = { rsi: 'wc-rsi-wrap', macd: 'wc-macd-wrap', vol: 'wc-vol-wrap' };
    var wrap = document.getElementById(wrapMap[name]);
    if (wrap) wrap.style.display = state ? '' : 'none';
  }

  // ── setDrawingTool ──
  function setDrawingTool(tool) {
    _activeTool = tool;
    _drawPhase  = 0;
    _pendingPt  = null;
    mainContainer.style.cursor = tool ? 'crosshair' : '';
  }

  // ── clearDrawings ──
  function clearDrawings() {
    _drawings.forEach(function(d) {
      try {
        if (d.type === 'priceLine') candleSeries.removePriceLine(d.ref);
        if (d.type === 'lineSeries') mainChart.removeSeries(d.ref);
      } catch(e) {}
    });
    _drawings = [];
  }

  // ── Chart click handler for drawing tools ──
  mainContainer.addEventListener('click', function(e) {
    if (!_activeTool) return;
    var rect  = mainContainer.getBoundingClientRect();
    var xCoord = e.clientX - rect.left;
    var yCoord = e.clientY - rect.top;
    var clickTime  = mainChart.timeScale().coordinateToTime(xCoord);
    var clickPrice = candleSeries.coordinateToPrice(yCoord);
    if (!clickTime || clickPrice === null) return;

    if (_activeTool === 'hline') {
      var pl = candleSeries.createPriceLine({
        price: clickPrice,
        color: '#F0B429',
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Dashed,
        axisLabelVisible: true,
        title: 'H.Line'
      });
      _drawings.push({ type: 'priceLine', ref: pl });
      // Deactivate after placing
      _activeTool = null;
      mainContainer.style.cursor = '';
      document.querySelectorAll('.wc-tool-btn.active').forEach(function(b) { b.classList.remove('active'); });

    } else if (_activeTool === 'trendline' || _activeTool === 'zone' || _activeTool === 'fib') {
      if (_drawPhase === 0) {
        _pendingPt = { time: clickTime, price: clickPrice };
        _drawPhase = 1;
      } else {
        var p1 = _pendingPt;
        var p2 = { time: clickTime, price: clickPrice };
        var tool = _activeTool;
        _drawPhase  = 0;
        _pendingPt  = null;
        _activeTool = null;
        mainContainer.style.cursor = '';
        document.querySelectorAll('.wc-tool-btn.active').forEach(function(b) { b.classList.remove('active'); });

        if (tool === 'trendline') {
          var tA = p1.time < p2.time ? p1 : p2;
          var tB = p1.time < p2.time ? p2 : p1;
          var ls = mainChart.addLineSeries({
            color: '#F0B429', lineWidth: 1,
            priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false
          });
          ls.setData([{ time: tA.time, value: tA.price }, { time: tB.time, value: tB.price }]);
          _drawings.push({ type: 'lineSeries', ref: ls });

        } else if (tool === 'zone') {
          var zHigh = Math.max(p1.price, p2.price);
          var zLow  = Math.min(p1.price, p2.price);
          var plHigh = candleSeries.createPriceLine({ price: zHigh, color: '#A855F780', lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: false, title: 'Zone' });
          var plLow  = candleSeries.createPriceLine({ price: zLow,  color: '#A855F780', lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Solid, axisLabelVisible: false, title: '' });
          _drawings.push({ type: 'priceLine', ref: plHigh });
          _drawings.push({ type: 'priceLine', ref: plLow });

        } else if (tool === 'fib') {
          var fibTop    = Math.max(p1.price, p2.price);
          var fibBottom = Math.min(p1.price, p2.price);
          var fibRange  = fibTop - fibBottom;
          var fibLevels = [
            { r: 0,     color: '#6B6B85', label: '0%'    },
            { r: 0.236, color: '#A855F7', label: '23.6%' },
            { r: 0.382, color: '#00C9B1', label: '38.2%' },
            { r: 0.5,   color: '#F0B429', label: '50%'   },
            { r: 0.618, color: '#00C9B1', label: '61.8%' },
            { r: 0.786, color: '#A855F7', label: '78.6%' },
            { r: 1,     color: '#6B6B85', label: '100%'  }
          ];
          fibLevels.forEach(function(fl) {
            var fp = fibTop - fibRange * fl.r;
            var fpl = candleSeries.createPriceLine({
              price: fp, color: fl.color,
              lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Dashed,
              axisLabelVisible: true, title: 'Fib ' + fl.label
            });
            _drawings.push({ type: 'priceLine', ref: fpl });
          });
        }
      }
    }
  });

  // ── updateTick: real-time candle updates from live tick stream ──
  function updateTick(tick) {
    if (!tick || !tick.time || !tick.price || !_lastCandles.length) return;
    var tfSec = _currentTFSeconds;
    if (!tfSec || tfSec <= 0) return;
    var bucket = Math.floor(tick.time / tfSec) * tfSec;
    var last = _lastCandles[_lastCandles.length - 1];
    var price = tick.price;

    if (last && last.time === bucket) {
      // Same candle bucket: update in place
      last.close = price;
      if (price > last.high) last.high = price;
      if (price < last.low)  last.low  = price;
      candleSeries.update(last);
    } else {
      // New candle bucket
      var newCandle = { time: bucket, open: price, high: price, low: price, close: price };
      _lastCandles.push(newCandle);
      candleSeries.update(newCandle);
    }
  }

  // ── setTimeframe: store current TF seconds for tick bucketing ──
  function setTimeframe(seconds) {
    _currentTFSeconds = seconds;
  }

  // ── setWatermark: display instrument name on chart background ──
  function setWatermark(text) {
    mainChart.applyOptions({
      watermark: {
        visible: true,
        fontSize: 48,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(255,255,255,0.025)',
        text: text || ''
      }
    });
  }

  return {
    loadCandles:     loadCandles,
    addMarker:       addMarker,
    toggleIndicator: toggleIndicator,
    toggleSubpanel:  toggleSubpanel,
    setDrawingTool:  setDrawingTool,
    clearDrawings:   clearDrawings,
    updateTick:      updateTick,
    setTimeframe:    setTimeframe,
    setWatermark:    setWatermark,
    resize: function() {
      mainChart.timeScale().fitContent();
    },
    _chart:  mainChart,
    _candle: candleSeries
  };
}

// ═══════════════════════════════════════════
// CHART PAGE STATE
// ═══════════════════════════════════════════
var currentChartPair = 'XAUUSD';
var currentChartTF   = '15';
var wmChart          = null;

// ═══════════════════════════════════════════
// CANDLE DATA FETCHING
// ═══════════════════════════════════════════

function fetchCandlesBinance(symbol, interval, limit) {
  var url = 'https://api.binance.com/api/v3/klines?symbol='
    + encodeURIComponent(symbol) + '&interval=' + interval + '&limit=' + (limit || 500);
  return fetch(url).then(function(r) {
    if (!r.ok) throw new Error('Binance HTTP ' + r.status);
    return r.json();
  }).then(function(data) {
    return data.map(function(k) {
      return {
        time:   Math.floor(k[0] / 1000),
        open:   parseFloat(k[1]),
        high:   parseFloat(k[2]),
        low:    parseFloat(k[3]),
        close:  parseFloat(k[4]),
        volume: parseFloat(k[5])
      };
    });
  });
}

function fetchCandlesTwelveData(symbol, interval, limit) {
  var apiKey = '';
  try {
    apiKey = localStorage.getItem('wm_twelvedata_key')
          || localStorage.getItem('wm_api_twelve')
          || '';
  } catch(e) {}
  if (!apiKey) return Promise.reject(new Error('No TwelveData API key configured. Add your key in Settings.'));
  var url = 'https://api.twelvedata.com/time_series?symbol='
    + encodeURIComponent(symbol) + '&interval=' + interval
    + '&outputsize=' + (limit || 500) + '&apikey=' + apiKey + '&format=JSON';
  return fetch(url).then(function(r) { return r.json(); }).then(function(data) {
    if (!data.values || !data.values.length) throw new Error('No candle data returned by TwelveData.');
    return data.values.slice().reverse().map(function(k) {
      return {
        time:   Math.floor(new Date(k.datetime).getTime() / 1000),
        open:   parseFloat(k.open),
        high:   parseFloat(k.high),
        low:    parseFloat(k.low),
        close:  parseFloat(k.close),
        volume: parseFloat(k.volume || 0)
      };
    });
  });
}

function generateDemoCandles(pair, tf) {
  // Synthetic fallback when no API key is available
  var basePrices = {
    'XAUUSD': 3080, 'XAGUSD': 32, 'EURUSD': 1.085, 'GBPUSD': 1.27,
    'USDJPY': 148,  'GBPJPY': 188, 'AUDUSD': 0.64, 'USDCAD': 1.36,
    'NZDUSD': 0.59, 'USDCHF': 0.90, 'EURGBP': 0.855, 'EURJPY': 160,
    'US500': 5100,  'NAS100': 18000,
    'BTCUSD': 65000,'ETHUSD': 3200
  };
  var base    = basePrices[pair] || 1.0;
  var stepSec = WC_TF_SECONDS[tf] || 900;
  var now     = Math.floor(Date.now() / 1000);
  var candles = [];
  var price   = base;
  var volatility = base * 0.0015;
  for (var i = 499; i >= 0; i--) {
    var t      = now - i * stepSec;
    var change = (Math.random() - 0.5) * 2 * volatility;
    var open   = price;
    var close  = Math.max(open + change, base * 0.5);
    var wick   = Math.abs(change) * (0.3 + Math.random() * 0.7);
    var high   = Math.max(open, close) + wick * 0.5;
    var low    = Math.min(open, close) - wick * 0.5;
    candles.push({ time: t, open: open, high: high, low: low, close: close, volume: 100 + Math.random() * 900 });
    price = close;
  }
  return candles;
}

function fetchAndLoadCandles(pair, tf) {
  if (!wmChart) return;
  var loadEl = document.getElementById('wc-loading');
  if (loadEl) loadEl.style.display = '';

  var promise;
  if (WC_BINANCE_PAIRS[pair]) {
    promise = fetchCandlesBinance(WC_BINANCE_PAIRS[pair], WC_TF_BINANCE[tf] || '15m', 500);
  } else if (typeof DERIV_SYMBOLS !== 'undefined' && DERIV_SYMBOLS[pair] && typeof fetchDerivCandles === 'function') {
    promise = fetchDerivCandles(DERIV_SYMBOLS[pair], WC_TF_DERIV[tf] || 900, 500);
  } else if (WC_TWELVEDATA_PAIRS[pair]) {
    promise = fetchCandlesTwelveData(WC_TWELVEDATA_PAIRS[pair], WC_TF_TWELVEDATA[tf] || '15min', 500);
  } else {
    promise = Promise.reject(new Error('No data source mapped for ' + pair + '.'));
  }

  var tfSeconds = WC_TF_SECONDS[tf] || 900;

  promise.then(function(candles) {
    if (loadEl) loadEl.style.display = 'none';
    wmChart.loadCandles(candles);
    if (typeof wmChart.setTimeframe === 'function') wmChart.setTimeframe(tfSeconds);
    if (typeof wmChart.setWatermark === 'function') wmChart.setWatermark(pair);
    updateChartLivePrice(pair);
  }).catch(function(err) {
    if (loadEl) loadEl.style.display = 'none';
    console.warn('Wingman Chart candle fetch:', err.message || err);
    wmChart.loadCandles(generateDemoCandles(pair, tf));
    if (typeof wmChart.setWatermark === 'function') wmChart.setWatermark(pair);
    updateChartLivePrice(pair);
  });
}

// ═══════════════════════════════════════════
// CHART PAGE INIT AND CONTROLS
// ═══════════════════════════════════════════

function initChart() {
  if (wmChart) { updateChartLivePrice(currentChartPair); return; }
  wmChart = createWingmanChart('wc-main-container', 'wc-rsi-container', 'wc-macd-container', 'wc-vol-container');
  if (!wmChart) return;
  buildChartInstrumentPanel();
  fetchAndLoadCandles(currentChartPair, currentChartTF);
}

function chartSelectTF(btn, tf) {
  document.querySelectorAll('.chart-tf-btn').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  currentChartTF = tf;
  fetchAndLoadCandles(currentChartPair, tf);
}

function switchChartPair(pairId) {
  currentChartPair = pairId;
  var badge  = document.getElementById('chart-inst-badge');
  var nameEl = document.getElementById('chart-inst-name');
  if (badge) {
    var display = pairId.replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2');
    badge.textContent = display;
  }
  if (typeof INSTRUMENTS !== 'undefined' && nameEl) {
    var inst = INSTRUMENTS.find(function(i) { return i.id === pairId; });
    if (inst) nameEl.textContent = inst.name || pairId;
  }
  var panel = document.getElementById('chart-inst-panel');
  if (panel) panel.classList.remove('open');
  fetchAndLoadCandles(pairId, currentChartTF);
  updateChartLivePrice(pairId);
}

function toggleChartInstPanel() {
  var panel   = document.getElementById('chart-inst-panel');
  var search  = document.getElementById('chart-inst-search');
  if (!panel) return;
  if (panel.classList.contains('open')) {
    panel.classList.remove('open');
  } else {
    buildChartInstrumentPanel();
    panel.classList.add('open');
    if (search) { search.value = ''; filterChartInstruments(''); setTimeout(function() { search.focus(); }, 50); }
  }
}

function buildChartInstrumentPanel() {
  var body = document.getElementById('chart-inst-panel-body');
  if (!body) return;
  if (typeof INSTRUMENTS === 'undefined' || !INSTRUMENTS.length) {
    body.innerHTML = '<div style="padding:12px;font-family:var(--font-mono);font-size:10px;color:var(--text3);">No instruments loaded.</div>';
    return;
  }
  var groups = {};
  INSTRUMENTS.forEach(function(inst) {
    var cat = inst.type || inst.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(inst);
  });
  var html = '';
  Object.keys(groups).forEach(function(cat) {
    html += '<div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:2px;padding:8px 12px 4px;text-transform:uppercase;">' + cat + '</div>';
    groups[cat].forEach(function(inst) {
      html += '<div class="inst-row" '
        + 'onclick="switchChartPair(\'' + inst.id + '\')" '
        + 'data-id="' + inst.id + '" '
        + 'data-name="' + (inst.name || '') + '">'
        + '<span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--text);">' + inst.id + '</span>'
        + '<span style="font-family:var(--font-mono);font-size:10px;color:var(--text3);margin-left:8px;">' + (inst.name || '') + '</span>'
        + '</div>';
    });
  });
  body.innerHTML = html;
}

function filterChartInstruments(q) {
  var rows = document.querySelectorAll('#chart-inst-panel-body .inst-row');
  var qLow = (q || '').toLowerCase();
  rows.forEach(function(row) {
    var id   = (row.dataset.id   || '').toLowerCase();
    var name = (row.dataset.name || '').toLowerCase();
    row.style.display = (!qLow || id.indexOf(qLow) !== -1 || name.indexOf(qLow) !== -1) ? '' : 'none';
  });
}

function updateChartLivePrice(pair) {
  var el = document.getElementById('wc-pair-price');
  var mobEl = document.getElementById('chart-live-price-mob');
  var price = (typeof livePriceCache !== 'undefined') ? livePriceCache[pair] : null;
  if (!price) return;
  var isJpy = pair.indexOf('JPY') !== -1;
  var dec   = price > 500 ? 2 : (isJpy ? 3 : 5);
  var str   = price.toFixed(dec);
  if (el)    el.textContent    = pair.replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2') + '  ' + str;
  if (mobEl) mobEl.textContent = str;
}

function updateChartKeyLevels(pair) {
  var el = document.getElementById('chart-key-levels');
  if (!el) return;
  if (typeof lastScanResults === 'undefined' || !lastScanResults || !lastScanResults[pair]) return;
  var levels = lastScanResults[pair].levels;
  if (!levels || !levels.length) return;
  el.innerHTML = levels.map(function(l) {
    return '<div class="chart-info-row">'
      + '<span class="chart-info-label">' + l.label + '</span>'
      + '<span class="chart-info-val" style="color:' + (l.type === 'R' ? 'var(--red)' : 'var(--green)') + ';">' + l.price + '</span>'
      + '</div>';
  }).join('');
}

function calcChartPip() {
  var entry = parseFloat((document.getElementById('cp-entry') || {}).value);
  var sl    = parseFloat((document.getElementById('cp-sl')    || {}).value);
  var tp    = parseFloat((document.getElementById('cp-tp')    || {}).value);
  var slDistEl = document.getElementById('cp-sl-dist');
  var tpDistEl = document.getElementById('cp-tp-dist');
  var rrEl     = document.getElementById('cp-rr');
  var lotEl    = document.getElementById('cp-lot');
  if (!slDistEl) return;
  var dash = '—';
  if (isNaN(entry) || isNaN(sl)) {
    slDistEl.textContent = dash; tpDistEl.textContent = dash;
    rrEl.textContent = dash; lotEl.textContent = dash;
    return;
  }
  var isJpy   = currentChartPair && currentChartPair.indexOf('JPY') !== -1;
  var isXau   = currentChartPair === 'XAUUSD' || currentChartPair === 'XAGUSD';
  var isCrypto = WC_BINANCE_PAIRS[currentChartPair] !== undefined;
  var dec     = isJpy ? 3 : (isXau ? 2 : 5);
  var slDist  = Math.abs(entry - sl);
  var tpDist  = !isNaN(tp) ? Math.abs(tp - entry) : null;
  var rr      = (tpDist && slDist > 0) ? (tpDist / slDist).toFixed(2) + 'R' : dash;
  // Lot size: 1% risk of sim account balance
  var balance = (typeof simAccount !== 'undefined' && simAccount) ? simAccount.balance : 10000;
  var riskAmt = balance * 0.01;
  var pipSz   = isJpy ? 0.01 : (isXau ? 0.1 : (isCrypto ? 1 : 0.0001));
  var pipVal  = 10; // approx per standard lot
  var lots    = (slDist > 0) ? (riskAmt / ((slDist / pipSz) * pipVal)).toFixed(2) + 'L' : dash;
  slDistEl.textContent = slDist.toFixed(dec);
  tpDistEl.textContent = tpDist ? tpDist.toFixed(dec) : dash;
  rrEl.textContent  = rr;
  lotEl.textContent = lots;
}

// ═══════════════════════════════════════════
// TOOLBAR ONCLICK HANDLERS (called from HTML)
// ═══════════════════════════════════════════

function wmToggleIndicator(btn, name) {
  if (!wmChart) return;
  var on = !btn.classList.contains('active');
  on ? btn.classList.add('active') : btn.classList.remove('active');
  wmChart.toggleIndicator(name, on);
}

function wmToggleSubpanel(btn, name) {
  if (!wmChart) return;
  var on = !btn.classList.contains('active');
  on ? btn.classList.add('active') : btn.classList.remove('active');
  wmChart.toggleSubpanel(name, on);
  wmChart.resize();
}

function wmSetDrawingTool(btn, tool) {
  if (!wmChart) return;
  var isAlreadyActive = btn.classList.contains('active');
  document.querySelectorAll('.wc-tool-btn').forEach(function(b) { b.classList.remove('active'); });
  if (isAlreadyActive) {
    wmChart.setDrawingTool(null);
  } else {
    btn.classList.add('active');
    wmChart.setDrawingTool(tool);
  }
}

function wmClearDrawings() {
  if (!wmChart) return;
  wmChart.clearDrawings();
  document.querySelectorAll('.wc-tool-btn').forEach(function(b) { b.classList.remove('active'); });
}

// Close instrument panel on outside click
document.addEventListener('click', function(e) {
  var panel   = document.getElementById('chart-inst-panel');
  var trigger = document.getElementById('chart-inst-trigger');
  if (!panel || !trigger) return;
  if (!panel.contains(e.target) && !trigger.contains(e.target)) {
    panel.classList.remove('open');
  }
});
