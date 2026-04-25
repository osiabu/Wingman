// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
var chartInitialised = false;
function navigate(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('tab-'+tab);
  if (panel) panel.classList.add('active');

  document.querySelectorAll('.sidebar .nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));

  if (btn) btn.classList.add('active');
  document.querySelectorAll(`.nav-item[onclick*="navigate('${tab}'"], .mobile-nav-item[onclick*="navigate('${tab}'"]`).forEach(b => b.classList.add('active'));

  const mc  = document.querySelector('.main-content');
  const rp  = document.getElementById('right-panel');
  const app = document.getElementById('app');

  if (tab === 'chart' || tab === 'simtrader' || tab === 'autotrader') {
    if (mc)  { mc.style.padding = '0'; mc.style.overflow = 'hidden'; }
    if (rp)  rp.style.display = 'none';
    if (app) app.classList.add('chart-mode');
  } else {
    if (mc)  { mc.style.padding = ''; mc.style.overflow = ''; }
    if (app) app.classList.remove('chart-mode');
    if (rp && window.innerWidth >= 1200) rp.style.removeProperty('display');
  }

  if (tab === 'calc') {
    setTimeout(() => { autoFillLivePrice(); calcRisk(); }, 100);
  }
  if (tab === 'academy') {
    setTimeout(() => { initAcademy(); updateAcademyProgress(); }, 100);
  }
  if (tab === 'chart' && !chartInitialised) {
    chartInitialised = true;
    setTimeout(initChart, 200);
  }
  if (tab === 'chart') {
    updateChartLivePrice(currentChartPair);
    updateChartKeyLevels(currentChartPair);
  }
  if (tab === 'simtrader') initSimTrader();
  if (tab === 'autotrader') initAutoTrader();
  if (tab === 'markets') {
    // Always init the currently active sub-tab on navigation
    var activePanel = document.querySelector('.markets-subpanel.active');
    var activeId = activePanel ? activePanel.id.replace('markets-', '') : 'live';
    marketSubTab(activeId, null);
  }
  if (tab === 'home') {
    const today = new Date(); today.setHours(0,0,0,0);
    const ds = dateStr(today);
    if (!calEventCache[ds]) loadEventsForDate(today);
    else renderScanNewsStrip(calEventCache[ds]);
  }
}

// ═══════════════════════════════════════════
// LEGAL MODALS
// ═══════════════════════════════════════════
function openLegalModal(type) {
  var modal = document.getElementById('legal-modal');
  var title = document.getElementById('legal-modal-title');
  var privacyContent = document.getElementById('legal-content-privacy');
  var termsContent = document.getElementById('legal-content-terms');
  if (!modal) return;
  privacyContent.style.display = 'none';
  termsContent.style.display = 'none';
  if (type === 'privacy') {
    title.textContent = 'Privacy Policy';
    privacyContent.style.display = 'block';
  } else {
    title.textContent = 'Terms and Conditions';
    termsContent.style.display = 'block';
  }
  modal.style.display = 'block';
  modal.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeLegalModal() {
  var modal = document.getElementById('legal-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════
// CLOCK & SESSION
// ═══════════════════════════════════════════
function startClock() {
  function tick() {
    const now = new Date();
    const utcH = now.getUTCHours();
    const utcM = now.getUTCMinutes();
    const timeStr = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    const localNow = new Date();
    const localStr = localNow.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', timeZoneName:'short'});
    const utcStr = `${String(utcH).padStart(2,'0')}:${String(utcM).padStart(2,'0')} UTC  ·  ${localStr}`;

    let session = 'Market Closed';
    let isOpen = false;
    if (utcH >= 22 || utcH < 8) { session = 'Sydney Open'; isOpen = true; }
    else if (utcH >= 7 && utcH < 16) { session = 'London Open'; isOpen = true; }
    else if (utcH >= 13 && utcH < 22) { session = 'New York Open'; isOpen = true; }
    if (utcH >= 8 && utcH < 10) session = 'London + Tokyo Overlap';
    if (utcH >= 13 && utcH < 17) session = 'London + NY Overlap';

    const dot = document.getElementById('session-dot');
    const label = document.getElementById('session-label');
    const clock = document.getElementById('clock-time');
    const mobileClock = document.getElementById('mobile-clock');

    if (dot) { dot.className = 'session-dot ' + (isOpen ? 'session-open' : 'session-closed'); }
    if (label) label.textContent = session;
    if (clock) clock.textContent = utcStr;
    if (mobileClock) mobileClock.innerHTML = `${utcStr}<br><span style="color:var(--gold);font-size:8px;">${session}</span>`;
    // Sync sidebar session badge class
    const badge = document.getElementById('sidebar-session-badge');
    if (badge) badge.className = 'session-badge' + (isOpen ? '' : ' session-badge-closed');
    // Sync chart page session
    const csl = document.getElementById('chart-session-label');
    const cslm = document.getElementById('chart-session-label-mob');
    const csdot = document.getElementById('chart-session-dot');
    if (csl) { csl.textContent = session; csl.style.color = isOpen ? 'var(--green)' : 'var(--text3)'; }
    if (cslm) { cslm.textContent = session; cslm.style.color = isOpen ? 'var(--green)' : 'var(--text3)'; }
    if (csdot) { csdot.style.background = isOpen ? 'var(--green)' : 'var(--text3)'; csdot.style.boxShadow = isOpen ? '0 0 6px var(--green)' : 'none'; csdot.style.animation = isOpen ? 'pulse 2s infinite' : 'none'; }
  }
  tick();
  setInterval(tick, 10000);
}

// ═══════════════════════════════════════════
// ONBOARDING FLOW
// ═══════════════════════════════════════════
var _obScreen = 1;

function initOnboarding() {
  if (localStorage.getItem('wm_onboarded')) return;
  _obScreen = 1;
  renderObScreen(1);
  var modal = document.getElementById('onboarding-modal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.remove('ob-closing');
  }
}

function obClose() {
  var modal = document.getElementById('onboarding-modal');
  if (!modal) return;
  modal.classList.add('ob-closing');
  setTimeout(function() {
    modal.style.display = 'none';
    modal.classList.remove('ob-closing');
    localStorage.setItem('wm_onboarded', '1');
  }, 280);
}

function obNext() {
  if (_obScreen < 3) {
    if (_obScreen === 2) {
      var nameEl = document.getElementById('ob-name-input');
      if (nameEl && nameEl.value.trim()) {
        localStorage.setItem('wm_trader_name', nameEl.value.trim());
      }
    }
    _obScreen++;
    renderObScreen(_obScreen);
  }
}

function obBack() {
  if (_obScreen > 1) {
    _obScreen--;
    renderObScreen(_obScreen);
  }
}

function obGoSim() {
  obClose();
  setTimeout(function() { navigate('simtrader', null); }, 300);
}

function renderObScreen(n) {
  var body = document.getElementById('ob-body');
  var dots = document.getElementById('ob-dots');
  var actions = document.getElementById('ob-actions');
  if (!body || !dots || !actions) return;

  // Progress dots
  dots.innerHTML = [1,2,3].map(function(i) {
    return '<div class="ob-dot' + (i === n ? ' ob-dot-active' : '') + '"></div>';
  }).join('');

  // Action buttons
  var savedName = localStorage.getItem('wm_trader_name') || '';
  if (n === 1) {
    actions.innerHTML =
      '<button class="ob-btn-primary" onclick="obNext()">Begin</button>';
  } else if (n === 2) {
    actions.innerHTML =
      '<button class="ob-btn-ghost" onclick="obBack()">Back</button>' +
      '<button class="ob-btn-primary" onclick="obNext()">Next</button>';
  } else {
    actions.innerHTML =
      '<button class="ob-btn-ghost" onclick="obBack()">Back</button>' +
      '<div style="display:flex;gap:8px;">' +
        '<button class="ob-btn-ghost" onclick="obClose()">Explore freely</button>' +
        '<button class="ob-btn-primary" onclick="obGoSim()">Open Sim Trader</button>' +
      '</div>';
  }

  // Screen content
  if (n === 1) {
    body.innerHTML =
      '<div class="ob-screen">' +
        '<div class="ob-logo-wrap">' +
          '<img src="img/wingman-mark.svg" alt="Wingman" style="width:56px;height:56px;object-fit:contain;">' +
        '</div>' +
        '<div class="ob-headline">Your Trading Co-Pilot</div>' +
        '<div class="ob-sub">Wingman is a structured training platform that teaches you to trade with discipline, strategy and confidence.</div>' +
        '<div class="ob-feature-grid">' +
          '<div class="ob-feature"><div class="ob-feature-icon" style="background:var(--gold-dim);color:var(--gold);">A</div><div class="ob-feature-label">Academy</div></div>' +
          '<div class="ob-feature"><div class="ob-feature-icon" style="background:var(--green-dim);color:var(--green);">S</div><div class="ob-feature-label">Sim Trader</div></div>' +
          '<div class="ob-feature"><div class="ob-feature-icon" style="background:#00C9B122;color:var(--teal);">L</div><div class="ob-feature-label">Lumen</div></div>' +
          '<div class="ob-feature"><div class="ob-feature-icon" style="background:var(--blue-dim);color:var(--blue);">M</div><div class="ob-feature-label">Markets</div></div>' +
          '<div class="ob-feature"><div class="ob-feature-icon" style="background:var(--purple-dim);color:var(--purple);">B</div><div class="ob-feature-label">Behaviour</div></div>' +
        '</div>' +
        '<div class="ob-disclaimer">Practice only. No real money. No financial advice.</div>' +
      '</div>';
  } else if (n === 2) {
    body.innerHTML =
      '<div class="ob-screen">' +
        '<div class="ob-headline">Start with the Academy</div>' +
        '<div class="ob-sub">Seven structured stages take you from your first trade to advanced setups. Each stage unlocks the next.</div>' +
        '<div class="ob-stages-row">' +
          [1,2,3,4,5,6,7].map(function(s) {
            return '<div class="ob-stage-node' + (s === 1 ? ' ob-stage-active' : '') + '">' +
              '<div class="ob-stage-num">' + s + '</div>' +
            '</div>';
          }).join('<div class="ob-stage-line"></div>') +
        '</div>' +
        '<div style="font-size:11px;color:var(--text3);text-align:center;margin-bottom:18px;">Stage 1 is unlocked and ready for you.</div>' +
        '<div>' +
          '<label class="input-label">WHAT SHOULD WE CALL YOU?</label>' +
          '<input type="text" class="input ob-name-input" id="ob-name-input" placeholder="Enter your name or trading alias" value="' + savedName + '" maxlength="32">' +
        '</div>' +
      '</div>';
  } else {
    body.innerHTML =
      '<div class="ob-screen">' +
        '<div class="ob-headline">Practice before you apply it</div>' +
        '<div class="ob-sub">Sim Trader lets you place practice trades on live prices with virtual money. No risk. Real conditions.</div>' +
        '<div class="ob-score-demo">' +
          '<div class="ob-score-ring">' +
            '<svg width="80" height="80" viewBox="0 0 80 80">' +
              '<circle cx="40" cy="40" r="32" fill="none" stroke="var(--border2)" stroke-width="6"/>' +
              '<circle cx="40" cy="40" r="32" fill="none" stroke="var(--green)" stroke-width="6"' +
                ' stroke-dasharray="' + Math.round(2 * Math.PI * 32 * 0.72) + ' ' + Math.round(2 * Math.PI * 32 * 0.28) + '"' +
                ' stroke-dashoffset="' + Math.round(2 * Math.PI * 32 * 0.25) + '"' +
                ' stroke-linecap="round" style="transition:stroke-dasharray 0.8s ease;"/>' +
              '<text x="40" y="44" text-anchor="middle" fill="var(--green)" font-family="var(--font-mono)" font-size="16" font-weight="700">72</text>' +
            '</svg>' +
          '</div>' +
          '<div>' +
            '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text2);margin-bottom:4px;">Your behaviour score starts at 100.</div>' +
            '<div style="font-size:11px;color:var(--text3);line-height:1.6;">Wingman tracks patterns like revenge trading and FOMO entries. Avoid them to keep your score high.</div>' +
          '</div>' +
        '</div>' +
        '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);text-align:center;margin-top:16px;">You can always return to this overview from the Settings tab.</div>' +
      '</div>';
  }
}

// Run on load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initOnboarding, 600);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var modal = document.getElementById('onboarding-modal');
      if (modal && modal.style.display !== 'none') obClose();
    }
  });
});

