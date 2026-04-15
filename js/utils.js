'use strict';
// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
var trades = JSON.parse(localStorage.getItem('wm_trades') || '[]');

// ── API CONFIG ───────────────────────────────────────────────────────────────
var WORKER_URL = '/api';
function workerHeaders() {
  return { 'Content-Type': 'application/json' };
}
// ─────────────────────────────────────────────────────────────────────────────
function updateTrialBadge() {
  const badge = document.getElementById('trial-badge');
  if (badge) badge.style.display = 'none';
}

// Gemini scan — routed through /api/gemini (server-side key)
async function callGeminiForScan(systemPrompt, userPrompt) {
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 3000, responseMimeType: 'application/json' }
  };
  const res = await fetch('/api/gemini?model=gemini-2.5-flash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gemini API error ' + res.status);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function showUpgradeModal() {}
function openSettingsFromModal() {
  document.getElementById('upgrade-modal').style.display = 'none';
  navigate('settings', null);
}
// ──────────────────────────────────────────────────────────────────────────

var CHECKLIST_ITEMS = [
  'Is this trade WITH the Daily trend?',
  'Do I have a clear entry, stop loss and take profit?',
  'Is my lot size within my risk % (max 0.01 at current balance)?',
  'No major high-impact news in the next 30 minutes?',
  'Am I trading from analysis, not emotion or revenge?',
  'Is my daily loss limit still intact?'
];

var CORE_RULES = [
  ['·','No martingale. Never increase lot size after a loss. Fixed size only.'],
  ['·','Trade with the Daily trend. Avoid counter trend entries unless exceptional.'],
  ['·','Maximum 2 open trades at once. One trade only until consistently profitable.'],
  ['·','Daily loss limit: 5% of balance. Hit it and close the platform. No exceptions.'],
  ['·','Avoid major news. No entries 30 minutes before or after HIGH impact events.'],
  ['·','Minimum 1:2 risk/reward. If TP is less than 2x SL distance, skip the trade.'],
  ['·','At sub-$300 balance: 0.01 lots only. No exceptions. Protect the account.'],
];

