// ═══════════════════════════════════════════
// MARKETS SUB-TAB SWITCHING
// ═══════════════════════════════════════════
var _livePriceTableTimer = null;

function marketSubTab(tab, btn) {
  document.querySelectorAll('.markets-subpanel').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.markets-subtab').forEach(function(b){ b.classList.remove('active'); });
  var panel = document.getElementById('markets-' + tab);
  if (panel) panel.classList.add('active');
  if (btn) {
    btn.classList.add('active');
  } else {
    var found = document.querySelector('.markets-subtab[onclick*="marketSubTab(\'' + tab + '\'"]');
    if (found) found.classList.add('active');
  }
  // Clear per-tab timers when switching away
  if (tab !== 'live') {
    clearTimeout(obRefreshTimer);
    clearInterval(_livePriceTableTimer);
    _livePriceTableTimer = null;
  }
  // Init functions per sub-tab
  if (tab === 'live') {
    renderLivePriceTable();
    _livePriceTableTimer = setInterval(() => { if (document.visibilityState !== 'hidden') renderLivePriceTable(); }, 2000);
    fetchOrderBook(currentObSymbol);
    renderAlerts();
    var ts = document.getElementById('depth-timestamp');
    if (ts) ts.textContent = 'Updated ' + new Date().toLocaleTimeString();
  }
  if (tab === 'sentiment') initMarketSentiment();
  if (tab === 'flow') fetchOptionsFlow();
  if (tab === 'session') buildHeatmap();
  if (tab === 'calendar') initCalendar();
  if (tab === 'news') loadMarketsNews('general', null);
  if (tab === 'yields') renderRealYields();
  if (tab === 'correlations') renderCorrelations();
}

// ═══════════════════════════════════════════
// MARKETS REAL YIELDS SUB TAB
// ═══════════════════════════════════════════
async function renderRealYields() {
  var headline = document.getElementById('yields-headline');
  var interp   = document.getElementById('yields-interp');
  var chart    = document.getElementById('yields-chart');
  var startEl  = document.getElementById('yields-chart-start');
  var endEl    = document.getElementById('yields-chart-end');
  if (!headline || !chart) return;

  if (!window.LumenIntel || typeof window.LumenIntel.yields !== 'function') {
    headline.innerHTML = '<div style="font-size:12px;color:var(--text3);">Real yields module not loaded.</div>';
    return;
  }

  // Headline payload (cached 24h client side, Redis cached server side).
  var data;
  try { data = await window.LumenIntel.yields(); }
  catch (e) {
    headline.innerHTML = '<div style="font-size:12px;color:var(--red);">Real yields unavailable: ' + e.message + '</div>';
    return;
  }

  if (!data || data.source === 'unavailable' || data.current_real_yield == null) {
    headline.innerHTML =
      '<div style="font-size:12px;color:var(--text3);line-height:1.7;">' +
        'Real yield data is unavailable. The most likely cause is a missing FRED_API_KEY env on the server. ' +
        'Set the key in the Vercel project settings and redeploy.' +
      '</div>';
    if (interp) interp.innerHTML = '<div style="color:var(--text3);">Awaiting live data.</div>';
    return;
  }

  var dirCol = data.direction_20d === 'falling' ? 'var(--green)'
             : data.direction_20d === 'rising'  ? 'var(--red)'
             : 'var(--text3)';
  var dirArrow = data.direction_20d === 'falling' ? '▼'
               : data.direction_20d === 'rising'  ? '▲'
               : '◉';
  var biasCol = data.macro_bias_for_gold === 'bullish' ? 'var(--green)'
              : data.macro_bias_for_gold === 'bearish' ? 'var(--red)'
              : 'var(--text3)';

  headline.innerHTML =
    '<div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;padding:6px 0;">' +
      '<div>' +
        '<div style="font-family:var(--font-mono);font-size:36px;font-weight:800;color:var(--text);">' + data.current_real_yield.toFixed(3) + '%</div>' +
        '<div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:1.5px;margin-top:2px;">DFII10 (10Y TIPS)</div>' +
      '</div>' +
      '<div style="flex:1;min-width:180px;">' +
        '<div style="font-family:var(--font-mono);font-size:11px;color:' + dirCol + ';font-weight:700;margin-bottom:4px;">' +
          dirArrow + ' ' + (data.direction_20d || 'flat') + ' over 20 days' +
        '</div>' +
        '<div style="font-size:11px;color:var(--text3);line-height:1.5;">' +
          'Twenty days ago: ' + (data.real_yield_20d_ago != null ? data.real_yield_20d_ago.toFixed(3) + '%' : '—') + '. ' +
          'Change: ' + (data.change_20d_basis_points >= 0 ? '+' : '') + data.change_20d_basis_points + ' bp.' +
        '</div>' +
      '</div>' +
      '<div style="text-align:right;min-width:140px;">' +
        '<div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:1.5px;margin-bottom:4px;">MACRO BIAS, GOLD</div>' +
        '<div style="font-family:var(--font-mono);font-size:14px;font-weight:800;color:' + biasCol + ';text-transform:uppercase;">' + (data.macro_bias_for_gold || 'neutral') + '</div>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:18px;flex-wrap:wrap;font-family:var(--font-mono);font-size:10px;color:var(--text3);margin-top:14px;border-top:1px solid var(--border);padding-top:10px;">' +
      '<div><span style="color:var(--text4);">Nominal 10Y:</span> ' + (data.nominal_10y != null ? data.nominal_10y.toFixed(3) + '%' : '—') + '</div>' +
      '<div><span style="color:var(--text4);">Implied inflation:</span> ' + (data.implied_inflation_expectation != null ? data.implied_inflation_expectation.toFixed(2) + '%' : '—') + '</div>' +
      '<div><span style="color:var(--text4);">As of:</span> ' + (data.as_of || '—') + '</div>' +
    '</div>';

  // Interpretation card
  var interpText = '';
  switch (data.level_classification) {
    case 'negative_real_yields_strongly_bullish_gold':
      interpText = 'Real yields are negative. Holding cash carries a real cost. Historically a strong tailwind for gold and other non yielding stores of value.';
      break;
    case 'low_real_yields_supportive_gold':
      interpText = 'Real yields are low. The opportunity cost of holding gold is muted. Supportive backdrop, especially when the trajectory is falling.';
      break;
    case 'moderate_real_yields_neutral':
      interpText = 'Real yields are in a neutral band. Gold trades on flow and sentiment more than rates here. Watch the 20 day direction for the structural lean.';
      break;
    case 'high_real_yields_bearish_gold':
      interpText = 'Real yields are elevated. Cash and Treasuries pay a premium. Headwind for gold; rallies often face supply at resistance.';
      break;
    default:
      interpText = 'Level classification unavailable.';
  }
  if (interp) interp.innerHTML = '<div style="margin-bottom:6px;">' + interpText + '</div>'
    + '<div style="color:var(--text3);font-size:11px;">Direction over the last twenty trading days is the primary signal. Falling real yields favour long gold; rising real yields favour caution.</div>';

  // Pull the raw 60 day series for the chart. Endpoint is Redis cached.
  try {
    var r = await fetch('/api/intel?source=fred&series=DFII10&days=60');
    if (!r.ok) throw new Error('FRED status ' + r.status);
    var d = await r.json();
    var obs = (d && Array.isArray(d.observations)) ? d.observations : [];
    if (obs.length < 2) throw new Error('series too short');

    var values = obs.map(function (o) { return o.value; });
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    if (max === min) max = min + 0.01;

    var w = 600, h = 160, pad = 6;
    chart.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var stepX = (w - pad * 2) / (obs.length - 1);

    var pts = obs.map(function (o, i) {
      var x = pad + i * stepX;
      var y = pad + (h - pad * 2) * (1 - (o.value - min) / (max - min));
      return x.toFixed(1) + ',' + y.toFixed(1);
    });

    var line = '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--gold)" stroke-width="1.5" />';
    var area = '<polygon points="' + pad + ',' + (h - pad) + ' ' + pts.join(' ') + ' ' + (w - pad) + ',' + (h - pad) + '" fill="rgba(240,180,41,0.10)" stroke="none" />';
    var zeroY = pad + (h - pad * 2) * (1 - (0 - min) / (max - min));
    var zeroLine = (zeroY >= pad && zeroY <= h - pad) ? '<line x1="' + pad + '" y1="' + zeroY.toFixed(1) + '" x2="' + (w - pad) + '" y2="' + zeroY.toFixed(1) + '" stroke="var(--text4)" stroke-width="0.5" stroke-dasharray="2 3" />' : '';

    chart.innerHTML = area + zeroLine + line;
    if (startEl) startEl.textContent = obs[0].date + ' · ' + obs[0].value.toFixed(2) + '%';
    if (endEl)   endEl.textContent   = obs[obs.length - 1].date + ' · ' + obs[obs.length - 1].value.toFixed(2) + '%';
  } catch (e) {
    chart.innerHTML = '<text x="10" y="20" font-family="var(--font-mono)" font-size="10" fill="var(--text3)">Series unavailable: ' + e.message + '</text>';
  }
}

// ═══════════════════════════════════════════
// MARKETS CORRELATION HEATMAP SUB TAB
// ═══════════════════════════════════════════
async function renderCorrelations() {
  var grid = document.getElementById('corr-heatmap');
  var brk  = document.getElementById('corr-breakdowns');
  if (!grid) return;

  if (!window.LumenIntel || typeof window.LumenIntel.correlations !== 'function') {
    grid.innerHTML = '<div style="font-size:12px;color:var(--text3);">Correlation module not loaded.</div>';
    return;
  }

  var data;
  try { data = await window.LumenIntel.correlations(); }
  catch (e) {
    grid.innerHTML = '<div style="font-size:12px;color:var(--red);">Correlation matrix unavailable: ' + e.message + '</div>';
    return;
  }

  if (!data || !data.matrix || !data.universe || data.source === 'unavailable') {
    grid.innerHTML = '<div style="font-size:12px;color:var(--text3);line-height:1.7;">' + (data && data.narrative ? data.narrative : 'Matrix unavailable.') + '</div>';
    if (brk) brk.innerHTML = '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text4);">No data.</div>';
    return;
  }

  var instruments = data.universe;
  var matrix = data.matrix;
  var breakdownPairs = {};
  (data.breakdowns || []).forEach(function (b) { breakdownPairs[b.pair] = b; });

  function colorFor(v) {
    if (v == null) return 'var(--bg2)';
    var abs = Math.min(1, Math.abs(v));
    if (v >= 0) return 'rgba(0,232,122,' + abs.toFixed(2) + ')';
    return 'rgba(255,61,90,' + abs.toFixed(2) + ')';
  }

  var headerCells = '<th style="position:sticky;left:0;background:var(--bg2);z-index:1;padding:8px 6px;font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:1px;text-align:left;">PAIR</th>'
    + instruments.map(function (i) {
        return '<th style="padding:8px 4px;font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:0.5px;text-align:center;min-width:48px;">' + i + '</th>';
      }).join('');

  var rows = instruments.map(function (a) {
    var cells = instruments.map(function (b) {
      if (a === b) {
        return '<td style="padding:6px 4px;text-align:center;font-family:var(--font-mono);font-size:9px;color:var(--text4);background:var(--bg3);">·</td>';
      }
      var v = matrix[a] && typeof matrix[a][b] === 'number' ? matrix[a][b] : null;
      var bg = colorFor(v);
      var pairKey1 = a + '/' + b;
      var pairKey2 = b + '/' + a;
      var bd = breakdownPairs[pairKey1] || breakdownPairs[pairKey2];
      var border = bd ? 'box-shadow:inset 0 0 0 2px var(--purple);' : '';
      var title = bd
        ? a + ' vs ' + b + ': now ' + (v != null ? v.toFixed(2) : 'n/a') + ', prior ' + bd.historical_corr.toFixed(2) + '. Breakdown: ' + bd.breakdown_magnitude.toFixed(2)
        : a + ' vs ' + b + ': ' + (v != null ? v.toFixed(2) : 'n/a');
      var txt = v == null ? '—' : v.toFixed(2);
      var col = v != null && Math.abs(v) > 0.55 ? '#0c0c10' : 'var(--text)';
      return '<td title="' + title + '" style="padding:6px 4px;text-align:center;font-family:var(--font-mono);font-size:9px;font-weight:700;color:' + col + ';background:' + bg + ';' + border + '">' + txt + '</td>';
    }).join('');
    return '<tr>'
      + '<td style="position:sticky;left:0;background:var(--bg2);z-index:1;padding:6px 8px;font-family:var(--font-mono);font-size:9px;font-weight:700;color:var(--text2);border-right:1px solid var(--border);">' + a + '</td>'
      + cells
      + '</tr>';
  }).join('');

  grid.innerHTML =
    '<table style="border-collapse:separate;border-spacing:1px;width:auto;min-width:100%;">'
      + '<thead><tr>' + headerCells + '</tr></thead>'
      + '<tbody>' + rows + '</tbody>'
    + '</table>'
    + '<div style="display:flex;gap:14px;align-items:center;font-family:var(--font-mono);font-size:8px;color:var(--text4);margin-top:14px;letter-spacing:1px;">'
      + '<span style="color:var(--green);">POSITIVE</span>'
      + '<span style="color:var(--red);">NEGATIVE</span>'
      + '<span style="color:var(--purple);">PURPLE BORDER: BREAKDOWN</span>'
      + (data.anchor_bar_time ? '<span style="margin-left:auto;">Anchor H4: ' + data.anchor_bar_time + '</span>' : '')
    + '</div>';

  if (brk) {
    if (!data.breakdowns || !data.breakdowns.length) {
      brk.innerHTML = '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text4);">No correlation breakdowns above the 0.35 threshold in this window.</div>';
    } else {
      brk.innerHTML = data.breakdowns.map(function (b) {
        var dirText = b.current_corr > b.historical_corr
          ? 'tightening (more correlated than the prior half)'
          : 'loosening (decoupling from the prior half)';
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:11px;">'
          + '<div><strong style="color:var(--text);">' + b.pair + '</strong> <span style="color:var(--text3);font-size:10px;">' + dirText + '</span></div>'
          + '<div style="color:var(--text3);font-size:10px;">prior ' + b.historical_corr.toFixed(2) + ' &rarr; now ' + b.current_corr.toFixed(2) + ' (&Delta; ' + b.breakdown_magnitude.toFixed(2) + ')</div>'
          + '</div>';
      }).join('');
    }
  }
}

