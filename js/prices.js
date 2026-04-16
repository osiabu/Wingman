// ═══════════════════════════════════════════
// PRICE SOURCE SYMBOL MAPS
// ═══════════════════════════════════════════

// Crypto pairs routed to Binance WebSocket (free, unlimited, real-time)
var BINANCE_SYMBOLS = {
  'BTCUSD':  'BTCUSDT',
  'ETHUSD':  'ETHUSDT',
  'SOLUSD':  'SOLUSDT',
  'XRPUSD':  'XRPUSDT',
  'BNBUSD':  'BNBUSDT',
  'ADAUSD':  'ADAUSDT',
  'DOTUSD':  'DOTUSDT',
  'LINKUSD': 'LINKUSDT',
};

// ─── HARDCODED FINNHUB KEY (news fallback — no user key required) ────────────
// Free tier, commercial use permitted per Finnhub ToS
var FINNHUB_KEY_BUILTIN = 'cva0arhr01qoivt1im7gcva0arhr01qoivt1im80';

// Price fallback is now handled server-side in /api/prices (open.er-api.com via Upstash Redis)

// ─── DERIV WEBSOCKET (forex + metals, free real-time) ───────────────────────
// Deriv API provides free tick data for forex pairs and metals via WebSocket.
// App ID 1089 is a public demo app ID (no signup required).
var DERIV_SYMBOLS = {
  'EURUSD':  'frxEURUSD',
  'GBPUSD':  'frxGBPUSD',
  'USDJPY':  'frxUSDJPY',
  'USDCHF':  'frxUSDCHF',
  'AUDUSD':  'frxAUDUSD',
  'USDCAD':  'frxUSDCAD',
  'NZDUSD':  'frxNZDUSD',
  'EURGBP':  'frxEURGBP',
  'EURJPY':  'frxEURJPY',
  'GBPJPY':  'frxGBPJPY',
  'AUDJPY':  'frxAUDJPY',
  'CADJPY':  'frxCADJPY',
  'EURCHF':  'frxEURCHF',
  'GBPCHF':  'frxGBPCHF',
  'EURCAD':  'frxEURCAD',
  'AUDCAD':  'frxAUDCAD',
  'AUDNZD':  'frxAUDNZD',
  'CHFJPY':  'frxCHFJPY',
  'XAUUSD':  'frxXAUUSD',
  'XAGUSD':  'frxXAGUSD',
  'XPTUSD':  'frxXPTUSD',
};

var atDerivWs = null;
var _derivSubscribed = {};   // track subscribed symbols to avoid duplicates
var _derivConnecting = false;
var _derivCandleCallbacks = {};  // req_id → { resolve, reject, timer }
var _derivReqId = 1;