// ═══════════════════════════════════════════
// INSTRUMENT LIBRARY
// ═══════════════════════════════════════════
var INSTRUMENTS = {
  'Metals': [
    { id:'XAUUSD',  label:'XAU/USD',  name:'Gold',          td:'XAU/USD',      tv:'OANDA:XAUUSD',      corr:'DXY,XAGUSD' },
    { id:'XAGUSD',  label:'XAG/USD',  name:'Silver',        td:'XAG/USD',      tv:'OANDA:XAGUSD',      corr:'XAUUSD' },
    { id:'XPTUSD',  label:'XPT/USD',  name:'Platinum',      td:'XPT/USD',      tv:'OANDA:XPTUSD',      corr:'XAUUSD' },
    { id:'XCUUSD',  label:'XCU/USD',  name:'Copper',        td:'XCU/USD',      tv:'OANDA:XCUUSD',      corr:'US30,AUDUSD' },
  ],
  'Forex — Majors': [
    { id:'EURUSD',  label:'EUR/USD',  name:'Euro',          td:'EUR/USD',      tv:'OANDA:EURUSD',      corr:'DXY' },
    { id:'GBPUSD',  label:'GBP/USD',  name:'Sterling',      td:'GBP/USD',      tv:'OANDA:GBPUSD',      corr:'EURUSD' },
    { id:'USDJPY',  label:'USD/JPY',  name:'Yen',           td:'USD/JPY',      tv:'OANDA:USDJPY',      corr:'DXY' },
    { id:'USDCHF',  label:'USD/CHF',  name:'Swissy',        td:'USD/CHF',      tv:'OANDA:USDCHF',      corr:'DXY,XAUUSD' },
    { id:'AUDUSD',  label:'AUD/USD',  name:'Aussie',        td:'AUD/USD',      tv:'OANDA:AUDUSD',      corr:'XCUUSD,XAUUSD' },
    { id:'USDCAD',  label:'USD/CAD',  name:'Loonie',        td:'USD/CAD',      tv:'OANDA:USDCAD',      corr:'USOIL' },
    { id:'NZDUSD',  label:'NZD/USD',  name:'Kiwi',          td:'NZD/USD',      tv:'OANDA:NZDUSD',      corr:'AUDUSD' },
  ],
  'Forex — Minors': [
    { id:'EURGBP',  label:'EUR/GBP',  name:'Cable Cross',   td:'EUR/GBP',      tv:'OANDA:EURGBP',      corr:'EURUSD,GBPUSD' },
    { id:'EURJPY',  label:'EUR/JPY',  name:'Euro-Yen',      td:'EUR/JPY',      tv:'OANDA:EURJPY',      corr:'USDJPY' },
    { id:'GBPJPY',  label:'GBP/JPY',  name:'Guppy',         td:'GBP/JPY',      tv:'OANDA:GBPJPY',      corr:'USDJPY,GBPUSD' },
    { id:'AUDJPY',  label:'AUD/JPY',  name:'Aussie-Yen',    td:'AUD/JPY',      tv:'OANDA:AUDJPY',      corr:'USDJPY' },
    { id:'CADJPY',  label:'CAD/JPY',  name:'Loonie-Yen',    td:'CAD/JPY',      tv:'OANDA:CADJPY',      corr:'USOIL,USDJPY' },
    { id:'EURCHF',  label:'EUR/CHF',  name:'Euro-Swissy',   td:'EUR/CHF',      tv:'OANDA:EURCHF',      corr:'EURUSD' },
    { id:'GBPCHF',  label:'GBP/CHF',  name:'Sterling-Swiss',td:'GBP/CHF',      tv:'OANDA:GBPCHF',      corr:'GBPUSD' },
    { id:'EURCAD',  label:'EUR/CAD',  name:'Euro-Loonie',   td:'EUR/CAD',      tv:'OANDA:EURCAD',      corr:'USOIL' },
    { id:'AUDCAD',  label:'AUD/CAD',  name:'Aussie-Loonie', td:'AUD/CAD',      tv:'OANDA:AUDCAD',      corr:'USOIL,XCUUSD' },
    { id:'AUDNZD',  label:'AUD/NZD',  name:'Antipodeans',   td:'AUD/NZD',      tv:'OANDA:AUDNZD',      corr:'AUDUSD' },
    { id:'CHFJPY',  label:'CHF/JPY',  name:'Swissy-Yen',    td:'CHF/JPY',      tv:'OANDA:CHFJPY',      corr:'USDJPY' },
  ],
  'Crypto': [
    { id:'BTCUSD',  label:'BTC/USD',  name:'Bitcoin',       td:'BTC/USD',      tv:'BITSTAMP:BTCUSD',   corr:'ETHUSD,SPX500' },
    { id:'ETHUSD',  label:'ETH/USD',  name:'Ethereum',      td:'ETH/USD',      tv:'BITSTAMP:ETHUSD',   corr:'BTCUSD' },
    { id:'SOLUSD',  label:'SOL/USD',  name:'Solana',        td:'SOL/USD',      tv:'COINBASE:SOLUSD',   corr:'BTCUSD,ETHUSD' },
    { id:'XRPUSD',  label:'XRP/USD',  name:'Ripple',        td:'XRP/USD',      tv:'BITSTAMP:XRPUSD',   corr:'BTCUSD' },
    { id:'BNBUSD',  label:'BNB/USD',  name:'Binance Coin',  td:'BNB/USD',      tv:'BINANCE:BNBUSDT',   corr:'BTCUSD' },
    { id:'ADAUSD',  label:'ADA/USD',  name:'Cardano',       td:'ADA/USD',      tv:'COINBASE:ADAUSD',   corr:'BTCUSD' },
    { id:'DOTUSD',  label:'DOT/USD',  name:'Polkadot',      td:'DOT/USD',      tv:'COINBASE:DOTUSD',   corr:'BTCUSD' },
    { id:'LINKUSD', label:'LINK/USD', name:'Chainlink',     td:'LINK/USD',     tv:'COINBASE:LINKUSD',  corr:'BTCUSD' },
  ],
  'Indices': [
    { id:'US30',    label:'US30',     name:'Dow Jones',     td:'DIA',          tv:'FOREXCOM:DJI',      corr:'SPX500,NAS100' },
    { id:'SPX500',  label:'SPX500',   name:'S&P 500',       td:'SPY',          tv:'FOREXCOM:SPX500',   corr:'US30,NAS100,BTCUSD' },
    { id:'NAS100',  label:'NAS100',   name:'Nasdaq 100',    td:'QQQ',          tv:'FOREXCOM:NAS100',   corr:'SPX500,BTCUSD' },
    { id:'UK100',   label:'UK100',    name:'FTSE 100',      td:'ISF',          tv:'FOREXCOM:UK100',    corr:'GBPUSD' },
    { id:'GER40',   label:'GER40',    name:'DAX 40',        td:'EWG',          tv:'FOREXCOM:GER40',    corr:'EURUSD' },
    { id:'JPN225',  label:'JPN225',   name:'Nikkei 225',    td:'EWJ',          tv:'FOREXCOM:JPN225',   corr:'USDJPY' },
    { id:'AUS200',  label:'AUS200',   name:'ASX 200',       td:'EWA',          tv:'FOREXCOM:AUS200',   corr:'AUDUSD,XCUUSD' },
    { id:'HK50',    label:'HK50',     name:'Hang Seng',     td:'EWH',          tv:'FOREXCOM:HK50',     corr:'AUDUSD' },
  ],
  'Energy': [
    { id:'USOIL',   label:'WTI',      name:'Crude Oil WTI', td:'WTI/USD',      tv:'NYMEX:CL1!',        corr:'USDCAD,CADJPY' },
    { id:'UKOIL',   label:'BRENT',    name:'Brent Crude',   td:'BRENT/USD',    tv:'NYMEX:BB1!',        corr:'USOIL,GBPUSD' },
    { id:'NATGAS',  label:'NATGAS',   name:'Natural Gas',   td:'NATURAL_GAS/USD', tv:'NYMEX:NG1!',     corr:'USOIL' },
    { id:'GASUSD',  label:'GASOLINE', name:'Gasoline',      td:'GASOLINE/USD', tv:'NYMEX:RB1!',        corr:'USOIL' },
  ],
  'Softs & Ags': [
    { id:'COFFEE',  label:'COFFEE',   name:'Coffee',        td:'COFFEE',       tv:'ICEUS:KC1!',        corr:'' },
    { id:'COCOA',   label:'COCOA',    name:'Cocoa',         td:'COCOA',        tv:'ICEUS:CC1!',        corr:'' },
    { id:'SUGAR',   label:'SUGAR',    name:'Sugar #11',     td:'SUGAR',        tv:'ICEUS:SB1!',        corr:'' },
    { id:'WHEAT',   label:'WHEAT',    name:'Wheat',         td:'WHEAT',        tv:'CBOT:ZW1!',         corr:'CORN' },
    { id:'CORN',    label:'CORN',     name:'Corn',          td:'CORN',         tv:'CBOT:ZC1!',         corr:'WHEAT' },
    { id:'SOYBEAN', label:'SOYBEAN',  name:'Soybean',       td:'SOYBEAN',      tv:'CBOT:ZS1!',         corr:'CORN,AUDUSD' },
    { id:'COTTON',  label:'COTTON',   name:'Cotton',        td:'COTTON',       tv:'ICEUS:CT1!',        corr:'' },
    { id:'LUMBER',  label:'LUMBER',   name:'Lumber',        td:'LUMBER',       tv:'CME:LBR1!',         corr:'' },
  ],
  'Derived & Spreads': [
    { id:'XAUEUR',  label:'XAU/EUR',  name:'Gold in Euros', td:'XAU/EUR',      tv:'OANDA:XAUEUR',      corr:'XAUUSD,EURUSD' },
    { id:'XAUGBP',  label:'XAU/GBP',  name:'Gold in GBP',   td:'XAU/GBP',      tv:'OANDA:XAUGBP',      corr:'XAUUSD,GBPUSD' },
    { id:'BTCETH',  label:'BTC/ETH',  name:'BTC vs ETH',    td:'BTC/ETH',      tv:'BITSTAMP:BTCETH',   corr:'BTCUSD,ETHUSD' },
    { id:'XAUBTC',  label:'XAU/BTC',  name:'Gold vs BTC',   td:'XAU/BTC',      tv:'BITFINEX:XAUBTC',   corr:'XAUUSD,BTCUSD' },
  ],
};