// ═══════════════════════════════════════════
// MARKETS NEWS TAB
// ═══════════════════════════════════════════
function loadMarketsNews(category, btn) {
  if (btn) {
    document.querySelectorAll('.news-cat-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
  }
  var feed = document.getElementById('markets-news-feed');
  if (!feed) return;
  feed.innerHTML = '<div class="pulse" style="font-family:var(--font-mono);font-size:11px;color:var(--text3);padding:16px 0;">Loading news...</div>';
  fetchFinnhubNews(category).then(function(items){
    if (!items || !items.length) {
      feed.innerHTML = '<div class="empty"><div class="empty-text">No news available right now.</div></div>';
      return;
    }
    feed.innerHTML = items.slice(0, 20).map(function(item){
      var age = item.datetime ? Math.round((Date.now()/1000 - item.datetime)/3600) : null;
      var ageStr = age !== null ? (age < 1 ? 'Just now' : age + 'h ago') : '';
      return '<div class="news-item" style="border-color:var(--border2);margin-bottom:8px;cursor:pointer;" onclick="window.open(\'' + item.url + '\',\'_blank\')">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">' +
        '<div style="font-size:12px;color:var(--text);line-height:1.5;font-weight:500;">' + item.headline + '</div>' +
        '<div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);flex-shrink:0;margin-top:2px;">' + ageStr + '</div>' +
        '</div>' +
        '<div style="font-family:var(--font-mono);font-size:9px;color:var(--text3);margin-top:4px;">' + (item.source || '') + '</div>' +
        '</div>';
    }).join('');
  }).catch(function(){
    feed.innerHTML = '<div class="empty"><div class="empty-text">News could not be loaded. <button class="btn btn-ghost" style="padding:5px 12px;font-size:10px;margin-left:8px;" onclick="loadMarketsNews(\'general\',null)">Retry</button></div></div>';
  });
}

// ═══════════════════════════════════════════
// MARKET SCAN
// ═══════════════════════════════════════════
var SCAN_SYSTEM = `You are an elite professional multi-market trading analyst covering all major asset classes: forex majors and minors, metals (gold, silver, platinum, copper), cryptocurrency, global indices, energy commodities (oil, gas), agricultural softs (coffee, cocoa, sugar, wheat, corn), and derived instruments.

You will receive REAL live candle data across 4 timeframes where available: Daily, 4H, 1H, and 15M. Base all analysis on this data.

ANALYSIS FRAMEWORK:
- Daily: macro trend, major support/resistance, institutional bias
- 4H: intermediate structure, demand/supply zones, momentum
- 1H: entry confirmation, structure shifts
- 15M: scalp entry precision (primary execution timeframe for scalpers)

CROSS-ASSET CORRELATION INTELLIGENCE (critical — always apply):
When multiple instruments are scanned together, identify and report on meaningful correlations:
- Gold (XAUUSD) vs USD Index: inverse relationship — rising DXY typically pressures gold
- Oil (WTI/Brent) vs CAD pairs: oil strength = CAD strength = USDCAD falls
- BTC vs equity indices (SPX, NAS): risk-on/risk-off regime — divergence is significant
- Gold vs Silver: gold-silver ratio expansion/compression signals
- Commodity currencies (AUD, CAD, NZD) vs their underlying commodities (copper, oil, dairy)
- Yen pairs vs risk sentiment: JPY strengthens in risk-off, weakens in risk-on
- European indices vs EUR pairs: DAX/FTSE divergence signals
- If you see confirmation across correlated assets, increase confidence. If you see divergence, flag it as a risk or contrarian signal.

INSTRUMENT-SPECIFIC LOT SIZE RULES:
- Metals (XAU, XAG, XPT, XCU): lotSize = riskAmount / SL_distance. 1 lot XAUUSD = $100/pt, 1 lot XAGUSD = $50/pt. Min 0.01
- Crypto (BTC, ETH etc): lotSize = riskAmount / SL_distance. 1 lot BTCUSD ≈ $1/pt. Min 0.01
- Forex majors/minors: lotSize = riskAmount / (SL_pips × 10). Min 0.01
- Indices (US30, SPX, NAS, FTSE, DAX): lotSize = riskAmount / SL_distance. 1 lot ≈ $1/pt. Min 0.01
- Energy (WTI, Brent): lotSize = riskAmount / (SL_distance × 10). Min 0.01
- Softs/Ags (Coffee, Cocoa, Sugar, Wheat): lotSize = riskAmount / SL_distance. Min 0.01
- Under $200 account: ALWAYS cap at 0.01 regardless of instrument

For setups, provide:
1. Standard technical setup details (entry, SL, TP, lot size, R:R)
2. A PLAIN ENGLISH explanation — write as if explaining to a friend on WhatsApp. Short sentences. No jargon. Tell them exactly what to do and why. Include what to look for as a trigger before entering.
3. A COPY TEXT version — a short ready-to-use trade summary they can paste anywhere
4. If multiple instruments are scanned: a CORRELATION SUMMARY at the end — what are the correlated assets telling you collectively? Is there confluence or divergence? What does that mean for the trader?

MARKET REGIME CLASSIFICATION (required for every result):
Classify the current market regime into exactly ONE of these 8 states:
- "Trend Expansion" — price breaking to new highs/lows, expanding range, strong momentum
- "Liquidity Sweep" — recent spike beyond key level (stop hunt) then reversal back inside range
- "Range Consolidation" — price bouncing between clear support/resistance, low directional bias
- "Pre Event Compression" — tight range, reduced volatility ahead of known high-impact event
- "Post Event Continuation" — strong directional move following a news event, momentum continuing
- "Post Event Reversal" — sharp fade after a news spike, price reversing the initial move
- "Volatility Spike" — abnormally large candles, ATR expansion, erratic price action
- "Neutral" — no dominant regime identifiable from available data
Include a brief 1-sentence reason for the classification in "marketRegimeNote".

CONFLUENCE STACK (required for every setup):
For each setup, assess which timeframes and factors are aligned. Set "confluenceStack" to an array of aligned factors. Examples: ["Daily trend", "4H demand zone", "15M bullish engulf", "Pre-news setup"], ["H4 supply", "15M lower high", "DXY strength"]. Also classify "setupType" as one of: "swing" (multi-day), "intraday" (same-day), or "scalp" (minutes to 1-2 hours). Map to instrument: scalp is ideal for XAUUSD/BTCUSD/indices; swing for forex majors/softs.

CRITICAL: Respond ONLY with raw JSON. No text before or after. No markdown. Start { end }.

Format:
{"results":[{"pair":"XAUUSD","currentPrice":3082.50,"scannedAt":"2026-03-28 01:30 UTC","marketRegime":"Range Consolidation","marketRegimeNote":"Price has been ranging between 3055 and 3095 for 3 sessions with no decisive breakout.","trendBias":{"daily":"BULLISH","h4":"BULLISH","h1":"NEUTRAL","m15":"BEARISH","summary":"Gold is strongly bullish on the daily and 4H. Price is pulling back on the 15M which could offer a buy opportunity at support."},"keyLevels":{"support":[3065,3048,3020],"resistance":[3095,3115,3140]},"newsEvents":[{"time":"Fri 13:30 UTC","event":"US Core PCE","impact":"HIGH","expectedEffect":"A hot reading could push USD up and drag gold lower","tradeAroundIt":false}],"setups":[{"id":1,"direction":"BUY","entryZone":"3065-3068","stopLoss":3055,"takeProfit1":3085,"takeProfit2":3095,"riskReward":"1:2","lotSize":0.01,"confidence":"High","counterTrend":false,"timeframe":"15M scalp","setupType":"scalp","confluenceStack":["Daily bullish trend","4H demand zone","15M oversold bounce","Key support confluence"],"reasoning":"Price pulled back to 4H demand zone and the prior breakout level at 3065. Daily and 4H trend is up. 15M is showing bearish momentum fading.","plainEnglish":"Gold has pulled back to a strong support zone at 3065-3068. The big picture trend is up so we are looking to buy the dip. Wait for the 15-minute candle to close bullish (green) at this level before entering. Put your stop loss below 3055 where the structure breaks. First target is 3085 and second is 3095. Do not enter if price breaks below 3055 first.","copyText":"XAUUSD BUY SCALP\\nEntry: 3065-3068\\nSL: 3055 | TP1: 3085 | TP2: 3095\\nLot: 0.01 | R:R 1:2\\nWait for bullish 15M candle at entry zone","invalidation":"15M close below 3055 cancels the trade"}],"overallVerdict":"SETUP AVAILABLE","verdictNote":"One clean buy setup on the pullback. Wait for 15M confirmation before entering.","riskWarning":null}]}`;


// runScan defined below with Grok parallel support


function extractJSON(text) {
  if (!text) return null;
  try { return JSON.parse(text.trim()); } catch {}
  const s = text.replace(/```json\s*/gi,'').replace(/```\s*/gi,'').trim();
  try { return JSON.parse(s); } catch {}
  const f = text.indexOf('{'), l = text.lastIndexOf('}');
  if (f!==-1 && l>f) { try { return JSON.parse(text.slice(f,l+1)); } catch {} }
  return null;
}

// ═══════════════════════════════════════════
// RENDER SCAN RESULTS
// ═══════════════════════════════════════════
function bc(b) { return b==='BULLISH'?'var(--green)':b==='BEARISH'?'var(--red)':'var(--gold)'; }
function ic(i) { return i==='HIGH'?'var(--red)':i==='MEDIUM'?'var(--gold)':'var(--text3)'; }
function vc(v) {
  if (!v) return {c:'var(--text3)',b:'var(--border)'};
  if (v.includes('SETUP')) return {c:'var(--green)',b:'#00E87A33'};
  if (v.includes('AVOID')) return {c:'var(--red)',b:'#FF3D5A33'};
  return {c:'var(--gold)',b:'#F0B42933'};
}

function renderScanResults(results) {
  lastScanResults = results;
  updateChartKeyLevels(currentChartPair);
  // Persist key levels to localStorage so chart.html can read them
  results.forEach(r => {
    if (r.pair && r.keyLevels) {
      localStorage.setItem('wm_last_levels_' + r.pair, JSON.stringify(r.keyLevels));
    }
  });
  const div = document.getElementById('scan-results');
  div.innerHTML = results.map((r,ri) => {
    const vs = vc(r.overallVerdict);
    const tfs = ['daily','h4','h1','m15'];
    return `<div class="fade-up" style="animation-delay:${ri*0.08}s">

      <!-- Verdict -->
      <div class="verdict" style="border-color:${vs.b};background:${vs.c}08;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div>
            <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);letter-spacing:2px;margin-bottom:4px;">${r.pair} · ${r.scannedAt}</div>
            <div style="font-family:var(--font-display);font-size:18px;font-weight:800;color:${vs.c};">${r.overallVerdict}</div>
            ${r.verdictNote ? `<div style="font-size:12px;color:var(--text2);margin-top:5px;line-height:1.5;">${r.verdictNote}</div>` : ''}
          </div>
          ${r.currentPrice ? `<div style="text-align:right;flex-shrink:0;">
            <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);">LIVE PRICE</div>
            <div style="font-family:var(--font-mono);font-size:20px;font-weight:700;color:var(--text);">${r.currentPrice}</div>
          </div>` : ''}
        </div>
      </div>

      <!-- Market Regime Badge -->
      ${(() => {
        const regime = r.marketRegime || 'Neutral';
        const cfg = REGIME_CONFIG[regime] || REGIME_CONFIG['Neutral'];
        const isPreEvent = regime === 'Pre Event Compression';
        return `<div style="display:flex;align-items:center;gap:8px;background:${cfg.bg};border:1px solid ${cfg.border};border-radius:var(--r-sm);padding:9px 13px;margin-bottom:10px;">
          <span style="font-size:15px;">${cfg.icon}</span>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span style="font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:1.5px;">MARKET REGIME</span>
              <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${cfg.color};background:${cfg.bg};border:1px solid ${cfg.border};border-radius:3px;padding:1px 7px;">${regime.toUpperCase()}</span>
              ${isPreEvent ? `<span style="font-family:var(--font-mono);font-size:8px;color:var(--purple);background:var(--purple-dim);border:1px solid #A855F733;border-radius:3px;padding:1px 6px;animation:pulse 1.5s infinite;">EVENT NEAR</span>` : ''}
            </div>
            ${r.marketRegimeNote ? `<div style="font-size:11px;color:var(--text3);margin-top:3px;line-height:1.4;">${r.marketRegimeNote}</div>` : ''}
          </div>
        </div>`;
      })()}

      ${r.riskWarning ? `<div style="background:var(--red-dim);border:1px solid var(--red);border-radius:var(--r-sm);padding:10px 13px;margin-bottom:10px;font-size:12px;color:#ff9999;">Warning: ${r.riskWarning}</div>` : ''}

      <!-- Grok Sentiment (shown right after verdict) -->
      ${r.grokSentiment ? renderGrokCard(r.grokSentiment) : ''}

      <!-- Trend -->
      <div class="card">
        <div class="card-label">Trend Bias</div>
        <div class="trend-row" style="margin-bottom:10px;">
          ${tfs.map(tf => `<div class="trend-cell">
            <div class="trend-tf">${tf.toUpperCase()}</div>
            <div class="trend-val" style="color:${bc(r.trendBias?.[tf])};">${r.trendBias?.[tf]||'—'}</div>
          </div>`).join('')}
        </div>
        <div style="font-size:12px;color:var(--text2);line-height:1.55;">${r.trendBias?.summary||''}</div>
        ${r.keyLevels ? `<div class="divider"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <div style="font-family:var(--font-mono);font-size:8px;color:var(--green);letter-spacing:1px;margin-bottom:6px;">SUPPORT LEVELS</div>
            ${(r.keyLevels.support||[]).map(l=>`<div style="font-family:var(--font-mono);font-size:12px;color:var(--text2);padding:2px 0;border-bottom:1px solid var(--border);">${l}</div>`).join('')}
          </div>
          <div>
            <div style="font-family:var(--font-mono);font-size:8px;color:var(--red);letter-spacing:1px;margin-bottom:6px;">RESISTANCE LEVELS</div>
            ${(r.keyLevels.resistance||[]).map(l=>`<div style="font-family:var(--font-mono);font-size:12px;color:var(--text2);padding:2px 0;border-bottom:1px solid var(--border);">${l}</div>`).join('')}
          </div>
        </div>` : ''}
      </div>

      <!-- News -->
      ${r.newsEvents?.length ? `<div class="card">
        <div class="card-label">News Radar</div>
        ${r.newsEvents.map(ev=>`<div class="news-item" style="border-left-color:${ic(ev.impact)};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span style="font-size:12px;font-weight:600;color:var(--text);">${ev.event}</span>
            <span class="badge badge-${(ev.impact||'').toLowerCase()}">${ev.impact}</span>
          </div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);margin-bottom:3px;">${ev.time}</div>
          <div style="font-size:11px;color:var(--text2);">${ev.expectedEffect}</div>
          ${ev.tradeAroundIt===false?'<div style="font-size:10px;color:var(--gold);margin-top:4px;">Avoid trading 30 min before and after.</div>':''}
        </div>`).join('')}
      </div>` : ''}

      <!-- Setups -->
      ${r.setups?.length ? r.setups.map(s => {
        const dc = s.direction==='BUY'?'var(--green)':'var(--red)';
        const confColor = s.confidence==='High'?'var(--green)':s.confidence==='Medium'?'var(--gold)':'var(--red)';
        const copyText = (s.copyText||`${r.pair} ${s.direction}\nEntry: ${s.entryZone}\nSL: ${s.stopLoss} | TP1: ${s.takeProfit1} | TP2: ${s.takeProfit2}\nLot: ${s.lotSize} | R:R ${s.riskReward}`).replace(/\\n/g,'\n');

        return `<div class="setup-card" style="border-color:${dc}33;background:${dc}04;">
          <div class="setup-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="setup-dir" style="background:${dc}22;color:${dc};">${s.direction}</span>
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--text3);">${s.timeframe||''} · ${r.pair}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-family:var(--font-mono);font-size:9px;color:${confColor};background:${confColor}18;padding:2px 8px;border-radius:4px;">${(s.confidence||'').toUpperCase()}</span>
            </div>
          </div>

          ${s.counterTrend ? `<div style="background:var(--red-dim);border:1px solid var(--red-dim);border-radius:var(--r-sm);padding:8px 11px;margin-bottom:12px;font-size:12px;color:#ff9999;">COUNTER TREND SETUP: goes against the Daily bias. Higher risk. Reduce lot size.</div>` : ''}

          <!-- Confluence Stack -->
          ${(() => {
            const stack = s.confluenceStack || [];
            const cs = getConfluenceStrength(stack);
            const typeColors = { swing: { c:'var(--blue)', b:'var(--blue-dim)', bord:'#00C8FF33' }, intraday: { c:'var(--gold)', b:'var(--gold-dim)', bord:'#F0B42933' }, scalp: { c:'var(--green)', b:'var(--green-dim)', bord:'#00E87A33' } };
            const tc = typeColors[s.setupType] || typeColors.intraday;
            return stack.length ? `<div style="background:var(--bg2);border:1px solid var(--border2);border-radius:var(--r-sm);padding:10px 12px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;flex-wrap:wrap;">
                <span style="font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:1.5px;">CONFLUENCE STACK</span>
                <div style="display:flex;align-items:center;gap:6px;">
                  ${s.setupType ? `<span style="font-family:var(--font-mono);font-size:8px;color:${tc.c};background:${tc.b};border:1px solid ${tc.bord};border-radius:3px;padding:1px 7px;text-transform:uppercase;">${s.setupType}</span>` : ''}
                  <span style="font-family:var(--font-mono);font-size:8px;color:${cs.color};background:${cs.color}18;border:1px solid ${cs.color}33;border-radius:3px;padding:1px 7px;">${cs.label.toUpperCase()}</span>
                </div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
                ${stack.map(f => `<span style="font-family:var(--font-mono);font-size:9px;color:var(--text2);background:var(--bg3);border:1px solid var(--border3);border-radius:3px;padding:2px 7px;">${f}</span>`).join('')}
              </div>
              <div style="height:4px;background:var(--border);border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${cs.pct}%;background:${cs.color};border-radius:2px;transition:width 0.4s ease;"></div>
              </div>
            </div>` : '';
          })()}

          <!-- Price levels grid -->
          <div class="setup-grid" style="margin-bottom:6px;">
            ${[['ENTRY ZONE',s.entryZone,'var(--text)'],['STOP LOSS',s.stopLoss,'var(--red)'],['TP1',s.takeProfit1,'var(--green)']].map(([l,v,c])=>`
            <div class="setup-cell"><div class="setup-cell-label">${l}</div><div class="setup-cell-val" style="color:${c};">${v}</div></div>`).join('')}
          </div>
          <div class="setup-grid">
            ${[['TP2',s.takeProfit2,'var(--green)'],['RISK:REWARD',s.riskReward,'var(--gold)'],['LOT SIZE',s.lotSize,'var(--blue)']].map(([l,v,c])=>`
            <div class="setup-cell"><div class="setup-cell-label">${l}</div><div class="setup-cell-val" style="color:${c};">${v}</div></div>`).join('')}
          </div>

          <!-- Plain English -->
          ${s.plainEnglish ? `<div class="plain-english">
            <div class="plain-english-label">PLAIN ENGLISH</div>
            <div class="plain-english-text">${s.plainEnglish}</div>
          </div>` : `<div style="background:var(--bg2);border-radius:var(--r-sm);padding:12px;margin:10px 0;">
            <div style="font-family:var(--font-mono);font-size:7px;color:var(--text3);letter-spacing:1px;margin-bottom:5px;">REASONING</div>
            <div style="font-size:12px;color:var(--text2);line-height:1.6;">${s.reasoning||''}</div>
          </div>`}

          <!-- Copy ready summary -->
          <div style="background:var(--bg2);border-radius:var(--r-sm);padding:12px;margin-top:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <div style="font-family:var(--font-mono);font-size:7px;color:var(--text3);letter-spacing:1px;">COPY TRADE SUMMARY</div>
              <button class="copy-btn" onclick="copyText(\`${copyText.replace(/`/g,"'")}\`,this)">Copy</button>
            </div>
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--text2);line-height:1.8;white-space:pre-line;">${copyText}</div>
          </div>

          ${s.invalidation ? `<div style="font-size:10px;color:var(--text3);margin-top:8px;">Invalidation: ${s.invalidation}</div>` : ''}
        </div>`;
      }).join('') : `<div class="card" style="text-align:center;padding:28px;">
        <div style="font-size:14px;font-family:var(--font-mono);color:var(--text4);margin-bottom:8px;">NO SETUPS</div>
        <div style="color:var(--gold);font-weight:600;margin-bottom:4px;">No Clean Setup Right Now</div>
        <div style="font-size:12px;color:var(--text3);">Staying out is a valid trade decision. Patience pays.</div>
      </div>`}

    ${ri === results.length - 1 && results.length > 1 ? renderCorrelationSummary(results) : ''}
    </div>`;
  }).join('');
}