function atConnectDeriv(onOpen) {
  // Already connected and open
  if (atDerivWs && atDerivWs.readyState === WebSocket.OPEN) {
    if (onOpen) onOpen();
    return;
  }
  // Connection in progress — queue callback
  if (_derivConnecting && atDerivWs && atDerivWs.readyState === WebSocket.CONNECTING) {
    atDerivWs.addEventListener('open', function _once() {
      atDerivWs.removeEventListener('open', _once);
      if (onOpen) onOpen();
    });
    return;
  }
  _derivConnecting = true;
  _derivSubscribed = {};
  try {
    atDerivWs = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
  } catch(e) {
    console.warn('Deriv WS connection failed:', e.message);
    _derivConnecting = false;
    return;
  }
  atDerivWs.onopen = function() {
    _derivConnecting = false;
    if (onOpen) onOpen();
  };
  atDerivWs.onmessage = function(e) {
    try {
      var msg = JSON.parse(e.data);

      // ── Tick prices (real-time subscription) ──
      if (msg.msg_type === 'tick' && msg.tick) {
        var derivSym = msg.tick.symbol;
        var price = parseFloat(msg.tick.quote);
        var pairId = null;
        for (var k in DERIV_SYMBOLS) {
          if (DERIV_SYMBOLS[k] === derivSym) { pairId = k; break; }
        }
        if (pairId && !isNaN(price)) {
          livePriceCache[pairId] = price;
          priceSourceCache[pairId] = 'deriv';
          updatePriceTileFromCache(pairId, price);
          // Bridge tick to active charts for real-time candle updates
          var tickData = { time: msg.tick.epoch, price: price };
          if (typeof wmChart !== 'undefined' && wmChart && typeof currentChartPair !== 'undefined' && currentChartPair === pairId && typeof wmChart.updateTick === 'function') {
            wmChart.updateTick(tickData);
          }
          if (typeof simWmChart !== 'undefined' && simWmChart && typeof currentSimChartPair !== 'undefined' && currentSimChartPair === pairId && typeof simWmChart.updateTick === 'function') {
            simWmChart.updateTick(tickData);
          }
        }
      }

      // ── Historical candle response ──
      if (msg.msg_type === 'candles' && msg.candles) {
        var rid = msg.req_id;
        if (rid && _derivCandleCallbacks[rid]) {
          var cb = _derivCandleCallbacks[rid];
          clearTimeout(cb.timer);
          delete _derivCandleCallbacks[rid];
          var candles = msg.candles.map(function(c) {
            return {
              time:   c.epoch,
              open:   parseFloat(c.open),
              high:   parseFloat(c.high),
              low:    parseFloat(c.low),
              close:  parseFloat(c.close),
              volume: 0
            };
          });
          cb.resolve(candles);
        }
      }

      // ── Error response ──
      if (msg.msg_type === 'error' || msg.error) {
        var erid = msg.req_id;
        if (erid && _derivCandleCallbacks[erid]) {
          var ecb = _derivCandleCallbacks[erid];
          clearTimeout(ecb.timer);
          delete _derivCandleCallbacks[erid];
          ecb.reject(new Error(msg.error ? msg.error.message : 'Deriv API error'));
        }
      }

    } catch(ex) { /* ignore parse errors */ }
  };
  atDerivWs.onerror = function() {
    console.warn('Deriv WS error');
    _derivConnecting = false;
  };
  atDerivWs.onclose = function() {
    _derivConnecting = false;
    _derivSubscribed = {};
    // Reconnect after 10s
    setTimeout(function() { atConnectDeriv(null); }, 10000);
  };
}

function atDerivSubscribeTick(pairId, derivSym) {
  if (!atDerivWs || atDerivWs.readyState !== WebSocket.OPEN) return;
  if (_derivSubscribed[derivSym]) return;
  _derivSubscribed[derivSym] = true;
  atDerivWs.send(JSON.stringify({ ticks: derivSym, subscribe: 1 }));
}

function atEnsureDerivFeed(pairId) {
  var derivSym = DERIV_SYMBOLS[pairId];
  if (!derivSym) return;
  atConnectDeriv(function() {
    atDerivSubscribeTick(pairId, derivSym);
  });
}

// ── Fetch historical candles from Deriv WS ──────────────────────────────────
function fetchDerivCandles(derivSymbol, granularity, count) {
  return new Promise(function(resolve, reject) {
    atConnectDeriv(function() {
      if (!atDerivWs || atDerivWs.readyState !== WebSocket.OPEN) {
        reject(new Error('Deriv WS not connected'));
        return;
      }
      var rid = _derivReqId++;
      var timer = setTimeout(function() {
        delete _derivCandleCallbacks[rid];
        reject(new Error('Deriv candle request timed out'));
      }, 12000);
      _derivCandleCallbacks[rid] = { resolve: resolve, reject: reject, timer: timer };
      atDerivWs.send(JSON.stringify({
        ticks_history: derivSymbol,
        count: count || 500,
        end: 'latest',
        style: 'candles',
        granularity: granularity,
        req_id: rid
      }));
    });
  });
}

// Active Binance WebSocket connections — keyed by pair id
var binanceWsSockets = {};
// Live prices cache — populated by Binance WS, Deriv WS, and TD fetches
var livePriceCache = {};
// Track which source each price came from for display
var priceSourceCache = {};

// ─── BINANCE WEBSOCKET ───────────────────────────────────────────────────────
// Debounce timer for sidebar refreshes triggered by Binance WS ticks
var _binanceSidebarDebounce = null;