// Flat lookups built from INSTRUMENTS
var TD_SYMBOLS = {};
var TV_SYMBOLS = {};
var INSTRUMENT_META = {}; // id -> full instrument object
Object.values(INSTRUMENTS).forEach(group => {
  group.forEach(inst => {
    TD_SYMBOLS[inst.id] = inst.td;
    TV_SYMBOLS[inst.id]  = inst.tv;
    INSTRUMENT_META[inst.id] = inst;
  });
});

// ═══════════════════════════════════════════
// RISK DISPLAY
// ═══════════════════════════════════════════
function updateRisk() {
  const balRaw = document.getElementById('balance-input')?.value;
  const bal    = parseFloat(balRaw) || 0;
  const risk   = parseFloat(document.getElementById('risk-input')?.value) || 1;
  const riskAmt = bal * risk / 100;
  const rd = document.getElementById('risk-display');
  const sb = document.getElementById('sidebar-balance');
  if (rd) rd.textContent = bal ? '$' + riskAmt.toFixed(2) : '—';
  // sidebar-balance is now driven by updateSidebarStats (sim account) — skip if sim has data
  const _simAcc = JSON.parse(localStorage.getItem('wm_sim_account') || 'null');
  if (sb && !_simAcc) sb.textContent = bal ? '$' + bal.toFixed(2) : '—';
  // Sync right panel — show dashes when no balance entered
  const rpBal   = document.getElementById('rp-balance');
  const rpRisk  = document.getElementById('rp-risk-amt');
  const rpLimit = document.getElementById('rp-daily-limit');
  const rpLot   = document.getElementById('rp-lot-size');
  if (rpBal)   rpBal.textContent   = bal ? '$' + bal.toFixed(2)            : '—';
  if (rpRisk)  rpRisk.textContent  = bal ? '$' + riskAmt.toFixed(2)        : '—';
  if (rpLimit) rpLimit.textContent = bal ? '$' + (bal * 0.05).toFixed(2)   : '—';
  if (rpLot)   rpLot.textContent   = bal ? Math.max(0.01, Math.floor((riskAmt/20)*100)/100).toFixed(2) : '—';
  // Also sync calc tab balance
  const cb = document.getElementById('calc-balance');
  if (cb && balRaw && !cb.value) cb.value = balRaw;
}