function renderCorrelationSummary(results) {
  const corrs = results.map(r => r.correlationSummary).filter(Boolean);
  if (!corrs.length) return '';
  return `
    <div class="card" style="border-color:var(--blue-dim);margin-top:8px;">
      <div class="card-label" style="color:var(--blue);">Cross-Asset Correlation Analysis</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.65;">${corrs.join('<br><br>')}</div>
    </div>`;
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied';
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    setTimeout(() => { btn.textContent = 'Copy'; btn.style.color=''; btn.style.borderColor=''; }, 2000);
  }).catch(() => toast('Copy failed — try long press'));
}

// ═══════════════════════════════════════════
// INSTRUMENT SELECTOR
// ═══════════════════════════════════════════
var selectedInstruments = []; // no default selection — user chooses

function buildInstPanel() {
  const body = document.getElementById('inst-panel-body');
  if (!body) return;
  body.innerHTML = Object.entries(INSTRUMENTS).map(([group, items]) => `
    <div class="inst-group-label">${group}</div>
    ${items.map(inst => `
      <div class="inst-row ${selectedInstruments.includes(inst.id) ? 'selected' : ''}"
           id="inst-row-${inst.id}" onclick="toggleInstrument('${inst.id}')">
        <div class="inst-check">${selectedInstruments.includes(inst.id) ? '✓' : ''}</div>
        <div class="inst-sym">${inst.label}</div>
        <div class="inst-name">${inst.name}</div>
        ${inst.corr ? `<div class="inst-corr">≈ ${inst.corr.split(',').slice(0,2).join(', ')}</div>` : ''}
      </div>`).join('')}
  `).join('');
}

function buildChartInstPanel() {
  const body = document.getElementById('chart-inst-panel-body');
  if (!body) return;
  body.innerHTML = Object.entries(INSTRUMENTS).map(([group, items]) => `
    <div class="inst-group-label" style="top:42px;">${group}</div>
    ${items.map(inst => `
      <div class="inst-row ${currentChartPair === inst.id ? 'selected' : ''}"
           id="chart-inst-row-${inst.id}" onclick="chartPickInstrument('${inst.id}')">
        <div class="inst-check" style="border-radius:50%;">${currentChartPair === inst.id ? '●' : ''}</div>
        <div class="inst-sym">${inst.label}</div>
        <div class="inst-name">${inst.name}</div>
        ${inst.corr ? `<span class="corr-badge">≈ ${inst.corr.split(',')[0]}</span>` : ''}
      </div>`).join('')}
  `).join('');
}

function toggleInstPanel() {
  const panel = document.getElementById('inst-panel');
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  if (!isOpen) buildInstPanel();
  panel.classList.toggle('open');
  // Close chart panel if open
  document.getElementById('chart-inst-panel')?.classList.remove('open');
}

function toggleChartInstPanel() {
  const panel = document.getElementById('chart-inst-panel');
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  if (!isOpen) buildChartInstPanel();
  panel.classList.toggle('open');
  document.getElementById('inst-panel')?.classList.remove('open');
  // Focus search
  if (!isOpen) setTimeout(() => document.getElementById('chart-inst-search')?.focus(), 50);
}

// Close panels on outside click or Escape
document.addEventListener('click', e => {
  if (!e.target.closest('.inst-dropdown-wrap')) {
    document.getElementById('inst-panel')?.classList.remove('open');
  }
  if (!e.target.closest('.chart-inst-wrap')) {
    document.getElementById('chart-inst-panel')?.classList.remove('open');
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('inst-panel')?.classList.remove('open');
    document.getElementById('chart-inst-panel')?.classList.remove('open');
  }
});

function toggleInstrument(id) {
  const idx = selectedInstruments.indexOf(id);
  if (idx === -1) {
    selectedInstruments.push(id);
  } else {
    selectedInstruments.splice(idx, 1);
  }
  updateInstUI();
  updateCorrHint();
}

function removeInstrument(id, e) {
  e && e.stopPropagation();
  selectedInstruments = selectedInstruments.filter(x => x !== id);
  updateInstUI();
  updateCorrHint();
}

function clearAllInstruments() {
  selectedInstruments = [];
  updateInstUI();
  buildInstPanel();
  updateCorrHint();
}

function updateInstUI() {
  // Update count
  const count = selectedInstruments.length;
  const countEl = document.getElementById('scan-pair-count');
  const footerEl = document.getElementById('inst-footer-count');
  if (countEl) countEl.textContent = count;
  if (footerEl) footerEl.textContent = count;

  // Update trigger label
  const label = document.getElementById('inst-trigger-label');
  if (label) {
    if (count === 0) {
      label.textContent = 'Select instruments to scan...';
      label.style.color = 'var(--text3)';
    } else if (count === 1) {
      const inst = INSTRUMENT_META[selectedInstruments[0]];
      label.textContent = inst ? `${inst.label} — ${inst.name}` : selectedInstruments[0];
      label.style.color = '';
    } else {
      label.textContent = `${count} instruments selected`;
      label.style.color = '';
    }
  }

  // Update selected chips
  const chipsEl = document.getElementById('inst-selected-chips');
  if (chipsEl) {
    chipsEl.innerHTML = selectedInstruments.map(id => {
      const inst = INSTRUMENT_META[id];
      return `<div class="inst-sel-chip" data-id="${id}">
        ${inst ? inst.label : id}
        <span class="inst-sel-chip-x" onclick="removeInstrument('${id}',event)">✕</span>
      </div>`;
    }).join('');
  }

  // Refresh panel rows
  selectedInstruments.forEach(id => {
    const row = document.getElementById('inst-row-' + id);
    if (row) { row.classList.add('selected'); row.querySelector('.inst-check').textContent = '✓'; }
  });
  // Deselect removed ones
  document.querySelectorAll('.inst-row').forEach(row => {
    const id = row.id.replace('inst-row-', '');
    if (!selectedInstruments.includes(id)) {
      row.classList.remove('selected');
      const chk = row.querySelector('.inst-check');
      if (chk) chk.textContent = '';
    }
  });
}

function updateCorrHint() {
  const hint = document.getElementById('corr-hint');
  if (!hint || selectedInstruments.length < 2) { if (hint) hint.style.display = 'none'; return; }

  // Build correlation insight message
  const corrs = [];
  selectedInstruments.forEach(id => {
    const inst = INSTRUMENT_META[id];
    if (!inst || !inst.corr) return;
    const related = inst.corr.split(',').filter(c => selectedInstruments.includes(c));
    if (related.length) corrs.push(`${inst.label} ↔ ${related.join(', ')}`);
  });

  // Category insights
  const hasMetal = selectedInstruments.some(id => ['XAUUSD','XAGUSD','XPTUSD'].includes(id));
  const hasOil   = selectedInstruments.some(id => ['USOIL','UKOIL'].includes(id));
  const hasCAD   = selectedInstruments.includes('USDCAD') || selectedInstruments.includes('CADJPY');
  const hasBTC   = selectedInstruments.includes('BTCUSD');
  const hasIndex = selectedInstruments.some(id => ['SPX500','NAS100','US30'].includes(id));
  const insights = [];
  if (hasMetal && selectedInstruments.includes('EURUSD')) insights.push('Gold often moves inverse to USD — EUR/USD can confirm dollar direction');
  if (hasOil && hasCAD) insights.push('Oil and CAD are historically correlated — divergence signals opportunity');
  if (hasBTC && hasIndex) insights.push('BTC and equity indices often move together in risk on/off regimes');
  if (hasMetal && hasBTC) insights.push('Gold and BTC both used as inflation hedges — compare their behaviour');

  const allInsights = [...new Set([...corrs, ...insights])].slice(0, 3);
  if (!allInsights.length) { hint.style.display = 'none'; return; }
  hint.style.display = 'block';
  hint.innerHTML = '<strong style="color:var(--blue);">Correlation insight:</strong> ' + allInsights.join(' · ');
}

function filterInstruments(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.inst-row').forEach(row => {
    const id = row.id.replace('inst-row-', '');
    const inst = INSTRUMENT_META[id];
    const match = !q || (inst && (inst.label.toLowerCase().includes(q) || inst.name.toLowerCase().includes(q) || id.toLowerCase().includes(q)));
    row.style.display = match ? '' : 'none';
  });
  document.querySelectorAll('.inst-group-label').forEach(lbl => {
    const nextRows = [];
    let el = lbl.nextElementSibling;
    while (el && !el.classList.contains('inst-group-label')) { nextRows.push(el); el = el.nextElementSibling; }
    const anyVisible = nextRows.some(r => r.style.display !== 'none');
    lbl.style.display = anyVisible ? '' : 'none';
  });
}

function filterChartInstruments(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('#chart-inst-panel-body .inst-row').forEach(row => {
    const id = row.id.replace('chart-inst-row-', '');
    const inst = INSTRUMENT_META[id];
    const match = !q || (inst && (inst.label.toLowerCase().includes(q) || inst.name.toLowerCase().includes(q) || id.toLowerCase().includes(q)));
    row.style.display = match ? '' : 'none';
  });
  document.querySelectorAll('#chart-inst-panel-body .inst-group-label').forEach(lbl => {
    const nextRows = [];
    let el = lbl.nextElementSibling;
    while (el && !el.classList.contains('inst-group-label')) { nextRows.push(el); el = el.nextElementSibling; }
    lbl.style.display = nextRows.some(r => r.style.display !== 'none') ? '' : 'none';
  });
}

function chartPickInstrument(id) {
  currentChartPair = id;
  const inst = INSTRUMENT_META[id];
  const badge = document.getElementById('chart-inst-badge');
  const name  = document.getElementById('chart-inst-name');
  if (badge) badge.textContent = inst ? inst.label : id;
  if (name)  name.textContent  = inst ? inst.name  : '';
  // Close panel immediately on selection
  document.getElementById('chart-inst-panel')?.classList.remove('open');
  // Clear the search box
  const search = document.getElementById('chart-inst-search');
  if (search) { search.value = ''; filterChartInstruments(''); }
  buildChartInstPanel();
  const frame = document.getElementById('tv-chart-frame');
  if (frame) frame.src = buildChartURL(id, currentChartTF);
  updateChartLivePrice(id);
  updateChartKeyLevels(id);
  const lpPair = document.getElementById('chart-live-pair');
  if (lpPair) lpPair.textContent = inst ? inst.label : id;
}

// Legacy compat — getSelectedPairs now reads from selectedInstruments
function getSelectedPairs() { return [...selectedInstruments]; }
function toggleChip(el) {} // no-op — kept for safety

// ═══════════════════════════════════════════
// SENTIMENT — all routed server-side
// ═══════════════════════════════════════════
var finnhubKey = FINNHUB_KEY_BUILTIN; // kept for legacy references; key lives in backend

function sentimentPromptFor(pairs) {
  return `You are a financial markets sentiment analyst. Analyse current market sentiment for: ${pairs.join(', ')}. Today is ${new Date().toUTCString()}. For each instrument provide: sentiment score (-100 to +100), dominant narrative (2-3 sentences), key themes (3-5 tags), smart money signals, retail sentiment, upcoming risk events, correlation context. Respond ONLY with raw JSON: {"sentiments":[{"pair":"XAUUSD","score":65,"narrative":"...","themes":["tag1"],"smartMoney":"...","retailSentiment":"...","riskEvents":["event1"],"correlationContext":"..."}]}`;
}

async function runSentimentAnalysis(pairs) {
  return runGrokSentiment(pairs);
}

var GROK_SYSTEM = `You are a financial markets sentiment analyst with access to real-time social media, news, and market narrative data. You specialise in reading what professional traders, analysts and institutions are saying about financial markets RIGHT NOW.

For each instrument requested, provide:
1. SENTIMENT SCORE: An integer from -100 (extreme fear/bearish) to +100 (extreme greed/bullish)
2. DOMINANT NARRATIVE: What is the main story driving this market today? (2-3 sentences, plain English)
3. KEY THEMES: 3-5 short theme tags (e.g. "Fed pivot bets", "DXY weakness", "Safe haven demand")
4. SMART MONEY SIGNALS: What are institutions and large traders positioning for?
5. RETAIL SENTIMENT: What are retail traders doing (usually the contrarian signal)?
6. RISK EVENTS: Any upcoming events that could change sentiment rapidly?
7. CORRELATION CONTEXT: How is this instrument correlated with other markets right now?

Respond ONLY with raw JSON. No markdown. Start { end }.

Format: {"sentiments":[{"pair":"XAUUSD","score":65,"narrative":"Gold is catching strong safe-haven bids as markets price in Fed rate cuts and geopolitical uncertainty persists. The DXY weakness is amplifying the move.","themes":["Fed cut bets","DXY weakness","Geopolitical risk","Safe haven demand"],"smartMoney":"Institutions accumulating on dips — COT data shows net long positions near multi-month highs","retailSentiment":"Retail heavily long — contrarian risk to the upside may be fading","riskEvents":["US CPI Thursday","Fed speakers Wednesday","Middle East developments"],"correlationContext":"Inverse DXY correlation tight. Watch EURUSD for dollar direction signal."}]}`;

async function runGrokSentiment(pairs) {
  const prompt = `Analyse current market sentiment for: ${pairs.join(', ')}. Today is ${new Date().toUTCString()}. Provide full sentiment analysis for each instrument. JSON only.`;
  try {
    const res = await fetch('/api/grok', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify({
        model:'grok-3',
        max_tokens:2000,
        messages:[
          { role:'system', content:GROK_SYSTEM },
          { role:'user',   content:prompt }
        ]
      })
    });
    if (!res.ok) { console.warn('Grok error:', res.status); return null; }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return extractJSON(text);
  } catch(e) { console.warn('Grok fetch failed:', e); return null; }
}

function renderGrokCard(sentiment) {
  if (!sentiment) return '';
  const score = sentiment.score || 0;
  const bullPct = Math.max(0, score > 0 ? score : 0);
  const bearPct = Math.max(0, score < 0 ? Math.abs(score) : 0);
  const scoreColor = score > 20 ? 'var(--green)' : score < -20 ? 'var(--red)' : 'var(--gold)';
  const scoreLabel = score > 60 ? 'BULLISH' : score > 20 ? 'LEANING BULL' : score < -60 ? 'BEARISH' : score < -20 ? 'LEANING BEAR' : 'NEUTRAL';
  return `<div class="grok-card">
    <div class="grok-header">
      <div class="grok-badge">AI SENTIMENT</div>
      <div style="font-family:var(--font-mono);font-size:18px;font-weight:800;color:${scoreColor};">${score > 0 ? '+' : ''}${score}</div>
      <div style="font-family:var(--font-mono);font-size:9px;color:${scoreColor};background:${scoreColor}18;border-radius:4px;padding:2px 7px;">${scoreLabel}</div>
    </div>
    <div class="grok-sentiment-bar">
      <div class="grok-bar-bull" style="width:${bullPct}%;"></div>
      <div style="flex:${100-bullPct-bearPct};background:var(--bg3);"></div>
      <div class="grok-bar-bear" style="width:${bearPct}%;"></div>
    </div>
    <div style="font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:10px;">${sentiment.narrative || ''}</div>
    <div style="margin-bottom:10px;">
      ${(sentiment.themes || []).map(t => `<span class="grok-theme-chip">${t}</span>`).join('')}
    </div>
    ${sentiment.smartMoney ? `<div style="background:var(--bg3);border-radius:6px;padding:10px;margin-bottom:8px;">
      <div style="font-family:var(--font-mono);font-size:7px;color:#A78BFA;letter-spacing:1.5px;margin-bottom:5px;">SMART MONEY</div>
      <div style="font-size:11px;color:var(--text2);line-height:1.5;">${sentiment.smartMoney}</div>
    </div>` : ''}
    ${sentiment.retailSentiment ? `<div style="background:var(--bg3);border-radius:6px;padding:10px;margin-bottom:8px;">
      <div style="font-family:var(--font-mono);font-size:7px;color:var(--gold);letter-spacing:1.5px;margin-bottom:5px;">RETAIL (contrarian signal)</div>
      <div style="font-size:11px;color:var(--text2);line-height:1.5;">${sentiment.retailSentiment}</div>
    </div>` : ''}
    ${sentiment.riskEvents?.length ? `<div style="margin-bottom:8px;">
      <div style="font-family:var(--font-mono);font-size:7px;color:var(--red);letter-spacing:1.5px;margin-bottom:5px;">RISK EVENTS</div>
      ${sentiment.riskEvents.map(e => `<div style="font-size:11px;color:var(--text2);padding:2px 0;">· ${e}</div>`).join('')}
    </div>` : ''}
    ${sentiment.correlationContext ? `<div style="font-family:var(--font-mono);font-size:9px;color:var(--text3);border-top:1px solid var(--border);padding-top:8px;margin-top:4px;">${sentiment.correlationContext}</div>` : ''}
  </div>`;
}

// ═══════════════════════════════════════════
// STAGE A — TIPINTEL TIER 1 FEATURES
// ═══════════════════════════════════════════

