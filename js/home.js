// ═══════════════════════════════════════════════════════════════════
// HOME COMMAND CENTRE — all functions prefixed home_
// ═══════════════════════════════════════════════════════════════════

// ── UTC Clock ────────────────────────────────────────────────────
function home_tickClock() {
  const el = document.getElementById('home-utc-clock');
  if (!el) return;
  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2,'0');
  const mm = String(now.getUTCMinutes()).padStart(2,'0');
  const ss = String(now.getUTCSeconds()).padStart(2,'0');
  el.textContent = `${hh}:${mm}:${ss} UTC`;
}

// ── Ticker snapshot — rebuild strip every 30 s, uninterrupted animation ──
var _homeTickerTimer = null;
function home_startTickerInterval() {
  if (_homeTickerTimer) return; // already running
  rebuildPriceStrip(); // immediate first snapshot
  _homeTickerTimer = setInterval(() => {
    if (document.visibilityState === 'hidden') return;
    if (typeof rebuildPriceStrip === 'function') rebuildPriceStrip();
  }, 30000);
}

// ── Hero Status Bar ──────────────────────────────────────────────
function home_refreshHeroBar() {
  // Session
  const sessionDot   = document.getElementById('home-session-dot');
  const sessionLabel = document.getElementById('home-session-label');
  if (sessionDot && sessionLabel) {
    const now    = new Date();
    const utcH   = now.getUTCHours();
    const utcMin = now.getUTCMinutes();
    const utcT   = utcH * 60 + utcMin;
    // Session windows (UTC minutes)
    const sessions = [
      { name: 'Sydney',          start: 21*60, end: 6*60+0,  wrap: true  },
      { name: 'Tokyo',           start: 0*60,  end: 9*60,    wrap: false },
      { name: 'London',          start: 8*60,  end: 17*60,   wrap: false },
      { name: 'New York',        start: 13*60, end: 22*60,   wrap: false },
      { name: 'London+NY',       start: 13*60, end: 17*60,   wrap: false },
    ];
    const inSession = (s) => s.wrap ? (utcT >= s.start || utcT < s.end) : (utcT >= s.start && utcT < s.end);
    const highLiq = ['London','New York','London+NY'];
    let active = sessions.filter(inSession);
    // Prefer overlap label
    const overlap = active.find(s => s.name === 'London+NY');
    let label = overlap ? 'London+NY Overlap' : (active.length ? active[active.length-1].name : 'Off-Hours');
    const isHigh = overlap || active.some(s => highLiq.includes(s.name));
    sessionLabel.textContent = label;
    if (isHigh) {
      sessionDot.style.background = '#00E87A';
      sessionDot.style.boxShadow  = '0 0 6px #00E87A';
      sessionDot.style.animation  = 'pulse 1.5s infinite';
    } else {
      sessionDot.style.background = 'var(--text4)';
      sessionDot.style.boxShadow  = 'none';
      sessionDot.style.animation  = 'none';
    }
  }

  // Fear & Greed
  const fngEl = document.getElementById('home-fng-display');
  if (fngEl) {
    if (scalpFearGreed && scalpFearGreed.value != null) {
      const v = scalpFearGreed.value;
      const lbl = scalpFearGreed.label || (v < 25 ? 'Extreme Fear' : v < 45 ? 'Fear' : v < 55 ? 'Neutral' : v < 75 ? 'Greed' : 'Extreme Greed');
      const col = v < 30 ? 'var(--red)' : v < 50 ? '#FF9900' : v < 70 ? 'var(--text2)' : 'var(--teal)';
      fngEl.innerHTML = `<span style="color:${col};font-weight:700;">${v}</span> <span style="color:var(--text3);font-size:9px;">${lbl}</span>`;
    } else {
      fngEl.textContent = '— loading…';
      // Attempt fetch if scalpFetchFearGreed exists
      if (typeof scalpFetchFearGreed === 'function' && !scalpFearGreed) {
        scalpFetchFearGreed().then(fg => { scalpFearGreed = fg; home_refreshHeroBar(); }).catch(()=>{});
      }
    }
  }

  // Market Pulse (derived from session score)
  const pulseEl = document.getElementById('home-pulse-label');
  if (pulseEl && typeof atGetSessionScore === 'function') {
    const s = atGetSessionScore();
    const score = s && s.score != null ? s.score : 0;
    let word, col;
    if (score >= 75)      { word = 'ACTIVE';   col = 'var(--teal)'; }
    else if (score >= 45) { word = 'MODERATE'; col = '#FF9900'; }
    else if (score < 20)  { word = 'QUIET';    col = 'var(--text3)'; }
    else                  { word = 'VOLATILE'; col = 'var(--purple)'; }
    pulseEl.textContent = word;
    pulseEl.style.color = col;
  }

  // Scalp positions
  const posEl = document.getElementById('home-scalp-pos');
  if (posEl) {
    const open = (typeof scalpPositions !== 'undefined') ? Object.keys(scalpPositions).length : 0;
    posEl.textContent = `${open} / 5`;
    posEl.style.color = open >= 5 ? 'var(--red)' : open > 0 ? 'var(--teal)' : 'var(--text)';
  }

  const stamp = document.getElementById('home-hero-refresh-stamp');
  if (stamp) {
    const n = new Date();
    stamp.textContent = `Updated ${String(n.getUTCHours()).padStart(2,'0')}:${String(n.getUTCMinutes()).padStart(2,'0')} UTC`;
  }
}