// ═══════════════════════════════════════════
// CHECKLIST & RULES
// ═══════════════════════════════════════════
function buildChecklist() {
  document.getElementById('checklist').innerHTML = CHECKLIST_ITEMS.map((item,i)=>`
    <div class="check-item" onclick="toggleCheck(${i})">
      <div class="check-circle" id="chk-${i}"></div>
      <div style="font-size:13px;color:var(--text2);line-height:1.4;">${item}</div>
    </div>`).join('');
  // Build compact right-panel version
  const mini = document.getElementById('rp-checklist-mini');
  if (mini) {
    mini.innerHTML = CHECKLIST_ITEMS.map((item,i)=>`
      <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);cursor:pointer;" onclick="toggleRpCheck(${i})">
        <div id="rp-chk-${i}" style="width:16px;height:16px;border-radius:50%;border:1.5px solid var(--border2);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#000;transition:all 0.2s;"></div>
        <div style="font-size:11px;color:var(--text2);line-height:1.35;">${item}</div>
      </div>`).join('');
  }
}

function toggleRpCheck(i) {
  const el = document.getElementById('rp-chk-'+i);
  const main = document.getElementById('chk-'+i);
  if (!el) return;
  const checked = el.style.background === 'var(--green)' || el.getAttribute('data-checked') === '1';
  if (checked) {
    el.style.background = ''; el.style.borderColor = 'var(--border2)'; el.textContent = ''; el.setAttribute('data-checked','0');
    if (main) { main.classList.remove('checked'); main.textContent = ''; }
  } else {
    el.style.background = 'var(--green)'; el.style.borderColor = 'var(--green)'; el.textContent = '✓'; el.setAttribute('data-checked','1');
    if (main) { main.classList.add('checked'); main.textContent = '✓'; }
  }
}

function toggleCheck(i) {
  const el = document.getElementById('chk-'+i);
  el.classList.toggle('checked');
  el.textContent = el.classList.contains('checked') ? '✓' : '';
}

function resetChecklist() {
  CHECKLIST_ITEMS.forEach((_,i)=>{ const el=document.getElementById('chk-'+i); el.classList.remove('checked'); el.textContent=''; });
  toast('Checklist reset');
}

function checkAll() {
  const allClear = CHECKLIST_ITEMS.every((_,i)=>document.getElementById('chk-'+i).classList.contains('checked'));
  if (allClear) toast('All clear. You may enter the trade.');
  else toast('Complete all checklist items first.');
}

function buildRules() {
  document.getElementById('rules-list').innerHTML = CORE_RULES.map(([icon,text])=>`
    <div style="display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:16px;flex-shrink:0;">${icon}</span>
      <div style="font-size:13px;color:var(--text2);line-height:1.5;">${text}</div>
    </div>`).join('').replace(/<div style="[^"]*border-bottom[^"]*">(?!.*border-bottom)/,'<div>');
}