function connectBinancePair(pairId) {
  const bSym = BINANCE_SYMBOLS[pairId];
  if (!bSym || binanceWsSockets[pairId]) return;
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${bSym.toLowerCase()}@miniTicker`);
  ws.onmessage = (e) => {
    const d = JSON.parse(e.data);
    const price = parseFloat(d.c);
    if (!isNaN(price)) {
      livePriceCache[pairId] = price;
      priceSourceCache[pairId] = 'binance';
      updatePriceTileFromCache(pairId, price);
      // Bridge tick to active charts for real-time candle updates
      var tickTime = Math.floor(d.E / 1000);  // Binance miniTicker event time (ms → s)
      var tickData = { time: tickTime, price: price };
      if (typeof wmChart !== 'undefined' && wmChart && typeof currentChartPair !== 'undefined' && currentChartPair === pairId && typeof wmChart.updateTick === 'function') {
        wmChart.updateTick(tickData);
      }
      if (typeof simWmChart !== 'undefined' && simWmChart && typeof currentSimChartPair !== 'undefined' && currentSimChartPair === pairId && typeof simWmChart.updateTick === 'function') {
        simWmChart.updateTick(tickData);
      }
      // Debounced sidebar refresh — at most once per 2s across all crypto ticks
      clearTimeout(_binanceSidebarDebounce);
      _binanceSidebarDebounce = setTimeout(updateSidebarStats, 2000);
    }
  };
  ws.onerror = () => { console.warn('Binance WS error for', pairId); };
  ws.onclose = () => {
    delete binanceWsSockets[pairId];
    // Reconnect after 5s
    setTimeout(() => connectBinancePair(pairId), 5000);
  };
  binanceWsSockets[pairId] = ws;
}

function disconnectBinancePair(pairId) {
  if (binanceWsSockets[pairId]) {
    binanceWsSockets[pairId].close();
    delete binanceWsSockets[pairId];
  }
}

// Sync Binance connections to currently selected pairs + home pairs
function syncBinanceConnections() {
  const selected = getSelectedPairs();
  // Always connect home pairs + scan selection
  const pairs = [...new Set([...HOME_PRICE_PAIRS, ...selected])];
  // Connect new crypto pairs
  pairs.forEach(p => { if (BINANCE_SYMBOLS[p]) connectBinancePair(p); });
  // Disconnect pairs no longer needed
  Object.keys(binanceWsSockets).forEach(p => {
    if (!pairs.includes(p)) disconnectBinancePair(p);
  });
}

// ─── PRICE TILE RENDERER ─────────────────────────────────────────────────────
// Debounce timer: rebuilds the full strip (both scroll copies) at most once per 500ms
var _stripRebuildTimer = null;

function updatePriceTileFromCache(pairId, price) {
  const lowDpPairs = ['BTCUSD','ETHUSD','SOLUSD','BNBUSD','ADAUSD','DOTUSD','LINKUSD','XRPUSD','US30','SPX500','NAS100','UK100','GER40','JPN225','AUS200','HK50','XAUUSD','XAGUSD','XPTUSD','XCUUSD','USOIL','UKOIL','NATGAS','COFFEE','COCOA','SUGAR','WHEAT','CORN','SOYBEAN','COTTON','LUMBER'];
  const dp = lowDpPairs.includes(pairId) ? 2 : 5;
  const prev = prevPrices[pairId];
  const changed = prev !== undefined && price !== prev;
  const up = price > prev;
  const arrow = changed ? (up ? ' ▲' : ' ▼') : '';
  const changeClass = changed ? (up ? 'price-up' : 'price-down') : '';
  const flashClass  = changed ? (up ? 'flash-up' : 'flash-down') : '';
  prevPrices[pairId] = price;
  const src = priceSourceCache[pairId] || 'td';
  const srcBadge = src === 'deriv'   ? '<span style="font-size:7px;color:#FF444F;margin-left:3px;">D</span>'
               : src === 'binance' ? '<span style="font-size:7px;color:#F0B90B;margin-left:3px;">B</span>'
                 : src === 'er'      ? '<span style="font-size:7px;color:#00C8FF;margin-left:3px;">ER</span>'
                 : '';
  // Update the named tile (first scroll copy) in-place
  const el = document.getElementById('ptile-' + pairId);
  if (el) {
    el.className = `price-tile ${flashClass}`;
    el.innerHTML = `
      <div class="price-tile-pair">${pairId}${srcBadge}</div>
      <div class="price-tile-val ${changeClass}">${price.toFixed(dp)}${arrow}</div>`;
    setTimeout(() => el.classList.remove('flash-up','flash-down'), 800);
  }
  // Second scroll copy updated only on 30-second snapshot interval (see home_startTickerInterval)
  // — do NOT call rebuildPriceStrip() here; it resets the CSS animation on every tick.
}

// Default home page price strip — always show these regardless of scan selection
// Categorised ticker order: Crypto → Forex → Metals → Indices → Energy/Commodities
var HOME_PRICE_PAIRS = [
  // ── Crypto ──
  'BTCUSD','ETHUSD','SOLUSD','XRPUSD','BNBUSD',
  // ── Forex ──
  'EURUSD','GBPUSD','USDJPY','GBPJPY','AUDUSD','USDCAD','USDCHF','NZDUSD',
  // ── Metals ──
  'XAUUSD','XAGUSD','XPTUSD',
  // ── Indices ──
  'US30','SPX500','NAS100','UK100','GER40',
  // ── Energy/Commodities ──
  'USOIL','UKOIL','NATGAS'
];

// Category separators for the ticker
var TICKER_CATEGORIES = [
  { label: 'CRYPTO',   pairs: ['BTCUSD','ETHUSD','SOLUSD','XRPUSD','BNBUSD'] },
  { label: 'FOREX',    pairs: ['EURUSD','GBPUSD','USDJPY','GBPJPY','AUDUSD','USDCAD','USDCHF','NZDUSD'] },
  { label: 'METALS',   pairs: ['XAUUSD','XAGUSD','XPTUSD'] },
  { label: 'INDICES',  pairs: ['US30','SPX500','NAS100','UK100','GER40'] },
  { label: 'ENERGY',   pairs: ['USOIL','UKOIL','NATGAS'] },
];

function rebuildPriceStrip() {
  const mobile = document.getElementById('mobile-price-tiles');
  if (!mobile) return;
  const lowDpPairs = ['BTCUSD','ETHUSD','SOLUSD','BNBUSD','ADAUSD','DOTUSD','LINKUSD','XRPUSD','US30','SPX500','NAS100','UK100','GER40','JPN225','AUS200','HK50','XAUUSD','XAGUSD','XPTUSD','XCUUSD','USOIL','UKOIL','NATGAS','COFFEE','COCOA','SUGAR','WHEAT','CORN','SOYBEAN','COTTON','LUMBER'];

  const makeSep = (label) =>
    `<div style="display:flex;align-items:center;flex-shrink:0;padding:0 6px 0 14px;font-family:var(--font-mono);font-size:7px;color:var(--text4);letter-spacing:1.5px;white-space:nowrap;user-select:none;border-left:1px solid var(--border2);margin-left:4px;">${label}</div>`;

  const makeTile = (p, withId) => {
    const price = livePriceCache[p];
    const dp = lowDpPairs.includes(p) ? 2 : 5;
    const src = priceSourceCache[p] || '';
    const srcBadge = src === 'deriv'   ? '<span style="font-size:7px;color:#FF444F;margin-left:3px;">D</span>'
               : src === 'binance' ? '<span style="font-size:7px;color:#F0B90B;margin-left:3px;">B</span>'
                   : src === 'er'      ? '<span style="font-size:7px;color:#00C8FF;margin-left:3px;">ER</span>'
                   : '';
    return `<div class="price-tile"${withId ? ` id="ptile-${p}"` : ''} style="min-width:100px;flex-shrink:0;">
      <div class="price-tile-pair">${p}${srcBadge}</div>
      <div class="price-tile-val">${price ? price.toFixed(dp) : '—'}</div>
    </div>`;
  };

  // Build one full sequence with category separators
  let sequence = '';
  TICKER_CATEGORIES.forEach(cat => {
    sequence += makeSep(cat.label);
    cat.pairs.forEach(p => { sequence += makeTile(p, true); });
  });

  // Second copy (no IDs — they're for live price update targeting only on copy A)
  let sequenceCopy = '';
  TICKER_CATEGORIES.forEach(cat => {
    sequenceCopy += makeSep(cat.label);
    cat.pairs.forEach(p => { sequenceCopy += makeTile(p, false); });
  });

  // Single track with exactly 2 identical copies — translate by -50% = one full loop
  mobile.innerHTML = `<div class="price-ticker-track">${sequence}${sequenceCopy}</div>`;
}

// ═══════════════════════════════════════════
// LIVE PRICES — SMART 5-SECOND REFRESH
// ═══════════════════════════════════════════
var prevPrices = {};        // store last known prices for change detection
var priceRefreshTimer = null;
var currentChartPair = 'XAUUSD';
var currentChartTF   = '15';

// TV_SYMBOLS built dynamically from INSTRUMENTS library above

function buildChartURL(pair, tf) {
  const sym = encodeURIComponent(TV_SYMBOLS[pair] || 'BINANCE:BTCUSDT');
  return `https://s.tradingview.com/widgetembed/?frameElementId=tv-chart-frame` +
    `&symbol=${sym}&interval=${tf}` +
    `&hidesidetoolbar=0&hidetoptoolbar=1&symboledit=1&saveimage=0` +
    `&toolbarbg=060608&studies=%5B%5D&theme=dark&style=1` +
    `&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=0&locale=en`;
}