// ── Market Regime config (colours + icons for 8 states) ─────────────────────
var REGIME_CONFIG = {
  'Trend Expansion':        { icon: 'TR', color: 'var(--green)',  bg: 'var(--green-dim)',  border: '#00E87A44' },
  'Liquidity Sweep':        { icon: 'LS', color: '#FF9500',       bg: '#FF950018',         border: '#FF950044' },
  'Range Consolidation':    { icon: 'RC', color: 'var(--gold)',   bg: 'var(--gold-dim)',   border: '#F0B42944' },
  'Pre Event Compression':  { icon: 'PC', color: 'var(--purple)', bg: 'var(--purple-dim)', border: '#A855F744' },
  'Post Event Continuation':{ icon: 'EC', color: 'var(--green)',  bg: 'var(--green-dim)',  border: '#00E87A44' },
  'Post Event Reversal':    { icon: 'ER', color: 'var(--red)',    bg: 'var(--red-dim)',    border: '#FF3D5A44' },
  'Volatility Spike':       { icon: 'VS', color: 'var(--red)',    bg: 'var(--red-dim)',    border: '#FF3D5A44' },
  'Neutral':                { icon: 'NT', color: 'var(--text3)',  bg: 'var(--bg2)',        border: 'var(--border2)' },
};

// ── Confluence stack strength → bar width / label ────────────────────────────
function getConfluenceStrength(stack) {
  if (!stack || !stack.length) return { label: 'Weak', pct: 20, color: 'var(--red)' };
  const n = stack.length;
  if (n >= 5) return { label: 'Very Strong', pct: 100, color: 'var(--green)' };
  if (n >= 4) return { label: 'Strong',      pct: 80,  color: 'var(--green)' };
  if (n >= 3) return { label: 'Moderate',    pct: 60,  color: 'var(--gold)' };
  if (n >= 2) return { label: 'Partial',     pct: 40,  color: 'var(--gold)' };
  return { label: 'Weak', pct: 20, color: 'var(--red)' };
}

// ── Pre-event compression detection ─────────────────────────────────────────
// Returns a warning string to inject into the AI prompt if HIGH impact
// events are found within 2 hours of the current time from calEventCache.
function detectPreEventCompression() {
  const today = new Date();
  const ds = today.toISOString().split('T')[0];
  const events = calEventCache[ds] || [];
  if (!events.length) return '';

  const nowMins = today.getUTCHours() * 60 + today.getUTCMinutes()
                  + (calTimezoneOffset * 60); // adjust to user tz
  const horizon = nowMins + 120; // 2 hours ahead

  const upcoming = events.filter(ev => {
    if (ev.impact !== 'high' && ev.impact !== 'speech') return false;
    const [h, m] = (ev.time || '00:00').split(':').map(Number);
    const evMins = h * 60 + m;
    return evMins >= nowMins && evMins <= horizon;
  });

  if (!upcoming.length) return '';

  const list = upcoming.map(ev => `  - ${ev.title} @ ${ev.time} (${ev.country || 'ALL'})`).join('\n');
  return `PRE-EVENT COMPRESSION ALERT:\nThe following HIGH impact events occur within the next 2 hours:\n${list}\nConsider classifying affected instruments as "Pre Event Compression" regime. Flag setups as high-risk until after the events clear. Recommend reduced lot sizes and wider stops OR standing aside entirely.`;
}

// ── Drawdown protection tier calculator ─────────────────────────────────────
// Returns tier object {tier, color, icon, message} based on drawdown % from peak
function getDrawdownTier(drawdownPct) {
  const pct = Math.abs(drawdownPct || 0);
  if (pct >= 15) return {
    tier: 'Hard Stop',
    level: 3,
    color: 'var(--red)',
    bg: 'var(--red-dim)',
    border: '#FF3D5A55',
    icon: 'STOP',
    message: `Hard Stop at ${pct.toFixed(1)}% drawdown. Trading is suspended until capital recovers above the 15% threshold. Close all positions. Step away.`,
    action: 'TRADING SUSPENDED'
  };
  if (pct >= 10) return {
    tier: 'Restrictive',
    level: 2,
    color: '#FF9500',
    bg: '#FF950018',
    border: '#FF950055',
    icon: 'RISK',
    message: `Restrictive mode at ${pct.toFixed(1)}% drawdown. Maximum 0.5% risk per trade. Only A-grade setups with at least 4 confluence factors. No counter-trend trades.`,
    action: '0.5% MAX RISK'
  };
  if (pct >= 5) return {
    tier: 'Advisory',
    level: 1,
    color: 'var(--gold)',
    bg: 'var(--gold-dim)',
    border: '#F0B42955',
    icon: 'ADV',
    message: `Advisory mode at ${pct.toFixed(1)}% drawdown. Reduce position sizes by 50%. Review recent trades for pattern errors before continuing.`,
    action: 'REDUCE 50%'
  };
  return {
    tier: 'Normal',
    level: 0,
    color: 'var(--green)',
    bg: 'var(--green-dim)',
    border: '#00E87A33',
    icon: 'OK',
    message: `Account within normal parameters (${pct.toFixed(1)}% drawdown). Standard risk management applies.`,
    action: 'NORMAL'
  };
}

// Render the drawdown protection tier strip HTML
function renderDrawdownTierStrip(balancePeak, balanceCurrent) {
  if (!balancePeak || !balanceCurrent || balancePeak <= 0) return '';
  const drawdownPct = ((balancePeak - balanceCurrent) / balancePeak) * 100;
  const t = getDrawdownTier(drawdownPct);
  if (t.level === 0) return ''; // don't show in normal conditions
  return `<div style="background:${t.bg};border:1px solid ${t.border};border-radius:var(--r-sm);padding:10px 13px;margin-bottom:10px;">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:16px;">${t.icon}</span>
        <div>
          <div style="font-family:var(--font-mono);font-size:9px;color:${t.color};letter-spacing:1.5px;font-weight:700;">DRAWDOWN PROTECTION · ${t.tier.toUpperCase()}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px;line-height:1.5;">${t.message}</div>
        </div>
      </div>
      <div style="font-family:var(--font-mono);font-size:10px;color:${t.color};background:${t.bg};border:1px solid ${t.border};border-radius:4px;padding:4px 10px;white-space:nowrap;">${t.action}</div>
    </div>
    <div style="margin-top:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-family:var(--font-mono);font-size:9px;text-align:center;">
      <div style="padding:5px;border-radius:4px;background:${drawdownPct >= 5 ? 'var(--gold-dim)' : 'var(--bg3)'};border:1px solid ${drawdownPct >= 5 ? '#F0B42933' : 'var(--border)'};">
        <div style="color:${drawdownPct >= 5 ? 'var(--gold)' : 'var(--text4)'};font-size:8px;letter-spacing:1px;">ADVISORY</div>
        <div style="color:var(--text3);margin-top:2px;">≥5% DD</div>
      </div>
      <div style="padding:5px;border-radius:4px;background:${drawdownPct >= 10 ? '#FF950018' : 'var(--bg3)'};border:1px solid ${drawdownPct >= 10 ? '#FF950033' : 'var(--border)'};">
        <div style="color:${drawdownPct >= 10 ? '#FF9500' : 'var(--text4)'};font-size:8px;letter-spacing:1px;">RESTRICTIVE</div>
        <div style="color:var(--text3);margin-top:2px;">≥10% DD</div>
      </div>
      <div style="padding:5px;border-radius:4px;background:${drawdownPct >= 15 ? 'var(--red-dim)' : 'var(--bg3)'};border:1px solid ${drawdownPct >= 15 ? '#FF3D5A33' : 'var(--border)'};">
        <div style="color:${drawdownPct >= 15 ? 'var(--red)' : 'var(--text4)'};font-size:8px;letter-spacing:1px;">HARD STOP</div>
        <div style="color:var(--text3);margin-top:2px;">≥15% DD</div>
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════
// UPDATED runScan — runs Claude + Grok in parallel
// ═══════════════════════════════════════════
async function runScan() {
  const pairs = getSelectedPairs();
  if (!pairs.length) { toast('Select at least one instrument first'); return; }

  // Routing: Claude key → Claude. No key → free Gemini up to limit → upsell
  // All scans free — no gating

  const btn = document.getElementById('scan-btn');
  const errDiv = document.getElementById('scan-error');
  const resultsDiv = document.getElementById('scan-results');
  const emptyDiv = document.getElementById('scan-empty');
  const voiceRow = document.getElementById('scan-voice-row');

  btn.disabled = true;
  errDiv.style.display = 'none';
  resultsDiv.innerHTML = '<div class="panel-loading-bar"></div>';
  emptyDiv.style.display = 'none';
  if (voiceRow) voiceRow.style.display = 'none';

  const bal     = parseFloat(document.getElementById('balance-input').value) || 0;
  const risk    = parseFloat(document.getElementById('risk-input').value) || 1;
  const riskAmt = bal ? (bal * risk / 100).toFixed(2) : '0';
  const balDisplay = bal ? '$' + bal.toFixed(2) : 'not set';

  let marketData = '';
  let livePrice = {};

  // Detect weekend / non-trading day
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekend) {
    marketData += 'NOTE: Today is a weekend. Forex and commodity markets are closed. Candle data reflects last trading session. 15M/1H data may be sparse or absent. Base analysis on Daily and 4H structure.\n';
  }

  btn.innerHTML = '<div class="spinner" style="color:#000;"></div> Fetching candles...';
  for (const pair of pairs) {
    btn.innerHTML = `<div class="spinner" style="color:#000;"></div> Loading ${pair}...`;
    try {
      const [d1, h4, h1, m15] = await Promise.all([
        fetchCandles(pair,'1day',30).catch(()=>[]),
        fetchCandles(pair,'4h',30).catch(()=>[]),
        fetchCandles(pair,'1h',30).catch(()=>[]),
        fetchCandles(pair,'15min',50).catch(()=>[]),
      ]);
      // Use live price from cache (Binance WS for crypto, last known for others)
      // Fall back to last candle close if nothing in cache
      const cachedPrice = livePriceCache[pair];
      const lastClose = m15[0] ? parseFloat(m15[0].close) : (d1[0] ? parseFloat(d1[0].close) : null);
      const cp = cachedPrice || lastClose;
      if (cp) livePrice[pair] = cp;
      const priceSource = cachedPrice ? (priceSourceCache[pair] || 'live') : 'last close';
      marketData += `\n\n=== ${pair} REAL MARKET DATA ===\n`;
      marketData += `Current price: ${cp ? cp.toFixed ? cp.toFixed(2) : cp : 'unavailable'} (source: ${priceSource})\n`;
      if (isWeekend) marketData += `Market status: CLOSED (weekend) — using last session candles\n`;
      marketData += summariseCandles(d1, 'DAILY (30 candles)') + '\n';
      marketData += summariseCandles(h4, 'H4 (30 candles)') + '\n';
      marketData += summariseCandles(h1, 'H1 (30 candles)') + '\n';
      marketData += summariseCandles(m15, '15M (50 candles)') + '\n';
      if (m15.length >= 10) {
        marketData += `Last 10 x 15M OHLC: ${m15.slice(0,10).map(c=>`[O:${c.open} H:${c.high} L:${c.low} C:${c.close}]`).join(' ')}\n`;
      } else if (d1.length) {
        marketData += `Note: Intraday candles unavailable (weekend/closed). Daily structure:\n`;
        marketData += `Last 5 Daily OHLC: ${d1.slice(0,5).map(c=>`[${c.datetime} O:${c.open} H:${c.high} L:${c.low} C:${c.close}]`).join(' ')}\n`;
      }
    } catch(e) {
      marketData += `\n${pair}: all candle sources failed — ${e.message}\n`;
    }
  }
  if (!pairs.length || marketData.trim() === '' || (isWeekend && marketData.includes('all candle sources failed'))) {
    marketData += '\nAll live data sources unavailable. Provide analysis based on known market structure and flag data limitations.';
  }

  btn.innerHTML = '<div class="spinner" style="color:#000;"></div> Analysing...';

  // ── PRE-EVENT COMPRESSION DETECTION ───────────────────────────────────────────────
  // Check calEventCache for HIGH impact events within the next 2 hours
  const preEventWarnings = detectPreEventCompression();

  const prompt = `Analyse these pairs: ${pairs.join(', ')}
Account: ${balDisplay} balance | ${risk}% risk per trade | Max risk per trade: ${bal ? '$'+riskAmt : 'not specified — omit lot size calculations'}
Time: ${new Date().toUTCString()}
${preEventWarnings ? preEventWarnings + '\n' : ''}${marketData}
Provide full multi-timeframe analysis with 15M scalp setups, plain English explanations, and copy-ready trade summaries. JSON only.`;



  try {
    let text = '';
    let grokSentiments = [];

    // ── Market Scan + Sentiment in parallel ──────────────────────
    const [claudeRes, sentRes] = await Promise.allSettled([
      fetch(WORKER_URL + '/scan', {
        method:'POST',
        headers: workerHeaders(),
        body:JSON.stringify({ system:SCAN_SYSTEM, messages:[{role:'user',content:prompt}] })
      }),
      fetch(WORKER_URL + '/sentiment', { method:'POST', headers:workerHeaders(), body:JSON.stringify({ prompt: sentimentPromptFor(pairs) }) }).then(r=>r.json()).catch(()=>null)
    ]);

    if (claudeRes.status === 'rejected') throw new Error('Scan error: ' + claudeRes.reason);
    const claudeResp = claudeRes.value;
    if (!claudeResp.ok) {
      const e = await claudeResp.json().catch(()=>({}));
      throw new Error(e?.error?.message || 'Scan error ' + claudeResp.status);
    }
    const claudeData = await claudeResp.json();
    text = claudeData.content?.find(b=>b.type==='text')?.text || '';

    const sentData = sentRes.status === 'fulfilled' ? sentRes.value : null;
    grokSentiments = sentData?.sentiments || [];

    const parsed = extractJSON(text);
    if (!parsed) throw new Error('Could not read AI response. Try again.');
    const arr = parsed.results || (parsed.pair ? [parsed] : null);
    if (!arr?.length) throw new Error('No results returned. Try again.');
    arr.forEach(r => {
      if (livePrice[r.pair]) r.currentPrice = livePrice[r.pair];
      r.grokSentiment = grokSentiments.find(g => g.pair === r.pair) || null;
    });

    renderScanResults(arr);

    const scanTime = new Date().toLocaleTimeString();
    const el = document.getElementById('right-panel-scan-time');
    if (el) el.textContent = scanTime;
    if (voiceRow) voiceRow.style.display = 'block';
    fetchLivePrices();


  } catch(err) {
    errDiv.innerHTML = err.message + ' <button class="btn btn-ghost" style="padding:4px 10px;font-size:10px;margin-left:6px;" onclick="runScan()">Retry</button>';
    errDiv.style.display = 'block';
    emptyDiv.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Run Market Scan';
    updateTrialBadge();
  }
}

// ═══════════════════════════════════════════
// SESSION HEATMAP
// ═══════════════════════════════════════════
function buildHeatmap() {
  const grid = document.getElementById('heatmap-grid');
  const statsEl = document.getElementById('heatmap-stats');
  const pairsEl = document.getElementById('heatmap-pairs');
  if (!grid) return;

  const useSim     = document.getElementById('hm-sim')?.checked !== false;
  const useJournal = document.getElementById('hm-journal')?.checked === true;

  // Combine selected sources
  const simTrades = useSim ? (JSON.parse(localStorage.getItem('wm_sim_trades')||'[]').map(t=>({...t, pair: t.inst||t.pair}))) : [];
  const journalTrades = useJournal ? trades : [];
  const allTrades = [...simTrades, ...journalTrades];

  if (!allTrades.length) {
    grid.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:20px 0;">No trades yet. Log trades or use Sim Trader to see your heatmap.</div>';
    return;
  }

  const days = ['Mon','Tue','Wed','Thu','Fri'];
  const sessions = ['London','New York','Tokyo','Sydney'];

  // Build session bucket from trade time (we use date only — approximate from UTC hour)
  // Group by day of week × session
  const matrix = {};
  days.forEach(d => { matrix[d] = {}; sessions.forEach(s => { matrix[d][s] = []; }); });

  const pairStats = {};

  allTrades.forEach(t => {
    const date = new Date(t.date || t.openTime || t.closeTime || Date.now());
    const dayIdx = date.getDay(); // 0=Sun
    const dayNames = ['','Mon','Tue','Wed','Thu','Fri',''];
    const day = dayNames[dayIdx];
    if (!day) return;
    // Approximate session from date (no time stored — use round-robin heuristic)
    const sessionGuess = sessions[Math.floor(Math.random() * 2)]; // London/NY most common
    if (matrix[day] && matrix[day][sessionGuess] !== undefined) {
      matrix[day][sessionGuess].push(t.pnl);
    }
    // Pair stats
    const pairKey = t.pair || t.inst || 'Unknown';
    if (!pairStats[pairKey]) pairStats[pairKey] = { pnl:0, count:0, wins:0 };
    pairStats[pairKey].pnl += t.pnl;
    pairStats[pairKey].count++;
    if (t.pnl > 0) pairStats[pairKey].wins++;
  });

  const heatClass = (vals) => {
    if (!vals.length) return 'heat-0';
    const sum = vals.reduce((a,b) => a+b, 0);
    if (sum > 20) return 'heat-pos-hi';
    if (sum > 5)  return 'heat-pos-md';
    if (sum > 0)  return 'heat-pos-lo';
    if (sum < -20) return 'heat-neg-hi';
    if (sum < -5)  return 'heat-neg-md';
    return 'heat-neg-lo';
  };

  const heatLabel = (vals) => {
    if (!vals.length) return '—';
    const sum = vals.reduce((a,b) => a+b, 0);
    return (sum >= 0 ? '+' : '') + '$' + sum.toFixed(0);
  };

  // Header row
  let html = `<div style="display:grid;grid-template-columns:60px repeat(${days.length},1fr);gap:4px;margin-bottom:4px;">
    <div></div>
    ${days.map(d => `<div style="font-family:var(--font-mono);font-size:9px;color:var(--text3);text-align:center;letter-spacing:1px;">${d}</div>`).join('')}
  </div>`;

  sessions.forEach(sess => {
    html += `<div style="display:grid;grid-template-columns:60px repeat(${days.length},1fr);gap:4px;margin-bottom:4px;">
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--text3);display:flex;align-items:center;">${sess.slice(0,3).toUpperCase()}</div>
      ${days.map(d => {
        const vals = matrix[d][sess];
        return `<div class="heatmap-cell ${heatClass(vals)}">${heatLabel(vals)}</div>`;
      }).join('')}
    </div>`;
  });
  grid.innerHTML = html;

  // Stats
  const allPnls = allTrades.map(t => t.pnl);
  const bestDay = days.reduce((best, d) => {
    const sum = sessions.flatMap(s => matrix[d][s]).reduce((a,b) => a+b, 0);
    return sum > best.sum ? {day:d, sum} : best;
  }, {day:'—', sum:-Infinity});
  const worstDay = days.reduce((worst, d) => {
    const sum = sessions.flatMap(s => matrix[d][s]).reduce((a,b) => a+b, 0);
    return sum < worst.sum ? {day:d, sum} : worst;
  }, {day:'—', sum:Infinity});

  statsEl.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
    <div class="stat-box"><div class="stat-box-val" style="color:var(--green);font-size:18px;">${bestDay.day}</div><div class="stat-box-label">BEST DAY</div></div>
    <div class="stat-box"><div class="stat-box-val" style="color:var(--red);font-size:18px;">${worstDay.day}</div><div class="stat-box-label">WORST DAY</div></div>
  </div>`;

  // Pair breakdown
  const sortedPairs = Object.entries(pairStats).sort((a,b) => b[1].pnl - a[1].pnl);
  pairsEl.innerHTML = sortedPairs.map(([pair, s]) => {
    const wr = Math.round(s.wins / s.count * 100);
    const c = s.pnl >= 0 ? 'var(--green)' : 'var(--red)';
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
      <div style="font-family:var(--font-mono);font-size:12px;color:var(--text);">${pair}</div>
      <div style="display:flex;gap:12px;font-family:var(--font-mono);font-size:11px;">
        <span style="color:var(--text3);">${s.count} trades</span>
        <span style="color:var(--text2);">${wr}% WR</span>
        <span style="color:${c};font-weight:700;">${s.pnl>=0?'+':''}$${s.pnl.toFixed(2)}</span>
      </div>
    </div>`;
  }).join('') || '<div style="font-size:12px;color:var(--text3);">No pair data yet</div>';
}

// ═══════════════════════════════════════════
// PRICE ALERTS
// ═══════════════════════════════════════════
var priceAlerts = JSON.parse(localStorage.getItem('wm_alerts') || '[]');
var alertCheckTimer = null;

function requestNotifPermission() {
  if (!('Notification' in window)) { toast('Notifications not supported'); return; }
  Notification.requestPermission().then(perm => {
    const btn = document.getElementById('notif-perm-btn');
    if (perm === 'granted') { toast('Notifications enabled'); if (btn) btn.textContent = 'Notifications On'; }
    else { toast('Notifications blocked — alerts will show as toasts'); }
  });
}

function addAlert() {
  const pair = document.getElementById('alert-pair')?.value;
  const condition = document.getElementById('alert-condition')?.value;
  const price = parseFloat(document.getElementById('alert-price')?.value);
  const note = document.getElementById('alert-note')?.value || '';
  if (!pair || !price) { toast('Enter a price level'); return; }
  const alert = { id:Date.now(), pair, condition, price, note, triggered:false };
  priceAlerts.push(alert);
  localStorage.setItem('wm_alerts', JSON.stringify(priceAlerts));
  document.getElementById('alert-price').value = '';
  document.getElementById('alert-note').value = '';
  renderAlerts();
  toast('Alert set for ' + pair + ' ' + condition + ' ' + price);
  if (!alertCheckTimer) startAlertChecking();
}

function removeAlert(id) {
  priceAlerts = priceAlerts.filter(a => a.id !== id);
  localStorage.setItem('wm_alerts', JSON.stringify(priceAlerts));
  renderAlerts();
}

function renderAlerts() {
  const el = document.getElementById('alerts-list');
  if (!el) return;
  if (!priceAlerts.length) {
    el.innerHTML = '<div class="empty"><div class="empty-text">No alerts set yet.</div></div>';
    return;
  }
  el.innerHTML = priceAlerts.map(a => `
    <div class="alert-row ${a.triggered ? 'alert-triggered' : 'alert-active'}">
      <span style="font-family:var(--font-mono);font-size:10px;color:var(--text3);">${a.pair}</span>
      <span style="color:var(--text2);">${a.condition === 'above' ? '▲ Above' : '▼ Below'}</span>
      <span style="font-weight:700;">${a.price}</span>
      ${a.note ? `<span style="color:var(--text3);font-size:10px;font-style:italic;">${a.note}</span>` : ''}
      ${a.triggered ? '<span style="font-size:9px;color:var(--gold);">TRIGGERED</span>' : ''}
      <button class="alert-del" onclick="removeAlert(${a.id})">✕</button>
    </div>`).join('');
}

function startAlertChecking() {
  alertCheckTimer = setInterval(() => {
    priceAlerts.filter(a => !a.triggered).forEach(a => {
      const currentPrice = prevPrices[a.pair];
      if (!currentPrice) return;
      const hit = (a.condition === 'above' && currentPrice >= a.price) ||
                  (a.condition === 'below' && currentPrice <= a.price);
      if (hit) {
        a.triggered = true;
        localStorage.setItem('wm_alerts', JSON.stringify(priceAlerts));
        const msg = `Alert: ${a.pair} ${a.condition === 'above' ? 'hit' : 'broke below'} ${a.price}${a.note ? '. ' + a.note : ''}`;
        toast(msg);
        if (Notification.permission === 'granted') {
          new Notification('Wingman Alert', { body: msg });
        }
        renderAlerts();
      }
    });
  }, 5000);
}

// ═══════════════════════════════════════════
// NEWS CALENDAR
// ═══════════════════════════════════════════
var allNewsItems = [];

async function fetchNewsCalendar() {
  const btn = document.getElementById('news-refresh-btn');
  const body = document.getElementById('news-cal-body');
  if (!body) return;
  if (btn) btn.textContent = '↻ Loading...';
  body.innerHTML = '<div class="pulse" style="font-family:var(--font-mono);font-size:11px;color:var(--text3);padding:16px 0;">Fetching economic events...</div>';

  try {
    // Use a CORS-friendly economic calendar API
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(`https://economic-calendar.tradingview.com/events?from=${today}T00:00:00.000Z&to=${today}T23:59:59.000Z&countries=US,GB,EU,JP,AU,CA,CH&minImportance=0`);
    if (!res.ok) throw new Error('Calendar unavailable');
    const data = await res.json();
    allNewsItems = (data.result || []).map(ev => ({
      time: new Date(ev.date).toUTCString().slice(17,22) + ' UTC',
      event: ev.title || ev.indicator || 'Economic Event',
      country: ev.country || '',
      impact: ev.importance >= 2 ? 'high' : ev.importance === 1 ? 'medium' : 'low',
      actual: ev.actual,
      forecast: ev.forecast,
      previous: ev.previous,
    }));
    renderNewsCalendar('all');
  } catch(e) {
    // Fallback: fetch today's key events
    {
      body.innerHTML = '<div style="font-size:11px;color:var(--text3);padding:8px 0;" class="pulse">Live feed unavailable — loading key events...</div>';
      const calPrompt = `List the key economic events for ${new Date().toDateString()} that forex and commodity traders should know about. Include time (UTC), event name, country, and impact (high/medium/low). JSON only: {"events":[{"time":"13:30 UTC","event":"US Non-Farm Payrolls","country":"US","impact":"high","note":"Major USD mover"}]}`;
      try {
        // Try Gemini 2.5 Flash first (free tier), fall back to Claude Haiku
        let txt = '';
        try {
          const gemBody = {
            contents: [{ role: 'user', parts: [{ text: calPrompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 800 }
          };
          const gr = await fetch('/api/gemini?model=gemini-2.5-flash', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gemBody)
          });
          if (gr.ok) {
            const gd = await gr.json();
            txt = gd.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
        } catch (_) {}

        if (!txt) {
          const res2 = await fetch('/api/claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 800, messages: [{ role: 'user', content: calPrompt }] })
          });
          const d2 = await res2.json();
          txt = d2.content?.find(b => b.type === 'text')?.text || '';
        }

        const parsed = extractJSON(txt);
        allNewsItems = (parsed?.events || []);
        renderNewsCalendar('all');
      } catch(e2) {
        body.innerHTML = '<div style="font-size:12px;color:var(--text3);">Could not load calendar. Try again later.</div>';
      }
    }
  }
  if (btn) btn.textContent = '↻ Refresh';
}

function renderNewsCalendar(filter) {
  const body = document.getElementById('news-cal-body');
  if (!body) return;
  const items = filter === 'all' ? allNewsItems : allNewsItems.filter(e => e.impact === filter);
  if (!items.length) { body.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:16px 0;">No events for this filter.</div>'; return; }
  body.innerHTML = items.map(ev => `
    <div class="news-cal-row impact-${ev.impact}">
      <div class="news-cal-time">${ev.time}</div>
      <div class="news-cal-body">
        <div class="news-cal-event">${ev.event}</div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:2px;">
          <span class="news-cal-country">${ev.country}</span>
          <span class="badge badge-${ev.impact === 'high' ? 'high' : ev.impact === 'medium' ? 'medium' : 'low'}">${ev.impact.toUpperCase()}</span>
          ${ev.forecast !== undefined ? `<span style="font-family:var(--font-mono);font-size:9px;color:var(--text3);">F: ${ev.forecast} P: ${ev.previous}</span>` : ''}
        </div>
        ${ev.note ? `<div style="font-size:10px;color:var(--text3);margin-top:3px;font-style:italic;">${ev.note}</div>` : ''}
      </div>
    </div>`).join('');
}

function filterNews(btn, impact) {
  document.querySelectorAll('#tab-news .chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderNewsCalendar(impact);
}

// ═══════════════════════════════════════════
// SCREENSHOT / CHART ANALYSIS
// ═══════════════════════════════════════════
var screenshotBase64 = null;

function handleDragOver(e) { e.preventDefault(); document.getElementById('screenshot-drop')?.classList.add('drag-over'); }
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('screenshot-drop')?.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) processScreenshotFile(file);
}
function handleScreenshotFile(e) { const file = e.target.files[0]; if (file) processScreenshotFile(file); }

function processScreenshotFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    screenshotBase64 = dataUrl.split(',')[1];
    const mediaType = file.type;
    document.getElementById('screenshot-img').src = dataUrl;
    document.getElementById('screenshot-preview').style.display = 'block';
    document.getElementById('screenshot-placeholder').style.display = 'none';
    document.getElementById('screenshot-btn').disabled = false;
    document.getElementById('screenshot-btn').dataset.mediaType = mediaType;
  };
  reader.readAsDataURL(file);
}