// ═══════════════════════════════════════════
// DAILY LIMIT
// ═══════════════════════════════════════════
function updateDailyLimit() {
  const pnl = parseFloat(document.getElementById('daily-pnl').value)||0;
  const bal = parseFloat(document.getElementById('daily-balance').value)||0;
  if (!bal) return;
  const limit = bal*0.05;
  const used  = Math.abs(Math.min(0,pnl));
  const rem   = limit-used;
  const pct   = Math.min(100,(used/limit)*100);
  const color = pnl<-limit?'var(--red)':pnl<-limit*0.5?'var(--gold)':'var(--green)';
  document.getElementById('daily-limit-display').innerHTML = `
    <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:${color};">${pnl<-limit?'STOP TRADING NOW':'$'+rem.toFixed(2)+' remaining'}</div>
    <div style="font-family:var(--font-mono);font-size:9px;color:var(--text3);letter-spacing:2px;margin:4px 0 10px;">DAILY LIMIT: $${limit.toFixed(2)} (5%)</div>
    <div class="limit-bar-wrap"><div class="limit-bar-fill" style="width:${pct}%;background:${color};"></div></div>`;
}

// ═══════════════════════════════════════════
// MISC
// ═══════════════════════════════════════════
function clearAll() {
  if (confirm('Delete all trades and reset everything?')) {
    localStorage.clear();
    location.reload();
  }
}

var _tt;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(_tt); _tt = setTimeout(()=>el.classList.remove('show'),2500);
}

// Handle resize — show/hide right panel
window.addEventListener('resize', () => {
  const rp = document.getElementById('right-panel');
  if (rp) rp.style.display = window.innerWidth>=1200 ? 'block' : 'none';
});


// ═══════════════════════════════════════════
// VOICE BRIEFING
// ═══════════════════════════════════════════
var speechSynth = window.speechSynthesis;
var speaking = false;

function speakText(text) {
  if (!speechSynth) { toast('Voice not supported in this browser'); return; }
  if (speaking) { speechSynth.cancel(); speaking = false; return; }
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.95; utt.pitch = 1.0; utt.volume = 1.0;
  // Prefer a natural English voice
  const voices = speechSynth.getVoices();
  const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Neural')) ||
                    voices.find(v => v.lang.startsWith('en') && !v.name.includes('Google')) ||
                    voices.find(v => v.lang.startsWith('en'));
  if (preferred) utt.voice = preferred;
  utt.onstart = () => { speaking = true; };
  utt.onend = utt.onerror = () => {
    speaking = false;
    document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('speaking'));
  };
  speechSynth.speak(utt);
}

function speakScanResult() {
  const btn = document.getElementById('voice-scan-btn');
  if (speaking) { speechSynth.cancel(); speaking = false; if (btn) btn.classList.remove('speaking'); return; }
  const results = document.getElementById('scan-results');
  if (!results || !results.textContent.trim()) { toast('Run a scan first'); return; }
  if (btn) btn.classList.add('speaking');
  // Build a clean spoken summary from lastScanResults
  const lines = [];
  lastScanResults.forEach(r => {
    lines.push(`${r.pair} analysis. Overall verdict: ${r.overallVerdict}.`);
    if (r.verdictNote) lines.push(r.verdictNote);
    if (r.trendBias?.summary) lines.push(r.trendBias.summary);
    r.setups?.slice(0,1).forEach(s => {
      lines.push(`Setup: ${s.direction} from ${s.entryZone}. Stop loss at ${s.stopLoss}. Take profit at ${s.takeProfit1}. Risk reward ${s.riskReward}.`);
      if (s.plainEnglish) lines.push(s.plainEnglish);
    });
  });
  speakText(lines.join(' '));
}

function speakHeatmap() {
  if (!trades.length) { toast('No trades to summarise'); return; }
  const pnl = trades.reduce((s,t) => s+t.pnl, 0);
  const wins = trades.filter(t => t.pnl > 0).length;
  const wr = Math.round(wins/trades.length*100);
  speakText(`Your trading summary. ${trades.length} total trades. Win rate ${wr} percent. Total P and L ${pnl >= 0 ? 'positive' : 'negative'} ${Math.abs(pnl).toFixed(2)} dollars. Your best pair by P and L is ${Object.entries(trades.reduce((acc,t) => { acc[t.pair]=(acc[t.pair]||0)+t.pnl; return acc; },{})).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'unknown'}.`);
}