function initChart() {
  const frame = document.getElementById('tv-chart-frame');
  if (frame) frame.src = buildChartURL(currentChartPair, currentChartTF);
}

function setChartTF(tf) {
  currentChartTF = tf;
  document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active-tf'));
  const btn = document.getElementById('tf-btn-' + tf);
  if (btn) btn.classList.add('active-tf');
  const frame = document.getElementById('tv-chart-frame');
  if (frame) frame.src = buildChartURL(currentChartPair, currentChartTF);
}

function setChartPair(pair) {
  currentChartPair = pair;
  const label = document.getElementById('tv-pair-label');
  if (label) label.textContent = pair;
  const frame = document.getElementById('tv-chart-frame');
  if (frame) frame.src = buildChartURL(currentChartPair, currentChartTF);
}

// ── Chart page dedicated controls ──
function chartSelectPair(btn, pair) {
  currentChartPair = pair;
  document.querySelectorAll('.chart-pair-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Update live price display
  const lp = document.getElementById('chart-live-price');
  const lpMob = document.getElementById('chart-live-price-mob');
  const lpPair = document.getElementById('chart-live-pair');
  if (lpPair) lpPair.textContent = pair;
  // Reload chart
  const frame = document.getElementById('tv-chart-frame');
  if (frame) frame.src = buildChartURL(pair, currentChartTF);
  // Also update scan chip to match if possible
  updateChartKeyLevels(pair);
  updateChartLivePrice(pair);
}

function chartSelectTF(btn, tf) {
  currentChartTF = tf;
  document.querySelectorAll('.chart-tf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const frame = document.getElementById('tv-chart-frame');
  if (frame) frame.src = buildChartURL(currentChartPair, tf);
}

function updateChartLivePrice(pair) {
  const price = prevPrices[pair];
  const lp = document.getElementById('chart-live-price');
  const lpMob = document.getElementById('chart-live-price-mob');
  if (lp && price) { lp.textContent = price.toFixed(pair==='BTCUSD'?2:pair==='XAUUSD'?2:5); }
  if (lpMob && price) { lpMob.textContent = price.toFixed(pair==='BTCUSD'?2:pair==='XAUUSD'?2:5); }
}

// Store last scan results for chart page key levels
var lastScanResults = [];

function updateChartKeyLevels(pair) {
  const el = document.getElementById('chart-key-levels');
  if (!el) return;
  const r = lastScanResults.find(x => x.pair === pair);
  if (!r || !r.keyLevels) {
    el.innerHTML = '<div style="font-size:11px;color:var(--text3);">Run a market scan to populate</div>';
    return;
  }
  const sup = (r.keyLevels.support || []).slice(0,3);
  const res = (r.keyLevels.resistance || []).slice(0,3);
  el.innerHTML = `
    <div style="margin-bottom:8px;">
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--green);letter-spacing:1px;margin-bottom:4px;">SUPPORT</div>
      ${sup.map(l=>`<div style="font-family:var(--font-mono);font-size:12px;color:var(--text2);padding:3px 0;border-bottom:1px solid var(--border);">${l}</div>`).join('')}
    </div>
    <div>
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--red);letter-spacing:1px;margin-bottom:4px;">RESISTANCE</div>
      ${res.map(l=>`<div style="font-family:var(--font-mono);font-size:12px;color:var(--text2);padding:3px 0;border-bottom:1px solid var(--border);">${l}</div>`).join('')}
    </div>`;
}

function calcChartPip() {
  const entry = parseFloat(document.getElementById('cp-entry')?.value) || 0;
  const sl    = parseFloat(document.getElementById('cp-sl')?.value)    || 0;
  const tp    = parseFloat(document.getElementById('cp-tp')?.value)    || 0;
  const slDist = document.getElementById('cp-sl-dist');
  const tpDist = document.getElementById('cp-tp-dist');
  const rrEl   = document.getElementById('cp-rr');
  const lotEl  = document.getElementById('cp-lot');

  if (!entry || !sl) {
    if (slDist) slDist.textContent = '—';
    if (tpDist) tpDist.textContent = '—';
    if (rrEl)   rrEl.textContent   = '—';
    if (lotEl)  lotEl.textContent  = '—';
    return;
  }
  const slD = Math.abs(entry - sl);
  const tpD = tp ? Math.abs(tp - entry) : null;
  const rr  = tpD ? (tpD / slD).toFixed(2) : '—';
  if (slDist) slDist.textContent = slD.toFixed(2) + ' pts';
  if (tpDist) tpDist.textContent = tpD ? tpD.toFixed(2) + ' pts' : '—';
  if (rrEl)   rrEl.textContent   = rr !== '—' ? '1:' + rr : '—';

  // Lot size from sidebar balance
  const bal  = parseFloat(document.getElementById('balance-input')?.value) || 0;
  const risk = parseFloat(document.getElementById('risk-input')?.value)    || 1;
  if (bal && slD) {
    const riskAmt = bal * risk / 100;
    const lot = Math.max(0.01, Math.floor((riskAmt / slD) * 100) / 100);
    if (lotEl) lotEl.textContent = lot.toFixed(2);
  } else {
    if (lotEl) lotEl.textContent = '—';
  }
}

async function fetchLivePrices() {
  const selected = getSelectedPairs();
  // Always fetch home price pairs + any scan selection (up to 12 total)
  const allPairs = [...new Set([...HOME_PRICE_PAIRS, ...selected])].slice(0, 12);

  // ── Step 1: Crypto → Binance WebSocket (always, free, real-time) ──────────
  syncBinanceConnections();
  const cryptoPairs  = allPairs.filter(p => BINANCE_SYMBOLS[p]);
  const nonCryptoPairs = allPairs.filter(p => !BINANCE_SYMBOLS[p]);

  // ── Step 2a: Forex/metals with Deriv mapping → Deriv WebSocket (primary, free, real-time) ──
  const derivPairs = nonCryptoPairs.filter(p => DERIV_SYMBOLS[p]);
  const tdOnlyPairs = nonCryptoPairs.filter(p => !DERIV_SYMBOLS[p]);

  // Ensure Deriv WS is open and subscribe all forex/metal pairs at once
  if (derivPairs.length) {
    atConnectDeriv(() => {
      derivPairs.forEach(p => {
        const derivSym = DERIV_SYMBOLS[p];
        if (derivSym) atDerivSubscribeTick(p, derivSym);
      });
    });
    // Prices flow into livePriceCache via atDerivWs.onmessage automatically
  }

  // ── Step 2b: Remaining non-crypto (indices, softs etc) → TwelveData fallback ──
  // ETF proxies are used for indices (DIA≈US30/100, SPY≈SPX500/10, QQQ≈NAS100/~43)
  const ETF_SCALE = { US30: 100, SPX500: 10, NAS100: 43, UK100: 110, GER40: 50, JPN225: 650, AUS200: 55, HK50: 700 };

  if (tdOnlyPairs.length) {
    const symbols = tdOnlyPairs.map(p => TD_SYMBOLS[p]).filter(Boolean);
    if (symbols.length) {
      try {
        const res = await fetch(`/api/prices?symbols=${encodeURIComponent(symbols.join(','))}`);
        if (res.ok) {
          const priceMap = await res.json();
          tdOnlyPairs.forEach(p => {
            const tdSym = TD_SYMBOLS[p];
            let price = tdSym ? priceMap[tdSym] : undefined;
            if (price && !isNaN(price)) {
              if (ETF_SCALE[p]) price = price * ETF_SCALE[p];
              livePriceCache[p] = price;
              priceSourceCache[p] = priceMap._source || 'td';
              updatePriceTileFromCache(p, price);
            }
          });
        }
      } catch(e) {
        console.warn('TwelveData price fallback failed:', e.message);
      }
    }
  }

  // ── Update UI chrome ──────────────────────────────────────────────────────
  rebuildPriceStrip();
  const mStamp  = document.getElementById('mobile-price-stamp');
  const liveDot = document.getElementById('price-live-dot');
  if (mStamp)  mStamp.textContent = new Date().toLocaleTimeString();
  if (liveDot) liveDot.style.display = 'block';
  updateChartLivePrice(currentChartPair);

  // ── Refresh right-panel open P&L with latest non-crypto prices ────────────
  updateSidebarStats();

  // ── Schedule next poll (Binance WS handles crypto continuously) ───────────
  clearTimeout(priceRefreshTimer);
  priceRefreshTimer = setTimeout(fetchLivePrices, 15000);
}

// ─── BINANCE CANDLE FETCH ─────────────────────────────────────────────────────
var BINANCE_INTERVAL_MAP = {
  '1day':  '1d',
  '4h':    '4h',
  '1h':    '1h',
  '15min': '15m',
};

async function fetchCandlesBinance(symbol, interval, outputsize) {
  const bSym = BINANCE_SYMBOLS[symbol];
  if (!bSym) throw new Error('No Binance symbol for ' + symbol);
  const biv = BINANCE_INTERVAL_MAP[interval];
  if (!biv) throw new Error('No Binance interval for ' + interval);
  const url = `https://api.binance.com/api/v3/klines?symbol=${bSym}&interval=${biv}&limit=${outputsize}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) throw new Error('Binance returned no candles for ' + symbol);
  // Binance kline: [openTime, open, high, low, close, ...]
  return data.reverse().map(k => ({
    datetime: new Date(k[0]).toISOString().slice(0,16).replace('T',' '),
    open:  parseFloat(k[1]).toFixed(5),
    high:  parseFloat(k[2]).toFixed(5),
    low:   parseFloat(k[3]).toFixed(5),
    close: parseFloat(k[4]).toFixed(5),
  }));
}

// ─── MAIN CANDLE FETCH (TD primary → Binance for crypto) ─────────────────────
async function fetchCandles(symbol, interval, outputsize) {
  const intervalMap = { '1day':'1day', '4h':'4h', '1h':'1h', '15min':'15min', '4H':'4h', '1H':'1h', 'D':'1day' };
  const iv = intervalMap[interval] || interval;

  // 1. Crypto: Binance first (free, always open, weekend-safe)
  if (BINANCE_SYMBOLS[symbol]) {
    try {
      return await fetchCandlesBinance(symbol, iv, outputsize);
    } catch(e) {
      console.warn('Binance candles failed for', symbol, '—', e.message, '— trying TD');
    }
  }

  // 2. Twelve Data via /api/candles (Upstash Redis cached)
  try {
    const sym = TD_SYMBOLS[symbol] || symbol;
    const url = `${WORKER_URL}/candles?symbol=${sym}&interval=${iv}&outputsize=${outputsize}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'error') throw new Error(data.message || 'TD error');
    if (!data.values) throw new Error('TD returned no values');
    return data.values;
  } catch(e) {
    console.warn('TD candles failed for', symbol, '—', e.message);
  }

  // No candle data available — scan will run on Claude's knowledge only
  throw new Error(`No candle data source available for ${symbol}. Add a Twelve Data key in Settings for live candle data.`);
}

function summariseCandles(candles, label) {
  if (!candles.length) return `${label}: no data available`;
  const closes = candles.map(c => parseFloat(c.close));
  const highs  = candles.map(c => parseFloat(c.high));
  const lows   = candles.map(c => parseFloat(c.low));
  const current = closes[0];
  const oldest  = closes[closes.length-1];
  const highest = Math.max(...highs).toFixed(2);
  const lowest  = Math.min(...lows).toFixed(2);
  const trend   = current > oldest ? 'RISING' : current < oldest ? 'FALLING' : 'FLAT';
  const r5H = highs.slice(0,5).map(h=>h.toFixed(2)).join(', ');
  const r5L = lows.slice(0,5).map(l=>l.toFixed(2)).join(', ');
  const r10C = closes.slice(0,10).map(c=>c.toFixed(2)).join(', ');
  return `${label}: current=${current.toFixed(2)}, overall=${trend}, range=[${lowest}–${highest}], recent_highs=[${r5H}], recent_lows=[${r5L}], last_10_closes=[${r10C}]`;
}