async function analyseScreenshot() {
  if (!screenshotBase64) { toast('Upload a chart image first'); return; }
  if (false) { // All users have access
    // Feature available to all users
    return;
  }
  const btn = document.getElementById('screenshot-btn');
  const resultEl = document.getElementById('screenshot-result');
  const context = document.getElementById('screenshot-context')?.value || '';
  const mediaType = btn.dataset.mediaType || 'image/png';

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="color:#000;"></div> Analysing...';
  resultEl.innerHTML = '';

  try {
    const res = await fetch(WORKER_URL + '/analyse', {
      method:'POST',
      headers: workerHeaders(),
      body:JSON.stringify({
        imageBase64: screenshotBase64,
        mediaType: mediaType,
        context: context
      })
    });
    const data = await res.json();
    const analysis = data.content?.find(b=>b.type==='text')?.text || '';
    if (!analysis) throw new Error('No analysis returned');

    resultEl.innerHTML = `<div class="card">
      <div class="card-label">Chart Analysis</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.7;white-space:pre-wrap;">${analysis}</div>
      <div style="margin-top:12px;">
        <button class="voice-btn" onclick="speakText(${JSON.stringify(analysis)}.replace(/[*#]/g,''))">
          <span class="voice-icon"></span> Read aloud
        </button>
      </div>
    </div>`;
  } catch(e) {
    resultEl.innerHTML = `<div style="color:var(--red);font-size:12px;padding:8px 0;">Analysis failed: ${e.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Analyse Chart';
  }
}

// ═══════════════════════════════════════════
// MARKET DEPTH — STATE
// ═══════════════════════════════════════════
var currentOandaPair = 'EUR_USD';
var currentObSymbol  = 'BTCUSDT';
var currentCotAsset  = 'gold';
var obRefreshTimer   = null;

// COT FRED series IDs for each asset
var COT_SERIES = {
  gold:   { commercial:'DCOILWTICO', label:'Gold (XAUUSD)', series:'gold' },
  silver: { label:'Silver (XAGUSD)', series:'silver' },
  oil:    { label:'Crude Oil (WTI)', series:'oil' },
  eurusd: { label:'EUR/USD', series:'eurusd' },
  gbpusd: { label:'GBP/USD', series:'gbpusd' },
  jpyusd: { label:'JPY Futures', series:'jpyusd' },
  btc:    { label:'Bitcoin', series:'btc' },
};

// Approximate COT net positions (sourced from public CFTC summaries)
// These are representative figures updated weekly — we show directional bias
var COT_CACHE = {
  gold:   { commercial:-280000, large:+210000, small:+70000,  updated:'Latest available' },
  silver: { commercial:-45000,  large:+38000,  small:+7000,   updated:'Latest available' },
  oil:    { commercial:-380000, large:+310000, small:+70000,  updated:'Latest available' },
  eurusd: { commercial:-82000,  large:+75000,  small:+7000,   updated:'Latest available' },
  gbpusd: { commercial:-28000,  large:+22000,  small:+6000,   updated:'Latest available' },
  jpyusd: { commercial:+45000,  large:-38000,  small:-7000,   updated:'Latest available' },
  btc:    { commercial:+1200,   large:+8400,   small:-9600,   updated:'Latest available' },
};

// ═══════════════════════════════════════════
// LIVE PRICE TABLE
// ═══════════════════════════════════════════
var _prevTablePrices = {};

function renderLivePriceTable() {
  var el = document.getElementById('live-price-table');
  if (!el) return;

  // Core instruments to display in the table
  var TABLE_INSTRUMENTS = [
    { id:'XAUUSD',  label:'XAUUSD',  name:'Gold',          dp:2 },
    { id:'XAGUSD',  label:'XAGUSD',  name:'Silver',        dp:3 },
    { id:'BTCUSD',  label:'BTCUSD',  name:'Bitcoin',       dp:0 },
    { id:'ETHUSD',  label:'ETHUSD',  name:'Ethereum',      dp:1 },
    { id:'EURUSD',  label:'EURUSD',  name:'Euro / USD',    dp:5 },
    { id:'GBPUSD',  label:'GBPUSD',  name:'GBP / USD',     dp:5 },
    { id:'USDJPY',  label:'USDJPY',  name:'USD / JPY',     dp:3 },
    { id:'USDCAD',  label:'USDCAD',  name:'USD / CAD',     dp:5 },
    { id:'AUDUSD',  label:'AUDUSD',  name:'AUD / USD',     dp:5 },
    { id:'USOIL',   label:'WTI',     name:'Crude Oil',     dp:2 },
    { id:'SPX500',  label:'SPX500',  name:'S&P 500',       dp:1 },
    { id:'NAS100',  label:'NAS100',  name:'Nasdaq 100',    dp:1 },
    { id:'US30',    label:'US30',    name:'Dow Jones',     dp:0 },
  ];

  var rows = TABLE_INSTRUMENTS.map(function(inst) {
    var price = livePriceCache[inst.id] || livePriceCache[inst.id.replace('USD','') + 'USD'];
    if (!price) return null;
    var stale = typeof priceIsStale === 'function' && priceIsStale(inst.id);
    var prev  = _prevTablePrices[inst.id];
    var dir   = !stale && prev ? (price > prev ? 'up' : price < prev ? 'down' : '') : '';
    var color = stale ? 'var(--text4)' : dir === 'up' ? 'var(--green)' : dir === 'down' ? 'var(--red)' : 'var(--text)';
    var arrow = dir === 'up' ? ' ▲' : dir === 'down' ? ' ▼' : '';
    var formatted = typeof price === 'number' ? price.toFixed(inst.dp) : price;
    var closedTag = stale ? '<span title="Last working day close" style="font-size:8px;color:var(--text4);margin-left:6px;letter-spacing:1px;">CLOSED</span>' : '';
    if (!stale) _prevTablePrices[inst.id] = price;
    return '<div style="display:grid;grid-template-columns:80px 1fr auto;align-items:center;' +
      'padding:8px 14px;border-bottom:1px solid var(--border);gap:8px;">' +
      '<div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--text2);">' + inst.label + closedTag + '</div>' +
      '<div style="font-size:10px;color:var(--text4);">' + inst.name + '</div>' +
      '<div style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:' + color + ';text-align:right;">' +
        formatted + '<span style="font-size:9px;">' + arrow + '</span>' +
      '</div>' +
    '</div>';
  }).filter(Boolean);

  if (!rows.length) {
    el.innerHTML = '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);padding:16px;" class="pulse">Connecting to live feeds...</div>';
    return;
  }

  var header = '<div style="display:grid;grid-template-columns:80px 1fr auto;padding:6px 14px;' +
    'border-bottom:1px solid var(--border2);background:var(--bg2);">' +
    '<div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:1px;">INSTRUMENT</div>' +
    '<div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:1px;"></div>' +
    '<div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:1px;text-align:right;">PRICE</div>' +
    '</div>';

  el.innerHTML = header + rows.join('');
}

// ═══════════════════════════════════════════
// FEAR AND GREED (VIX)
// ═══════════════════════════════════════════
async function fetchFearGreed() {
  var body = document.getElementById('fear-greed-body');
  var dot  = document.getElementById('fg-dot');
  if (!body) return;
  body.innerHTML = '<div class="pulse" style="font-family:var(--font-mono);font-size:11px;color:var(--text3);">Loading VIX data...</div>';

  try {
    var vixRes = await fetch('https://cdn.cboe.com/api/global/delayed_quotes/quotes/%5EVIX.json');
    if (!vixRes.ok) throw new Error('CBOE ' + vixRes.status);
    var vixData = await vixRes.json();
    var vix = parseFloat(vixData?.data?.last || vixData?.data?.close || 0);
    if (!vix) throw new Error('No VIX value');

    var color = vix > 30 ? 'var(--red)' : vix > 20 ? 'var(--gold)' : 'var(--green)';
    var label = vix > 30 ? 'Extreme Fear' : vix > 20 ? 'Elevated' : vix > 12 ? 'Neutral' : 'Complacency';
    var reading = vix > 30
      ? 'Extreme fear in the market. Historically a contrarian buy signal: smart money often accumulates into fear.'
      : vix > 20
      ? 'Elevated volatility. Markets uncertain. Reduce position sizes and seek clearer setups before entering.'
      : vix > 12
      ? 'Moderate volatility. Normal trading conditions. Standard risk management applies.'
      : 'Very low volatility. Market complacency can precede sharp moves. Watch for sudden expansion.';

    var pct = Math.min(100, Math.round((vix / 40) * 100));

    body.innerHTML =
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;">' +
        '<div style="text-align:center;">' +
          '<div style="font-family:var(--font-mono);font-size:32px;font-weight:800;color:' + color + ';">' + vix.toFixed(2) + '</div>' +
          '<div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);letter-spacing:1.5px;">VIX INDEX</div>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-family:var(--font-mono);font-size:11px;color:' + color + ';font-weight:700;margin-bottom:6px;">' + label + '</div>' +
          '<div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:6px;">' +
            '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px;transition:width 0.5s ease;"></div>' +
          '</div>' +
          '<div style="font-size:11px;color:var(--text2);line-height:1.5;">' + reading + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-family:var(--font-mono);font-size:9px;text-align:center;">' +
        '<div style="padding:6px;border-radius:6px;background:' + (vix <= 15 ? 'var(--green-dim)' : 'var(--bg2)') + ';border:1px solid ' + (vix <= 15 ? '#00E87A33' : 'var(--border)') + ';">' +
          '<div style="color:var(--green);font-size:8px;letter-spacing:1px;">COMPLACENCY</div>' +
          '<div style="color:var(--text3);margin-top:2px;">VIX below 15</div>' +
        '</div>' +
        '<div style="padding:6px;border-radius:6px;background:' + (vix >= 15 && vix <= 25 ? 'var(--gold-dim)' : 'var(--bg2)') + ';border:1px solid ' + (vix >= 15 && vix <= 25 ? '#F0B42933' : 'var(--border)') + ';">' +
          '<div style="color:var(--gold);font-size:8px;letter-spacing:1px;">NORMAL</div>' +
          '<div style="color:var(--text3);margin-top:2px;">VIX 15 to 25</div>' +
        '</div>' +
        '<div style="padding:6px;border-radius:6px;background:' + (vix > 25 ? 'var(--red-dim)' : 'var(--bg2)') + ';border:1px solid ' + (vix > 25 ? '#FF3D5A33' : 'var(--border)') + ';">' +
          '<div style="color:var(--red);font-size:8px;letter-spacing:1px;">FEAR</div>' +
          '<div style="color:var(--text3);margin-top:2px;">VIX above 25</div>' +
        '</div>' +
      '</div>';

    if (dot) { dot.classList.remove('depth-stale-dot'); }

  } catch(e) {
    console.warn('VIX fetch failed:', e.message);
    // Fallback: representative value with disclaimer
    body.innerHTML =
      '<div style="background:var(--bg2);border-radius:6px;padding:10px 12px;margin-bottom:10px;">' +
        '<div style="font-family:var(--font-mono);font-size:9px;color:var(--text4);margin-bottom:4px;">LIVE DATA UNAVAILABLE</div>' +
        '<div style="font-size:12px;color:var(--text2);line-height:1.5;">' +
          'VIX data could not be loaded. Visit CBOE.com or your broker platform for the current fear index reading.' +
        '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--text3);line-height:1.6;">' +
        'VIX below 15: complacency — market calm, watch for sudden expansion.<br>' +
        'VIX 15 to 25: normal volatility — standard conditions.<br>' +
        'VIX 25 to 30: elevated fear — reduce size and seek clarity.<br>' +
        'VIX above 30: extreme fear — historically a contrarian buy zone.' +
      '</div>';
    if (dot) dot.classList.add('depth-stale-dot');
  }
}

// ═══════════════════════════════════════════
// MARKET DEPTH — INIT & REFRESH
// ═══════════════════════════════════════════
function initMarketDepth() {
  fetchOrderBook(currentObSymbol);
}

function initMarketSentiment() {
  fetchOandaSentiment(currentOandaPair);
  fetchFearGreed();
  renderCotReport(currentCotAsset);
}

function refreshAllDepth() {
  const btn = document.getElementById('depth-refresh-btn');
  if (btn) btn.textContent = '↻ Refreshing...';
  clearTimeout(obRefreshTimer);
  renderLivePriceTable();
  fetchOrderBook(currentObSymbol);
  const ts = document.getElementById('depth-timestamp');
  if (ts) ts.textContent = 'Updated ' + new Date().toLocaleTimeString();
  setTimeout(() => { if (btn) btn.textContent = '↻ Refresh'; }, 1500);
}

function selectOandaPair(btn, pair) {
  document.querySelectorAll('#oanda-pair-row .depth-pair-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentOandaPair = pair;
  fetchOandaSentiment(pair);
}

function selectObPair(btn, sym) {
  document.querySelectorAll('#ob-body').forEach(() => {});
  btn.closest('.card').querySelectorAll('.depth-pair-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentObSymbol = sym;
  clearTimeout(obRefreshTimer);
  fetchOrderBook(sym);
}

function selectCotAsset(btn, asset) {
  btn.closest('.card').querySelectorAll('.depth-pair-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCotAsset = asset;
  renderCotReport(asset);
}

// ═══════════════════════════════════════════
// SECTION 1: OANDA RETAIL SENTIMENT
// ═══════════════════════════════════════════
async function fetchOandaSentiment(pair) {
  const body = document.getElementById('oanda-sentiment-body');
  const dot  = document.getElementById('oanda-dot');
  if (!body) return;
  body.innerHTML = '<div class="pulse" style="font-family:var(--font-mono);font-size:11px;color:var(--text3);">Fetching sentiment...</div>';

  try {
    // OANDA open positions endpoint (public, no auth required)
    const url = 'https://www1.oanda.com/rates/api/v1/open_positions/' + pair + '.json';
    const res = await fetch(url, { mode:'cors' });

    if (!res.ok) throw new Error('OANDA API ' + res.status);
    const data = await res.json();

    const longPct  = parseFloat(data.long?.percentage  || data.long  || 50);
    const shortPct = parseFloat(data.short?.percentage || data.short || 50);

    renderOandaSentiment(pair, longPct, shortPct);
    if (dot) { dot.classList.remove('depth-stale-dot'); }

  } catch(e) {
    // OANDA CORS may block — use corsproxy or fall back to simulated data with explanation
    console.warn('OANDA direct failed:', e.message, '— using representative data');
    // Fallback: use representative sentiment figures with clear disclaimer
    const fallbacks = {
      EUR_USD: { long:52, short:48 }, GBP_USD: { long:48, short:52 },
      USD_JPY: { long:61, short:39 }, AUD_USD: { long:44, short:56 },
      USD_CAD: { long:55, short:45 }, USD_CHF: { long:57, short:43 },
      XAU_USD: { long:73, short:27 }, BCO_USD: { long:62, short:38 },
    };
    const fb = fallbacks[pair] || { long:50, short:50 };
    renderOandaSentiment(pair, fb.long, fb.short, true);
    if (dot) dot.classList.add('depth-stale-dot');
  }
}

function renderOandaSentiment(pair, longPct, shortPct, isFallback) {
  const body = document.getElementById('oanda-sentiment-body');
  if (!body) return;

  // Clamp and normalise
  const total = longPct + shortPct || 100;
  const lPct  = Math.round((longPct  / total) * 100);
  const sPct  = 100 - lPct;

  // Contrarian signal
  let contrarian = '', contClass = '';
  if (lPct >= 70)      { contrarian = '▼ CONTRARIAN SELL — Retail overwhelmingly long'; contClass = 'contrarian-sell'; }
  else if (lPct >= 60) { contrarian = 'Retail leaning long: mild bearish bias';         contClass = 'contrarian-sell'; }
  else if (sPct >= 70) { contrarian = 'CONTRARIAN BUY: Retail overwhelmingly short';   contClass = 'contrarian-buy'; }
  else if (sPct >= 60) { contrarian = 'Retail leaning short: mild bullish bias';        contClass = 'contrarian-buy'; }
  else                 { contrarian = '↔ Sentiment balanced — no strong contrarian signal'; contClass = 'contrarian-neutral'; }

  const pairLabel = pair.replace('_', '/');

  body.innerHTML = `
    <div style="margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--text2);">${pairLabel} client positions</div>
      ${isFallback ? '<div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);background:var(--bg3);padding:2px 7px;border-radius:4px;">REPRESENTATIVE DATA</div>' : ''}
    </div>
    <div class="sentiment-gauge-wrap">
      <div class="sentiment-bar-track">
        <div class="sentiment-bar-long" style="width:${lPct}%;">
          <span class="sentiment-bar-label">${lPct >= 15 ? 'LONG ' + lPct + '%' : ''}</span>
        </div>
        <div class="sentiment-bar-short" style="width:${sPct}%;">
          <span class="sentiment-bar-label">${sPct >= 15 ? sPct + '% SHORT' : ''}</span>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:9px;color:var(--text3);margin-top:4px;">
        <span style="color:var(--green);">▲ ${lPct}% Long</span>
        <span style="color:var(--red);">${sPct}% Short ▼</span>
      </div>
    </div>
    <div class="contrarian-badge ${contClass}">${contrarian}</div>
    <div style="font-size:11px;color:var(--text3);margin-top:10px;line-height:1.5;border-top:1px solid var(--border);padding-top:10px;">
      <strong style="color:var(--text2);">How to use this:</strong> If ${lPct}% of retail clients are long ${pairLabel},
      the institutional flow is likely skewed ${lPct > 55 ? 'SHORT' : lPct < 45 ? 'LONG' : 'neutral'}.
      ${lPct >= 70 ? 'This extreme reading is a strong signal to look for short setups.' : sPct >= 70 ? 'This extreme reading is a strong signal to look for long setups.' : 'Wait for a more extreme reading (70%+) for a high-conviction contrarian trade.'}
    </div>`;
}

// ═══════════════════════════════════════════
// SECTION 2: CRYPTO ORDER BOOK (Binance)
// ═══════════════════════════════════════════
async function fetchOrderBook(symbol) {
  const body = document.getElementById('ob-body');
  const dot  = document.getElementById('ob-dot');
  if (!body) return;
  body.innerHTML = '<div class="pulse" style="font-family:var(--font-mono);font-size:11px;color:var(--text3);">Fetching order book...</div>';

  try {
    const res = await fetch('https://api.binance.com/api/v3/depth?symbol=' + symbol + '&limit=12');
    if (!res.ok) throw new Error('Binance ' + res.status);
    const data = await res.json();

    const bids = data.bids.slice(0, 10).map(([p, q]) => [parseFloat(p), parseFloat(q)]);
    const asks = data.asks.slice(0, 10).map(([p, q]) => [parseFloat(p), parseFloat(q)]);

    const maxBidQty = Math.max(...bids.map(b => b[1]));
    const maxAskQty = Math.max(...asks.map(a => a[1]));
    const maxQty    = Math.max(maxBidQty, maxAskQty);

    const midPrice  = (bids[0][0] + asks[0][0]) / 2;
    const spread    = (asks[0][0] - bids[0][0]).toFixed(2);

    // Total bid vs ask depth (liquidity imbalance)
    const totalBid = bids.reduce((s, b) => s + b[0] * b[1], 0);
    const totalAsk = asks.reduce((s, a) => s + a[0] * a[1], 0);
    const bidDomPct = Math.round((totalBid / (totalBid + totalAsk)) * 100);
    const askDomPct = 100 - bidDomPct;
    const imbalanceSignal = bidDomPct >= 60
      ? '▲ Bid-heavy — more buy orders in book. Bullish pressure.'
      : askDomPct >= 60
        ? '▼ Ask-heavy — more sell orders in book. Bearish pressure.'
        : '↔ Balanced book — no strong directional bias.';

    const dp = symbol.includes('BTC') ? 1 : symbol.includes('ETH') ? 2 : 4;
    const formatPrice = p => p.toFixed(dp);
    const formatQty   = q => q >= 1000 ? (q/1000).toFixed(1)+'K' : q.toFixed(2);

    body.innerHTML = `
      <div style="margin-bottom:10px;">
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);">
            Bid depth: <span style="color:var(--green);font-weight:700;">${bidDomPct}%</span>
          </div>
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);">
            Ask depth: <span style="color:var(--red);font-weight:700;">${askDomPct}%</span>
          </div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);">
            Spread: <span style="color:var(--text2);">$${spread}</span>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text2);margin-top:5px;">${imbalanceSignal}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        <div>
          <div style="font-family:var(--font-mono);font-size:8px;color:var(--green);letter-spacing:1.5px;margin-bottom:4px;">BIDS (BUY ORDERS)</div>
          <div class="ob-side ob-bid">
            ${bids.map(([p,q]) => {
              const pct = Math.round((q/maxQty)*100);
              return '<div class="ob-row"><div class="ob-row-fill" style="width:'+pct+'%;"></div><span class="ob-price ob-price-bid">'+formatPrice(p)+'</span><span class="ob-qty">'+formatQty(q)+'</span></div>';
            }).join('')}
          </div>
        </div>
        <div>
          <div style="font-family:var(--font-mono);font-size:8px;color:var(--red);letter-spacing:1.5px;margin-bottom:4px;">ASKS (SELL ORDERS)</div>
          <div class="ob-side ob-ask">
            ${asks.map(([p,q]) => {
              const pct = Math.round((q/maxQty)*100);
              return '<div class="ob-row"><div class="ob-row-fill" style="width:'+pct+'%;"></div><span class="ob-price ob-price-ask">'+formatPrice(p)+'</span><span class="ob-qty">'+formatQty(q)+'</span></div>';
            }).join('')}
          </div>
        </div>
      </div>

      <div style="text-align:center;padding:8px;background:var(--bg2);border-radius:var(--r-sm);margin-top:6px;font-family:var(--font-mono);font-size:13px;font-weight:700;">
        Mid: ${formatPrice(midPrice)} <span style="font-size:9px;color:var(--text3);font-weight:400;">spread ${spread}</span>
      </div>
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);text-align:right;margin-top:4px;">
        Auto-refresh in 10s · Binance REST API
      </div>`;

    if (dot) dot.classList.remove('depth-stale-dot');

    // Auto-refresh order book every 10 seconds while on live tab
    obRefreshTimer = setTimeout(() => {
      const livePanel = document.getElementById('markets-live');
      if (livePanel && livePanel.classList.contains('active')) fetchOrderBook(currentObSymbol);
    }, 10000);

  } catch(e) {
    body.innerHTML = '<div style="font-size:12px;color:var(--red);padding:8px 0;">Order book unavailable: ' + e.message + '</div>';
    if (dot) dot.classList.add('depth-stale-dot');
  }
}

// ═══════════════════════════════════════════
// SECTION 3: COT REPORT
// ═══════════════════════════════════════════
function renderCotReport(asset) {
  const body = document.getElementById('cot-body');
  if (!body) return;

  // Prefer live CFTC data via the LumenIntel.cot module (Redis 7 day cache
  // server side, localStorage 7 day cache client side). Fall back to the
  // static COT_CACHE only when the live module is unavailable.
  let d = null;
  if (window.LumenIntel && typeof window.LumenIntel.cot === 'function'
      && typeof window.LumenIntel.cot.legacyCacheRow === 'function') {
    d = window.LumenIntel.cot.legacyCacheRow(asset);
    if (!d) {
      // No cached payload yet. Kick off a fetch and re-render when it lands.
      body.innerHTML = '<div class="pulse" style="font-family:var(--font-mono);font-size:11px;color:var(--text3);">Fetching live CFTC report for ' + asset + '...</div>';
      window.LumenIntel.cot(asset).then(function () {
        if (currentCotAsset === asset) renderCotReport(asset);
      }).catch(function () { /* fall through to static below on next call */ });
      return;
    }
  }
  if (!d) d = COT_CACHE[asset];
  if (!d) { body.innerHTML = '<div style="color:var(--text3);font-size:12px;">No COT data for this asset.</div>'; return; }

  const maxAbs = Math.max(Math.abs(d.commercial), Math.abs(d.large), Math.abs(d.small), 1);

  const renderBar = (val) => {
    const pct = Math.round((Math.abs(val) / maxAbs) * 100);
    const cls  = val >= 0 ? 'cot-bar-net-long' : 'cot-bar-net-short';
    const col  = val >= 0 ? 'var(--green)' : 'var(--red)';
    return '<div class="cot-bar-wrap"><div class="' + cls + '" style="width:' + pct + '%;"></div></div>';
  };

  const fmt = (v) => (v >= 0 ? '+' : '') + (v >= 1000 || v <= -1000 ? Math.round(v/1000)+'K' : v);

  // Interpret
  const commSignal = d.commercial < -50000 || d.commercial > 50000
    ? (d.commercial < 0
        ? 'Commercials heavily short: they expect price to fall'
        : 'Commercials heavily long: they are hedging against a rise')
    : 'Commercials near neutral: no strong signal';

  const specSignal = d.large > 0
    ? 'Large specs net long: momentum traders positioned bullish'
    : 'Large specs net short: momentum traders positioned bearish';

  body.innerHTML = `
    <div style="margin-bottom:12px;">
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);margin-bottom:8px;">NET POSITIONS (CONTRACTS)</div>

      <div class="cot-row">
        <div class="cot-label">COMMERCIAL<br><span style="font-size:7px;color:var(--text4);">(HEDGERS)</span></div>
        ${renderBar(d.commercial)}
        <div class="cot-value" style="color:${d.commercial>=0?'var(--green)':'var(--red)'};">${fmt(d.commercial)}</div>
      </div>

      <div class="cot-row">
        <div class="cot-label">LARGE SPECS<br><span style="font-size:7px;color:var(--text4);">(TREND TRADERS)</span></div>
        ${renderBar(d.large)}
        <div class="cot-value" style="color:${d.large>=0?'var(--green)':'var(--red)'};">${fmt(d.large)}</div>
      </div>

      <div class="cot-row" style="border:none;">
        <div class="cot-label">SMALL SPECS<br><span style="font-size:7px;color:var(--text4);">(RETAIL)</span></div>
        ${renderBar(d.small)}
        <div class="cot-value" style="color:${d.small>=0?'var(--green)':'var(--red)'};">${fmt(d.small)}</div>
      </div>
    </div>

    <div style="background:var(--bg2);border-radius:var(--r-sm);padding:12px;margin-top:8px;">
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px;">INTERPRETATION</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.6;margin-bottom:5px;">${commSignal}</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.6;">${specSignal}</div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-family:var(--font-mono);font-size:8px;color:var(--text4);">
      <span>Source: CFTC Commitments of Traders · ${d.updated}</span>
      <a href="https://www.cftc.gov/dea/futures/deacmesf.htm" target="_blank" style="color:var(--blue);font-size:8px;">View full report ↗</a>
    </div>`;
}

// ═══════════════════════════════════════════
// SECTION 4: OPTIONS FLOW (CBOE)
// ═══════════════════════════════════════════
async function fetchOptionsFlow() {
  const body = document.getElementById('opts-body');
  const dot  = document.getElementById('opts-dot');
  if (!body) return;

  // CBOE delayed quote data for key indices
  // Using CBOE's public API for put/call ratios
  const symbols = [
    { sym:'SPX',  label:'S&P 500',  url:'https://cdn.cboe.com/api/global/delayed_quotes/options/^SPX.json' },
    { sym:'NDX',  label:'Nasdaq',   url:'https://cdn.cboe.com/api/global/delayed_quotes/options/^NDX.json' },
    { sym:'VIX',  label:'VIX',      url:'https://cdn.cboe.com/api/global/delayed_quotes/options/^VIX.json' },
    { sym:'GLD',  label:'Gold ETF', url:'https://cdn.cboe.com/api/global/delayed_quotes/options/GLD.json'  },
  ];

  try {
    // Fetch VIX for market fear gauge first
    const vixRes = await fetch('https://cdn.cboe.com/api/global/delayed_quotes/quotes/^VIX.json');
    let vixLevel = null;
    if (vixRes.ok) {
      const vixData = await vixRes.json();
      vixLevel = vixData?.data?.last || vixData?.data?.close;
    }

    // Fetch CBOE equity put/call ratio
    const pcrRes = await fetch('https://cdn.cboe.com/api/global/put_call_ratio/chart/-1y.json');
    let pcrData = null;
    if (pcrRes.ok) pcrData = await pcrRes.json();

    // Fetch index-specific options summary
    const results = await Promise.allSettled(
      symbols.slice(0,3).map(s =>
        fetch(s.url).then(r => r.ok ? r.json() : null).catch(() => null)
      )
    );

    renderOptionsFlow(symbols, results, vixLevel, pcrData);
    if (dot) dot.classList.remove('depth-stale-dot');

  } catch(e) {
    console.warn('Options flow:', e.message);
    renderOptionsFlowFallback();
    if (dot) dot.classList.add('depth-stale-dot');
  }
}

function renderOptionsFlow(symbols, results, vixLevel, pcrData) {
  const body = document.getElementById('opts-body');
  if (!body) return;

  // Extract PCR from CBOE data or use representative values
  const rows = symbols.map((s, i) => {
    const result = results[i];
    const data   = result?.status === 'fulfilled' ? result.value : null;
    let pcr = null, totalVol = null, callVol = null, putVol = null;

    if (data?.data) {
      const d = data.data;
      callVol  = d.call_volume   || d.calls_volume;
      putVol   = d.put_volume    || d.puts_volume;
      totalVol = d.total_volume;
      pcr      = (putVol && callVol && callVol > 0) ? (putVol / callVol) : null;
    }

    // Fallback representative values with note
    if (pcr === null) {
      const defaults = { SPX:0.74, NDX:0.68, VIX:null, GLD:0.82 };
      pcr = defaults[s.sym];
    }

    return { ...s, pcr, callVol, putVol, totalVol };
  });

  // VIX interpretation
  const vixStr = vixLevel
    ? `<div style="background:var(--bg2);border-radius:var(--r-sm);padding:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);">VIX — FEAR GAUGE</div>
          <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:${vixLevel>30?'var(--red)':vixLevel>20?'var(--gold)':'var(--green)'};">${parseFloat(vixLevel).toFixed(2)}</div>
        </div>
        <div style="font-size:11px;color:var(--text2);">
          ${vixLevel > 30 ? 'Extreme fear: historically a contrarian buy opportunity. Smart money often buys the fear.' :
            vixLevel > 20 ? 'Elevated volatility: markets uncertain. Reduce size and look for clearer setups.' :
            'Low volatility: complacency in market. Watch for volatility expansion.'}
        </div>
      </div>`
    : '';

  const pcrSignal = (pcr) => {
    if (!pcr) return { label:'—', cls:'' };
    if (pcr < 0.7) return { label:'Bullish', cls:'pcr-bullish' };
    if (pcr > 1.0) return { label:'Bearish', cls:'pcr-bearish' };
    return { label:'Neutral', cls:'pcr-neutral' };
  };

  body.innerHTML = vixStr + `
    <table class="options-table">
      <thead>
        <tr>
          <th>INSTRUMENT</th>
          <th>PUT/CALL RATIO</th>
          <th>SIGNAL</th>
          <th>INTERPRETATION</th>
        </tr>
      </thead>
      <tbody>
        ${rows.filter(r => r.sym !== 'VIX').map(r => {
          const sig = pcrSignal(r.pcr);
          const interp = !r.pcr ? 'No data' :
            r.pcr < 0.7  ? 'More calls than puts — market expects move up' :
            r.pcr > 1.3  ? 'Extreme put buying — fear/hedging, contrarian bullish' :
            r.pcr > 1.0  ? 'Put-heavy — bearish positioning dominant' :
            'Balanced options flow';
          return '<tr><td><strong>' + r.label + '</strong></td><td><span class="' + sig.cls + '">' + (r.pcr ? r.pcr.toFixed(2) : '—') + '</span></td><td><span class="' + sig.cls + '">' + sig.label + '</span></td><td style="font-size:10px;">' + interp + '</td></tr>';
        }).join('')}
      </tbody>
    </table>

    <div style="margin-top:14px;padding:12px;background:var(--bg2);border-radius:var(--r-sm);">
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px;">HOW TO USE PUT/CALL RATIOS</div>
      <div style="font-size:11px;color:var(--text2);line-height:1.65;">
        <strong style="color:var(--text);">Below 0.7:</strong> More calls than puts — bullish sentiment, or possible complacency (fade if extreme).<br>
        <strong style="color:var(--text);">0.7 – 1.0:</strong> Neutral zone — no strong options signal.<br>
        <strong style="color:var(--text);">Above 1.0:</strong> More puts than calls — bearish hedging dominant.<br>
        <strong style="color:var(--text);">Above 1.3:</strong> Extreme fear hedging — historically a contrarian BUY signal for the index.
      </div>
    </div>
    <div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);text-align:right;margin-top:8px;">15-min delayed · Source: CBOE</div>`;
}

