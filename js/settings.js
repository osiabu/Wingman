// ═════════════════════════════════════════════
// SETTINGS TAB — PROFILE
// ═════════════════════════════════════════════

function saveProfileSettings() {
  const traderName = document.getElementById('s-trader-name').value;
  const session = document.getElementById('s-session').value;
  const instrument = document.getElementById('s-default-instrument').value;

  localStorage.setItem('wm_trader_name', traderName);
  localStorage.setItem('wm_preferred_session', session);
  localStorage.setItem('wm_default_instrument', instrument);

  toast('Profile settings saved');
}

// ═════════════════════════════════════════════
// SETTINGS TAB — NOTIFICATIONS
// ═════════════════════════════════════════════

function saveNotificationSettings() {
  const behaviourNudge = document.getElementById('s-behaviour-nudge').checked;
  const weeklyReport = document.getElementById('s-weekly-report').checked;
  const academyBanner = document.getElementById('s-academy-banner').checked;

  localStorage.setItem('wm_notify_behaviour', behaviourNudge);
  localStorage.setItem('wm_notify_weekly', weeklyReport);
  localStorage.setItem('wm_notify_academy', academyBanner);

  toast('Notification settings saved');
}

// ═════════════════════════════════════════════
// SETTINGS TAB — DATA AND PRIVACY
// ═════════════════════════════════════════════

function clearSimTrades() {
  if (confirm('Clear all sim trade history? This cannot be undone.')) {
    localStorage.removeItem('trades');
    toast('Sim trade history cleared');
  }
}

function clearBehaviourLog() {
  if (confirm('Clear all behaviour log entries? This cannot be undone.')) {
    localStorage.removeItem('wm_behaviour_log');
    toast('Behaviour log cleared');
  }
}

function exportTradeJournal() {
  const journalStr = localStorage.getItem('wm_trade_journal');
  if (!journalStr) {
    toast('No trades to export');
    return;
  }

  try {
    const trades = JSON.parse(journalStr);
    const csv = 'Date,Instrument,Direction,Entry,Exit,Profit Loss,Notes\n' +
      trades.map(t => `${t.date},${t.pair},${t.direction},${t.entry},${t.exit},${t.result},${t.notes || ''}`).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wingman_journal.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast('Trade journal exported');
  } catch (e) {
    toast('Export failed');
  }
}

function resetAcademyProgress() {
  const input = document.getElementById('s-reset-confirm').value;
  if (input === 'RESET') {
    if (confirm('Reset all Academy progress? This cannot be undone.')) {
      localStorage.removeItem('wm_academy_stage');
      for (let i = 1; i <= 7; i++) {
        localStorage.removeItem(`wm_stage_${i}_status`);
        localStorage.removeItem(`wm_stage_${i}_cooldown`);
        localStorage.removeItem(`wm_stage_${i}_attempts`);
        localStorage.removeItem(`wm_stage_${i}_passed_at`);
      }
      localStorage.removeItem('wm_grade_history');
      document.getElementById('s-reset-confirm').value = '';
      document.getElementById('s-reset-academy-btn').disabled = true;
      document.getElementById('s-reset-academy-btn').style.opacity = '0.5';
      toast('Academy progress reset');
    }
  }
}

// ═════════════════════════════════════════════
// SETTINGS TAB — LUMEN ENGINE
// ═════════════════════════════════════════════

function saveLumenSettings() {
  const mode = document.getElementById('s-lumen-mode').value;
  const maxPos = document.getElementById('s-max-positions').value;
  const instruments = Array.from(document.querySelectorAll('.s-instrument-check:checked')).map(c => c.value);

  localStorage.setItem('wm_lumen_mode', mode);
  localStorage.setItem('wm_lumen_max_positions', maxPos);
  localStorage.setItem('wm_lumen_instruments', JSON.stringify(instruments));

  toast('Lumen settings saved');
}

// ═════════════════════════════════════════════
// SETTINGS TAB — INITIALIZATION
// ═════════════════════════════════════════════

function initSettingsTab() {
  // Load saved settings
  const traderName = localStorage.getItem('wm_trader_name') || '';
  const session = localStorage.getItem('wm_preferred_session') || 'london';
  const instrument = localStorage.getItem('wm_default_instrument') || 'BTCUSD';
  const behaviourNudge = localStorage.getItem('wm_notify_behaviour') !== 'false';
  const weeklyReport = localStorage.getItem('wm_notify_weekly') !== 'false';
  const academyBanner = localStorage.getItem('wm_notify_academy') !== 'false';
  const lumenMode = localStorage.getItem('wm_lumen_mode') || 'both';
  const maxPos = localStorage.getItem('wm_lumen_max_positions') || '5';
  const instrumentsJson = localStorage.getItem('wm_lumen_instruments');
  const instruments = instrumentsJson ? JSON.parse(instrumentsJson) : ['BTCUSD', 'EURUSD', 'XAUUSD', 'GBPUSD', 'BNBUSD', 'ETHUSD'];

  if (traderName && document.getElementById('s-trader-name')) document.getElementById('s-trader-name').value = traderName;
  if (document.getElementById('s-session')) document.getElementById('s-session').value = session;
  if (document.getElementById('s-default-instrument')) document.getElementById('s-default-instrument').value = instrument;
  if (document.getElementById('s-behaviour-nudge')) document.getElementById('s-behaviour-nudge').checked = behaviourNudge;
  if (document.getElementById('s-weekly-report')) document.getElementById('s-weekly-report').checked = weeklyReport;
  if (document.getElementById('s-academy-banner')) document.getElementById('s-academy-banner').checked = academyBanner;
  if (document.getElementById('s-lumen-mode')) document.getElementById('s-lumen-mode').value = lumenMode;
  if (document.getElementById('s-max-positions')) document.getElementById('s-max-positions').value = maxPos;

  // Set instrument checkboxes
  document.querySelectorAll('.s-instrument-check').forEach(cb => {
    cb.checked = instruments.includes(cb.value);
  });

  // Reset confirmation input listener
  const resetInput = document.getElementById('s-reset-confirm');
  const resetBtn = document.getElementById('s-reset-academy-btn');
  if (resetInput && resetBtn) {
    resetInput.addEventListener('input', function() {
      if (this.value === 'RESET') {
        resetBtn.disabled = false;
        resetBtn.style.opacity = '1';
        resetBtn.style.cursor = 'pointer';
      } else {
        resetBtn.disabled = true;
        resetBtn.style.opacity = '0.5';
        resetBtn.style.cursor = 'not-allowed';
      }
    });
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSettingsTab);
} else {
  initSettingsTab();
}

// ═════════════════════════════════════════════
// LEGACY FUNCTIONS (deprecated)
// ═════════════════════════════════════════════

function saveSettings() {
  clearTimeout(priceRefreshTimer);
  fetchLivePrices();
  toast('Settings saved');
}

function saveAccountSettings() {
  const bal = document.getElementById('s-balance').value;
  const risk = document.getElementById('s-risk').value;
  if (bal) { document.getElementById('balance-input').value = bal; document.getElementById('calc-balance').value = bal; }
  if (risk) { document.getElementById('risk-input').value = risk; document.getElementById('calc-risk').value = risk; }
  updateRisk(); calcRisk();
  toast('Defaults saved');
}