// ── Opportunity Feed ─────────────────────────────────────────────
function home_refreshFeed() {
  const el = document.getElementById('home-opportunity-feed');
  if (!el) return;
  // Pull last 5 from scalpLog
  const log = (typeof scalpLog !== 'undefined') ? scalpLog : [];
  const trades = log.filter(e => e.type === 'open' || e.type === 'skip' || e.type === 'close-win' || e.type === 'close-loss').slice(0, 5);
  if (!trades.length) {
    el.innerHTML = '<div style="background:var(--bg2);border:1px solid var(--border2);border-radius:8px;padding:14px;text-align:center;font-family:var(--font-mono);font-size:11px;color:var(--text3);">Start the Scalp Engine to see live opportunities here.</div>';
    return;
  }
  el.innerHTML = trades.map(entry => {
    const msg = entry.message || '';
    // Determine action
    let action = 'SKIP', cls = 'skip';
    if (entry.type === 'open') {
      action = msg.includes('SHORT') || msg.includes('SELL') ? 'SELL' : 'BUY';
      cls = action === 'BUY' ? 'buy' : 'sell';
    }
    // Extract instrument
    const instMatch = msg.match(/\b(BTCUSD|ETHUSD|XAUUSD|XAGUSD|EURUSD|GBPUSD|SOLUSD|USOIL|UKOIL|[A-Z]{6})\b/);
    const inst = instMatch ? instMatch[1] : '—';
    // Extract confidence
    const confMatch = msg.match(/(\d{1,3})%/);
    const conf = confMatch ? confMatch[1] + '%' : '';
    // First meaningful sentence
    const first = msg.split(/[\n.!]/)[0].trim().slice(0, 90);
    // Timestamp
    const ts = entry.time ? entry.time.slice(0,20) : '';
    return `<div class="home-opp-card ${cls}">
      <div class="home-opp-badge ${cls}">${action}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;flex-wrap:wrap;">
          <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--text);">${inst}</span>
          ${conf ? `<span style="font-family:var(--font-mono);font-size:9px;color:var(--text3);">${conf}</span>` : ''}
          <span style="font-family:var(--font-mono);font-size:8px;color:var(--text4);margin-left:auto;">${ts}</span>
        </div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${first}</div>
      </div>
    </div>`;
  }).join('');
}

// ── Performance Summary ──────────────────────────────────────────
function home_refreshPerf() {
  const hist = (typeof scalpHistory !== 'undefined') ? scalpHistory : [];
  const today = new Date().toDateString();
  const todayTrades = hist.filter(t => t.closeTime && new Date(t.closeTime).toDateString() === today);
  const count = todayTrades.length;
  const wins  = todayTrades.filter(t => (t.pnl || 0) > 0).length;
  const pnl   = todayTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const wr    = count ? Math.round(wins / count * 100) + '%' : '—';
  const el_t  = document.getElementById('home-perf-trades');
  const el_w  = document.getElementById('home-perf-wr');
  const el_p  = document.getElementById('home-perf-pnl');
  if (el_t) el_t.textContent = count;
  if (el_w) { el_w.textContent = wr; el_w.style.color = count ? (wins/count >= 0.5 ? 'var(--teal)' : 'var(--red)') : 'var(--text)'; }
  if (el_p) { el_p.textContent = (pnl >= 0 ? '+' : '') + '$' + pnl.toFixed(0); el_p.style.color = pnl > 0 ? 'var(--teal)' : pnl < 0 ? 'var(--red)' : 'var(--text)'; }
}

// ── Instinct Quote ───────────────────────────────────────────────
function home_refreshInstinct() {
  const el = document.getElementById('home-instinct-text');
  if (!el) return;
  const log = (typeof scalpLog !== 'undefined') ? scalpLog : [];
  let instinct = null;
  for (const entry of log) {
    const msg = entry.message || '';
    // Look for instinct_reading field in the message text
    const m = msg.match(/instinct[_\s]reading["\s:]+([^"\n\|]{10,120})/i);
    if (m) { instinct = m[1].replace(/[",\\]+/g,'').trim(); break; }
    // Also try structured JSON-like
    const m2 = msg.match(/"instinct_reading"\s*:\s*"([^"]{10,120})"/i);
    if (m2) { instinct = m2[1].trim(); break; }
  }
  el.textContent = instinct
    ? instinct
    : 'Wingman is watching the markets. Start the Scalp Engine to activate live intelligence.';
}

// ── Master init & intervals ──────────────────────────────────────
var _homeHeroTimer  = null;
var _homeFeedTimer  = null;
var _homeClockTimer = null;

function home_init() {
  home_tickClock();
  home_startTickerInterval();
  home_refreshHeroBar();
  home_refreshFeed();
  home_refreshPerf();
  home_refreshInstinct();

  if (!_homeClockTimer) _homeClockTimer = setInterval(() => {
    if (document.visibilityState !== 'hidden') home_tickClock();
  }, 1000);
  if (!_homeHeroTimer)  _homeHeroTimer  = setInterval(() => {
    if (document.visibilityState !== 'hidden') { home_refreshHeroBar(); home_refreshPerf(); home_refreshInstinct(); }
  }, 60000);
  if (!_homeFeedTimer)  _homeFeedTimer  = setInterval(() => {
    if (document.visibilityState !== 'hidden') { home_refreshFeed(); home_refreshInstinct(); }
  }, 10000);
}

// Boot when DOM ready — slight delay so globals like scalpLog are populated
setTimeout(home_init, 1800);