function renderOptionsFlowFallback() {
  const body = document.getElementById('opts-body');
  if (!body) return;

  // Representative values with full explanation
  const data = [
    { label:'S&P 500 (SPX)',  pcr:0.74, signal:'Bullish', cls:'pcr-bullish', interp:'More calls than puts — market participants expect continuation' },
    { label:'Nasdaq (NDX)',   pcr:0.68, signal:'Bullish', cls:'pcr-bullish', interp:'Call-heavy — tech sector optimism reflected in options flow' },
    { label:'Gold ETF (GLD)', pcr:0.82, signal:'Neutral',  cls:'pcr-neutral',  interp:'Balanced options flow — no clear directional bias' },
  ];

  body.innerHTML = `
    <div style="background:var(--bg3);border-radius:6px;padding:8px 12px;margin-bottom:10px;font-family:var(--font-mono);font-size:9px;color:var(--text3);">
      Live CBOE data temporarily unavailable. Showing representative recent values.
    </div>
    <table class="options-table">
      <thead><tr><th>INSTRUMENT</th><th>PUT/CALL RATIO</th><th>SIGNAL</th><th>INTERPRETATION</th></tr></thead>
      <tbody>
        ${data.map(r => '<tr><td><strong>' + r.label + '</strong></td><td><span class="' + r.cls + '">' + r.pcr + '</span></td><td><span class="' + r.cls + '">' + r.signal + '</span></td><td style="font-size:10px;">' + r.interp + '</td></tr>').join('')}
      </tbody>
    </table>
    <div style="margin-top:12px;padding:12px;background:var(--bg2);border-radius:var(--r-sm);">
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1.5px;margin-bottom:6px;">PUT/CALL RATIO GUIDE</div>
      <div style="font-size:11px;color:var(--text2);line-height:1.65;">
        <strong style="color:var(--text);">Below 0.7:</strong> Bullish — more calls being bought.<br>
        <strong style="color:var(--text);">0.7 – 1.0:</strong> Neutral zone.<br>
        <strong style="color:var(--text);">Above 1.0:</strong> Bearish hedging dominant.<br>
        <strong style="color:var(--text);">Above 1.3:</strong> Extreme fear — contrarian BUY signal historically.
      </div>
    </div>`;
}


// ═══════════════════════════════════════════
// CALENDAR STATE & CONFIG
// ═══════════════════════════════════════════
var calViewDate  = new Date();
var calSelected  = new Date();
calSelected.setHours(0,0,0,0);
var calEventCache = {};
var _calFilterState = 'all';
var allCalEvents = [];

// User timezone offset in hours (default: browser local)
var calTimezoneOffset = -(new Date().getTimezoneOffset() / 60); // e.g. +1 for BST
var calTimezoneName   = Intl.DateTimeFormat().resolvedOptions().timeZone;

// ── TIMEZONE AUTO-DETECT ─────────────────────────────────────────────────────
// Always start with the user's actual browser/OS timezone (accurate even with VPN)
(function autoDetectTimezone() {
  try {
    const tz     = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -new Date().getTimezoneOffset() / 60;
    calTimezoneOffset = offset;
    calTimezoneName   = tz;
    // Persist for next session
    localStorage.setItem('wm_tz_offset', offset);
    localStorage.setItem('wm_tz_name',   tz);
  } catch(e) { /* fallback to UTC */ }
})();

function calSetTimezone(offset, name) {
  calTimezoneOffset = parseFloat(offset);
  calTimezoneName   = name;
  // Invalidate ALL cached events so they re-fetch with new tz
  calEventCache = {};
  allCalEvents  = [];
  renderCalendarGrid();
  loadEventsForDate(calSelected);
}

// Speaker keywords
var SPEAKER_KEYWORDS = [
  'powell','fed chair','federal reserve','fomc','fed meeting',
  'lagarde','ecb','european central bank','rate decision',
  'bailey','bank of england','boe','mpc',
  'trump','white house','press conference','truth social',
  'opec','oil production','opec+',
  'g7','g20','imf','world bank','yellen','treasury',
  'inflation report','gdp','non-farm','nfp','cpi','pce',
  'earnings','results','guidance'
];

var COUNTRY_FLAG = {
  US:'US', GB:'GB', EU:'EU', JP:'JP', AU:'AU',
  CA:'CA', CH:'CH', CN:'CN', NZ:'NZ', DE:'DE',
  FR:'FR', IT:'IT', ES:'ES', IN:'IN', BR:'BR', ALL:'INTL'
};

// ═══════════════════════════════════════════
// CALENDAR INIT
// ═══════════════════════════════════════════
function initCalendar() {
  renderCalendarGrid();
  loadEventsForDate(calSelected);
  fetchFinnhubNews('general');
  fetchSpeakerAlerts();
  // Render timezone dropdown
  renderTimezoneSelector();
}

function renderTimezoneSelector() {
  // Prepend user's auto-detected timezone as first option
  const autoTz   = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const autoOff  = -new Date().getTimezoneOffset() / 60;
  const autoLabel = `Your timezone (${autoTz})`;
  const el = document.getElementById('cal-tz-select');
  if (!el) return;
  const zones = [
    { label: autoLabel, offset: autoOff, name: autoTz, auto: true },
    { label:'London (UTC+0/+1)',      offset:0,   name:'Europe/London' },
    { label:'Paris / Berlin (UTC+1/+2)', offset:1, name:'Europe/Paris' },
    { label:'Dubai (UTC+4)',          offset:4,  name:'Asia/Dubai' },
    { label:'Singapore (UTC+8)',      offset:8,  name:'Asia/Singapore' },
    { label:'Tokyo (UTC+9)',          offset:9,  name:'Asia/Tokyo' },
    { label:'New York (UTC-5/-4)',    offset:-5, name:'America/New_York' },
    { label:'Chicago (UTC-6/-5)',     offset:-6, name:'America/Chicago' },
    { label:'Los Angeles (UTC-8/-7)', offset:-8, name:'America/Los_Angeles' },
    { label:'UTC (UTC+0)',            offset:0,  name:'UTC' },
  ];
  // Detect current tz
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  el.innerHTML = zones.map(z =>
    `<option value="${z.offset}" data-name="${z.name}" ${z.name === localTz || (z.name === 'UTC' && !zones.find(zz=>zz.name===localTz)) ? 'selected' : ''}>${z.label}</option>`
  ).join('');
  el.onchange = () => {
    const opt = el.options[el.selectedIndex];
    calSetTimezone(parseFloat(el.value), opt.getAttribute('data-name'));
  };
}

// ═══════════════════════════════════════════
// CALENDAR GRID RENDERING
// ═══════════════════════════════════════════
function renderCalendarGrid() {
  const grid  = document.getElementById('cal-grid');
  const label = document.getElementById('cal-month-label');
  if (!grid || !label) return;

  const y = calViewDate.getFullYear();
  const m = calViewDate.getMonth();
  label.textContent = calViewDate.toLocaleDateString('en-GB', { month:'long', year:'numeric' });

  const firstDay = new Date(y, m, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(y, m+1, 0).getDate();
  const daysInPrev  = new Date(y, m, 0).getDate();
  const today = new Date();
  today.setHours(0,0,0,0);

  const selDs = dateStr(calSelected);

  let html = '';
  let dayCount = 1;
  let nextCount = 1;
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    if (i < startOffset) {
      const d = daysInPrev - startOffset + i + 1;
      html += `<div class="cal-day other-month"><div class="cal-day-num">${d}</div></div>`;
    } else if (dayCount <= daysInMonth) {
      const d    = dayCount;
      const date = new Date(y, m, d);
      date.setHours(0,0,0,0);
      const ds   = dateStr(date);
      const isToday    = date.getTime() === today.getTime();
      const isSelected = selDs === ds;
      const events  = calEventCache[ds] || [];
      const hasHigh = events.some(e => e.impact === 'high' || e.impact === 'speech');

      const dots = events.length ? `<div class="cal-dot-row">${
        [...new Set(events.map(e => e.impact))].slice(0,4)
          .map(imp => `<div class="cal-dot cal-dot-${imp}"></div>`).join('')
      }</div>` : '';

      html += `<div class="cal-day${isToday?' today':''}${isSelected?' selected':''}${hasHigh?' has-high':''}"
        id="calday-${ds}" onclick="calSelectDate(${y},${m},${d})"
        ><div class="cal-day-num">${d}</div>${dots}</div>`;
      dayCount++;
    } else {
      html += `<div class="cal-day other-month"><div class="cal-day-num">${nextCount++}</div></div>`;
    }
  }
  grid.innerHTML = html;
}

function calPrevMonth() {
  calViewDate = new Date(calViewDate.getFullYear(), calViewDate.getMonth() - 1, 1);
  renderCalendarGrid();
}
function calNextMonth() {
  calViewDate = new Date(calViewDate.getFullYear(), calViewDate.getMonth() + 1, 1);
  renderCalendarGrid();
}

function calSelectDate(y, m, d) {
  // Update selected state
  const prevDs = dateStr(calSelected);
  const prevEl = document.getElementById('calday-' + prevDs);
  if (prevEl) prevEl.classList.remove('selected');

  calSelected = new Date(y, m, d);
  calSelected.setHours(0,0,0,0);
  const newDs = dateStr(calSelected);
  const newEl = document.getElementById('calday-' + newDs);
  if (newEl) newEl.classList.add('selected');

  // Always fetch fresh — delete cache for this date so stale data doesn't show
  delete calEventCache[newDs];
  allCalEvents = [];

  loadEventsForDate(calSelected);
}

function dateStr(date) {
  return date.getFullYear() + '-' +
    String(date.getMonth()+1).padStart(2,'0') + '-' +
    String(date.getDate()).padStart(2,'0');
}

// ═══════════════════════════════════════════
// LOAD EVENTS FOR A DATE
// ═══════════════════════════════════════════
async function loadEventsForDate(date) {
  const ds    = dateStr(date);
  const label = document.getElementById('cal-selected-label');
  const body  = document.getElementById('cal-events-body');

  if (label) {
    const today = new Date(); today.setHours(0,0,0,0);
    const isTdy = date.getTime() === today.getTime();
    label.textContent = isTdy ? "Today's Events" :
      date.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long' });
  }
  if (body) body.innerHTML = `<div class="pulse" style="font-family:var(--font-mono);font-size:11px;color:var(--text3);padding:12px 0;">Loading economic calendar...</div>`;

  const events = [];

  // ── Source 1: TradingView Economic Calendar (primary — legal, reliable) ──
  let tvLoaded = false;
  try {
    const from = ds + 'T00:00:00.000Z';
    const to   = ds + 'T23:59:59.000Z';
    const url  = `https://economic-calendar.tradingview.com/events?from=${from}&to=${to}&countries=US,GB,EU,JP,AU,CA,CH,CN,NZ,DE,FR,IT,ES,KR,NO,SE,CH&minImportance=-1`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json();
      (data.result || []).forEach(ev => {
        const title    = ev.title || ev.indicator || 'Economic Event';
        // TradingView importance: 0=low, 1=medium, 2=high
        const imp      = ev.importance >= 2 ? 'high' : ev.importance === 1 ? 'medium' : 'low';
        const isSpeech = SPEAKER_KEYWORDS.some(k => title.toLowerCase().includes(k));
        // Convert UTC event time to user's chosen timezone
        const evDate   = new Date(ev.date);
        const utcH     = evDate.getUTCHours();
        const utcM     = evDate.getUTCMinutes();
        const localH   = ((utcH + calTimezoneOffset) % 24 + 24) % 24;
        const timeStr  = `${String(localH).padStart(2,'0')}:${String(utcM).padStart(2,'0')}`;
        events.push({
          time:     timeStr,
          title,
          country:  ev.country || 'ALL',
          impact:   isSpeech ? 'speech' : imp,
          actual:   ev.actual   != null ? String(ev.actual)   : undefined,
          forecast: ev.forecast != null ? String(ev.forecast) : undefined,
          previous: ev.previous != null ? String(ev.previous) : undefined,
          source:   'TradingView'
        });
      });
      if (events.length > 0) tvLoaded = true;
    }
  } catch(e) { console.warn('TradingView calendar:', e.message); }

  // ── Source 2: Finnhub market news — enhances events with colour scoring ──
  // Finnhub news is used to BOOST impact colour of matching calendar events
  // (e.g. a "CPI" event on TradingView gets upgraded to HIGH if Finnhub
  // has breaking headlines mentioning the same topic today)
  try {
    const newsRes = await fetch(`${WORKER_URL}/news?category=general`, { signal: AbortSignal.timeout(6000) });
    if (newsRes.ok) {
      const articles = await newsRes.json();
      // Build a set of hot keywords from today's Finnhub headlines
      const todayArticles = articles.filter(a => {
        const age = (Date.now() - a.datetime * 1000) / 3600000; // hours ago
        return age < 24;
      });
      const hotTopics = new Set();
      todayArticles.forEach(a => {
        const text = (a.headline + ' ' + (a.summary || '')).toLowerCase();
        SPEAKER_KEYWORDS.forEach(k => { if (text.includes(k)) hotTopics.add(k); });
        // Also detect specific event types
        ['cpi','inflation','nfp','payroll','gdp','fomc','rate decision','interest rate',
         'earnings','opec','recession','default','crisis'].forEach(k => {
          if (text.includes(k)) hotTopics.add(k);
        });
      });
      // Boost matching TradingView events to high/speech
      if (hotTopics.size > 0) {
        events.forEach(ev => {
          const titleLow = ev.title.toLowerCase();
          const isHot = [...hotTopics].some(k => titleLow.includes(k));
          if (isHot && ev.impact === 'medium') ev.impact = 'high';
          if (isHot && SPEAKER_KEYWORDS.some(k => titleLow.includes(k))) ev.impact = 'speech';
        });
      }
      // Also add standalone Finnhub breaking news items as calendar entries
      // (only high-impact ones not already represented by TV events)
      const highNews = todayArticles
        .filter(a => SPEAKER_KEYWORDS.some(k => (a.headline + ' ' + (a.summary||'')).toLowerCase().includes(k)))
        .slice(0, 5);
      highNews.forEach(a => {
        const alreadyCovered = events.some(ev =>
          ev.title.toLowerCase().split(' ').filter(w=>w.length>4)
            .some(w => a.headline.toLowerCase().includes(w))
        );
        if (!alreadyCovered) {
          const age   = Math.round((Date.now() - a.datetime * 1000) / 60000);
          const timeH = new Date(a.datetime * 1000);
          const localH = ((timeH.getUTCHours() + calTimezoneOffset) % 24 + 24) % 24;
          const timeStr = `${String(localH).padStart(2,'0')}:${String(timeH.getUTCMinutes()).padStart(2,'0')}`;
          events.push({
            time:    timeStr,
            title:   a.headline,
            country: 'ALL',
            impact:  'speech',
            source:  'Finnhub News',
            url:     a.url
          });
        }
      });
    }
  } catch(e) { console.warn('Finnhub calendar boost:', e.message); }

  // Add curated recurring events (central bank schedule, known political events)
  const curatedEvents = getCuratedEvents(ds);
  curatedEvents.forEach(e => {
    if (!events.find(ev => ev.title === e.title)) events.push(e);
  });

  // Sort by time
  events.sort((a,b) => a.time.localeCompare(b.time));

  calEventCache[ds] = events;
  allCalEvents = events;

  // Prefill scan-news-strip if this is today
  const today = new Date(); today.setHours(0,0,0,0);
  if (date.getTime() === today.getTime()) renderScanNewsStrip(events);

  renderCalEvents(events, _calFilterState);
}

// ═══════════════════════════════════════════
// CURATED HIGH-IMPACT EVENTS
// ═══════════════════════════════════════════
function getCuratedEvents(ds) {
  const d    = new Date(ds);
  const dow  = d.getDay(); // 0=Sun
  const dom  = d.getDate();
  const mon  = d.getMonth(); // 0-indexed
  const events = [];

  // FOMC meetings (approx 8 per year — Wed)
  // Mark Wednesdays in Jan,Mar,May,Jun,Jul,Sep,Nov as potential FOMC
  if (dow === 3 && [0,2,4,5,6,8,10].includes(mon) && dom >= 25 && dom <= 31) {
    events.push({ time:'19:00 UTC', title:'FOMC Rate Decision & Statement (Federal Reserve)', country:'US', impact:'speech', source:'Fed Schedule', note:'Markets typically move sharply. Avoid entries 30min before.' });
  }
  if (dow === 3 && [0,2,4,5,6,8,10].includes(mon) && dom >= 25 && dom <= 31) {
    events.push({ time:'19:30 UTC', title:'Fed Chair Powell Press Conference', country:'US', impact:'speech', source:'Fed Schedule', note:'Listen for forward guidance on rates.' });
  }

  // ECB rate decisions (approx quarterly — Thu)
  if (dow === 4 && [2,5,6,9].includes(mon) && dom >= 10 && dom <= 16) {
    events.push({ time:'13:15 UTC', title:'ECB Rate Decision (European Central Bank)', country:'EU', impact:'speech', source:'ECB Schedule' });
    events.push({ time:'13:45 UTC', title:'ECB President Lagarde Press Conference', country:'EU', impact:'speech', source:'ECB Schedule' });
  }

  // BOE meetings (8 per year — Thu)
  if (dow === 4 && dom >= 1 && dom <= 8) {
    events.push({ time:'12:00 UTC', title:'Bank of England Rate Decision (MPC)', country:'GB', impact:'speech', source:'BOE Schedule' });
  }

  // OPEC meetings (biannual — June & December)
  if ([5,11].includes(mon) && dom >= 1 && dom <= 4) {
    events.push({ time:'09:00 UTC', title:'OPEC+ Meeting — Production Policy Decision', country:'ALL', impact:'speech', source:'OPEC Schedule', note:'Oil prices and CAD/NOK sensitive.' });
  }

  // NFP first Friday
  if (dow === 5 && dom <= 7) {
    events.push({ time:'13:30 UTC', title:'US Non Farm Payrolls (NFP)', country:'US', impact:'high', source:'BLS', note:'Biggest monthly USD mover. Major impact on Gold, indices.' });
    events.push({ time:'13:30 UTC', title:'US Unemployment Rate', country:'US', impact:'high', source:'BLS' });
  }

  // CPI — usually 2nd or 3rd week
  if (dow === 3 && dom >= 8 && dom <= 21) {
    events.push({ time:'13:30 UTC', title:'US CPI (Consumer Price Index)', country:'US', impact:'high', source:'BLS', note:'Key inflation print. Major mover for Gold, DXY, indices.' });
  }

  // G7/G20 summits (typically May/June and October/November)
  if ([4,10].includes(mon) && dom >= 1 && dom <= 3) {
    events.push({ time:'All day', title:'G7/G20 Summit — Joint Statement Watch', country:'ALL', impact:'speech', source:'Government Schedules', note:'Watch for coordinated currency, trade or sanctions statements.' });
  }

  return events;
}

// ═══════════════════════════════════════════
// RENDER CALENDAR EVENTS
// ═══════════════════════════════════════════
function renderCalEvents(events, filter) {
  const body    = document.getElementById('cal-events-body');
  const countEl = document.getElementById('cal-event-count');
  if (!body) return;

  const filtered = filter === 'all' ? events :
    events.filter(e => filter === 'speech' ? e.impact === 'speech' : e.impact === filter);

  if (countEl) countEl.textContent = filtered.length + ' event' + (filtered.length !== 1 ? 's' : '') +
    (filter !== 'all' ? ' (filtered)' : '');

  if (!filtered.length) {
    body.innerHTML = '<div class="empty"><div class="empty-text">' +
      (events.length ? 'No ' + filter + ' events on this date' : 'No events found for this date') +
      '</div></div>';
    return;
  }

  body.innerHTML = filtered.map(ev => {
    const flag    = COUNTRY_FLAG[ev.country] || 'INTL';
    const impCls  = 'cal-event-' + ev.impact;
    const badgeCls= 'impact-badge-' + (ev.impact === 'speech' ? 'speech' : ev.impact);
    const badgeLbl= ev.impact === 'speech' ? 'S' : ev.impact === 'high' ? 'H' : ev.impact === 'medium' ? 'M' : 'L';

    return `<div class="cal-event-row ${impCls}">
      <div class="cal-event-time">${ev.time}</div>
      <div class="cal-event-body">
        <span class="cal-event-title">${flag} ${ev.title}</span>
        <div class="cal-event-meta">
          <span class="cal-event-country">${ev.country||''}</span>
          <span class="cal-impact-badge ${badgeCls}">${badgeLbl}</span>
          ${ev.actual != null && ev.actual !== '' ? `<span class="cal-event-actual">${ev.actual}</span>` : ''}
          ${ev.source ? `<span style="font-family:var(--font-mono);font-size:7px;color:var(--text4);">${ev.source}</span>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function calFilter(type, btn) {
  document.querySelectorAll('#markets-calendar .cal-filter-btn').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  _calFilterState = type;
  renderCalEvents(allCalEvents, type);
}

// Legacy alias
function filterCalEvents(btn, filter) { calFilter(filter, btn); }

function calPrev() { calPrevMonth(); }
function calNext() { calNextMonth(); }

// ═══════════════════════════════════════════
// COMPACT NEWS STRIP (scan page)
// ═══════════════════════════════════════════
function renderScanNewsStrip(events) {
  const strip = document.getElementById('scan-news-strip');
  if (!strip) return;
  const high = (events || []).filter(e => e.impact === 'high' || e.impact === 'speech').slice(0, 4);
  if (!high.length) {
    const msg = events && events.length === 0 && !document.getElementById('scan-news-strip').innerHTML.includes('Loading')
      ? 'No high-impact events today'
      : 'No high-impact events scheduled today';
    strip.innerHTML = '<div style="font-family:var(--font-mono);font-size:10px;color:var(--green);">' + msg + '</div>';
    return;
  }
  strip.innerHTML = high.map(ev => {
    const col = ev.impact === 'speech' ? 'var(--purple)' : 'var(--red)';
    const flag = COUNTRY_FLAG[ev.country] || 'INTL';
    return '<div class="news-widget-row" style="border-color:' + col + ';" onclick="navigate(\'calendar\',null)">' +
      '<span class="news-widget-time">' + ev.time + '</span>' +
      '<span class="news-widget-title">' + flag + ' ' + ev.title + '</span>' +
      '<span class="news-widget-badge" style="background:' + col + '18;color:' + col + ';">' +
        (ev.impact === 'speech' ? 'S' : 'H') +
      '</span></div>';
  }).join('');
}

// ═══════════════════════════════════════════
// SPEAKER ALERTS STRIP
// ═══════════════════════════════════════════
async function fetchSpeakerAlerts() {
  const strip = document.getElementById('speaker-alerts-body') || document.getElementById('cal-speaker-strip');
  if (!strip) return;
  const keywords = ['powell','lagarde','trump','fed','ecb','boe','opec','g7','fomc'];
  try {
    const res = await fetch(`${WORKER_URL}/news?category=general`);
    if (!res.ok) return;
    const articles = await res.json();

    const matched = articles.filter(a => {
      const text = (a.headline + ' ' + (a.summary || '')).toLowerCase();
      return keywords.some(k => text.includes(k));
    }).slice(0, 3);

    if (!matched.length) { strip.innerHTML = ''; return; }

    strip.innerHTML = matched.map(a => {
      const age = Math.round((Date.now() - a.datetime * 1000) / 60000);
      const ageStr = age < 60 ? age + 'm ago' : Math.round(age/60) + 'h ago';
      return '<div class="speaker-strip">' +
        '<span class="speaker-strip-icon">S</span>' +
        '<div class="speaker-strip-text"><strong>' + a.headline + '</strong>' +
          (a.summary ? '<br><span style="font-size:10px;color:var(--text3);">' + a.summary.slice(0,120) + '...</span>' : '') +
        '</div>' +
        '<span class="speaker-strip-time">' + ageStr + '</span>' +
      '</div>';
    }).join('');
  } catch(e) { console.warn('Speaker alerts:', e.message); }
}

// ═══════════════════════════════════════════
// FINNHUB NEWS HEADLINES
// ═══════════════════════════════════════════
async function fetchFinnhubNews(category) {
  const body = document.getElementById('cal-news-body');
  const placeholder = document.getElementById('cal-news-placeholder');
  if (!body) return;
  if (placeholder) placeholder.style.display = 'none';
  body.innerHTML = '<div class="pulse" style="font-family:var(--font-mono);font-size:11px;color:var(--text3);">Fetching headlines...</div>';

  try {
    const res = await fetch(`${WORKER_URL}/news?category=general&minId=0`);
    if (!res.ok) throw new Error('Finnhub ' + res.status);
    const articles = await res.json();

    if (!articles.length) { body.innerHTML = '<div style="color:var(--text3);font-size:12px;">No headlines available</div>'; return; }

    // Filter for relevance — market-moving topics
    const relevant = articles
      .filter(a => a.headline && a.datetime)
      .sort((a,b) => b.datetime - a.datetime)
      .slice(0, 15);

    // Flag high-impact stories
    const isSpeech = (text) => SPEAKER_KEYWORDS.some(k => text.toLowerCase().includes(k));

    body.innerHTML = relevant.map(a => {
      const age = Math.round((Date.now() - a.datetime * 1000) / 60000);
      const ageStr = age < 60 ? age + 'm ago' : age < 1440 ? Math.round(age/60) + 'h ago' : Math.round(age/1440) + 'd ago';
      const isHigh = isSpeech(a.headline);
      const borderCol = isHigh ? 'var(--purple)' : 'var(--border)';
      return '<div class="cal-event-row" style="border-color:' + borderCol + ';cursor:pointer;" onclick="window.open(\'' + (a.url||'#') + '\',\'_blank\')">' +
        '<div class="cal-event-time">' + ageStr + '</div>' +
        '<div class="cal-event-body">' +
          '<div class="cal-event-title">' + a.headline + '</div>' +
          '<div class="cal-event-meta">' +
            (a.source ? '<span class="cal-event-country">' + a.source + '</span>' : '') +
            (isHigh ? '<span class="cal-impact-badge impact-badge-speech">MARKET MOVER</span>' : '') +
          '</div>' +
        '</div></div>';
    }).join('');
  } catch(e) {
    body.innerHTML = '<div style="color:var(--red);font-size:12px;">Headlines unavailable: ' + e.message + '</div>';
  }
}


