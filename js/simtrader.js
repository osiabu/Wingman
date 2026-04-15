// ═══════════════════════════════════════════
// TRADE JOURNAL
// ═══════════════════════════════════════════
function toggleAddTrade() {
  const f = document.getElementById('add-trade-form');
  f.style.display = f.style.display==='none' ? 'block' : 'none';
}

function saveTrade() {
  const t = {
    id:Date.now(), date:new Date().toLocaleDateString(),
    pair:document.getElementById('j-pair').value,
    dir:document.getElementById('j-dir').value,
    lot:parseFloat(document.getElementById('j-lot').value)||0,
    pnl:parseFloat(document.getElementById('j-pnl-input').value)||0,
    tf:document.getElementById('j-tf').value,
    entry:parseFloat(document.getElementById('j-entry').value)||0,
    exit:parseFloat(document.getElementById('j-exit').value)||0,
    notes:document.getElementById('j-notes').value
  };
  trades.unshift(t);
  localStorage.setItem('wm_trades',JSON.stringify(trades));
  toggleAddTrade();
  ['j-lot','j-pnl-input','j-entry','j-exit','j-notes'].forEach(id=>document.getElementById(id).value='');
  renderTrades();
  updateSidebarStats();
  toast('Trade logged.');
}

function deleteTrade(id) {
  trades = trades.filter(t=>t.id!==id);
  localStorage.setItem('wm_trades',JSON.stringify(trades));
  renderTrades();
  updateSidebarStats();
}

function renderTrades() {
  const list = document.getElementById('trade-list');
  const empty = document.getElementById('journal-empty');
  const rpTrades = document.getElementById('right-panel-trades');

  const total = trades.length;
  const wins  = trades.filter(t=>t.pnl>0).length;
  const pnl   = trades.reduce((s,t)=>s+t.pnl,0);
  const wr    = total ? Math.round(wins/total*100) : 0;

  // Streak
  let streak = 0, streakType = '';
  for (const t of trades) {
    if (streak===0) { streakType = t.pnl>0?'W':'L'; streak=1; }
    else if ((t.pnl>0&&streakType==='W')||(t.pnl<=0&&streakType==='L')) streak++;
    else break;
  }
  const streakStr = total ? `${streak}${streakType}` : '—';

  document.getElementById('j-total').textContent = total;
  document.getElementById('j-winrate').textContent = wr+'%';
  document.getElementById('j-winrate').style.color = wr>=50?'var(--green)':'var(--red)';
  document.getElementById('j-pnl').textContent = (pnl>=0?'+':'')+'$'+pnl.toFixed(2);
  document.getElementById('j-pnl').style.color = pnl>=0?'var(--green)':'var(--red)';
  document.getElementById('j-streak').textContent = streakStr;
  document.getElementById('j-streak').style.color = streakType==='W'?'var(--green)':streakType==='L'?'var(--red)':'var(--text3)';

  if (!total) { list.innerHTML=''; empty.style.display='block'; if(rpTrades) rpTrades.innerHTML='<div style="font-size:11px;color:var(--text3);">No trades yet</div>'; return; }
  empty.style.display='none';

  const tradeHTML = (t, compact=false) => {
    const pc = t.pnl>0?'var(--green)':t.pnl<0?'var(--red)':'var(--gold)';
    const cls = t.pnl>0?'win':t.pnl<0?'loss':'be';
    if (compact) return `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px;">
      <span style="color:var(--text2);">${t.pair} <span class="badge badge-${t.dir.toLowerCase()}">${t.dir}</span> <span style="font-family:var(--font-mono);color:var(--text3);">${t.date}</span></span>
      <span style="font-family:var(--font-mono);font-weight:700;color:${pc};">${t.pnl>=0?'+':''}$${t.pnl.toFixed(2)}</span>
    </div>`;
    return `<div class="journal-entry ${cls}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:7px;">
          <span class="badge badge-${t.dir.toLowerCase()}">${t.dir}</span>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--text2);">${t.pair}</span>
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--text3);">${t.lot} lots · ${t.tf||''}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-family:var(--font-display);font-size:16px;font-weight:800;color:${pc};">${t.pnl>=0?'+':''}$${t.pnl.toFixed(2)}</span>
          <button onclick="reviewTrade(${t.id})" style="background:none;border:1px solid var(--border2);border-radius:5px;color:var(--text3);cursor:pointer;font-size:10px;padding:2px 8px;font-family:var(--font-mono);">Review</button>
          <button onclick="deleteTrade(${t.id})" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:2px;">✕</button>
        </div>
      </div>
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);margin-bottom:${t.notes?'4px':'0'};">${t.date}${t.entry?' · In: '+t.entry+' → Out: '+t.exit:''}</div>
      ${t.notes?`<div style="font-size:11px;color:var(--text2);font-style:italic;">"${t.notes}"</div>`:''}
      <div id="review-${t.id}" style="display:none;"></div>
    </div>`;
  };

  list.innerHTML = trades.map(t=>tradeHTML(t,false)).join('');
  if (rpTrades) rpTrades.innerHTML = trades.slice(0,5).map(t=>tradeHTML(t,true)).join('');
}

function updateSidebarStats() {
  // Pull stats from sim trader — use in-memory objects (not stale localStorage snapshots)
  const simTrades = JSON.parse(localStorage.getItem('wm_sim_trades') || '[]');
  const simAcc    = (typeof simAccount !== 'undefined' && simAccount) ? simAccount
                    : (JSON.parse(localStorage.getItem('wm_sim_account') || 'null') || { balance:10000, startBalance:10000 });
  const simPos    = (typeof simPositions !== 'undefined' && simPositions) ? simPositions
                    : JSON.parse(localStorage.getItem('wm_sim_positions') || '[]');

  const total = simTrades.length;
  const wins  = simTrades.filter(t=>t.pnl>0).length;
  const wr    = total ? Math.round(wins/total*100) : 0;

  // Open P&L
  const openPnl = simPos.reduce((s,p) => {
    const price = simGetPrice ? (simGetPrice(p.inst) || p.entryPrice) : p.entryPrice;
    const diff  = p.dir === 'BUY' ? price - p.entryPrice : p.entryPrice - price;
    return s + diff * (p.pipVal || 10) * p.lots;
  }, 0);
  const equity   = simAcc.balance + openPnl;
  const totalPnl = simAcc.balance - simAcc.startBalance + openPnl;
  const bal      = simAcc.balance;
  const startBal = simAcc.startBalance || 10000;

  // Account panel
  const sbEl   = document.getElementById('sidebar-balance');
  const wrEl   = document.getElementById('sidebar-winrate');
  const tEl    = document.getElementById('sidebar-trades');
  const eqEl   = document.getElementById('rp-sim-equity');
  const opPnlEl = document.getElementById('rp-sim-open-pnl');
  const totPnlEl = document.getElementById('rp-sim-total-pnl');

  if (sbEl)  { sbEl.textContent = '$' + bal.toFixed(2); sbEl.style.color = bal >= startBal ? 'var(--green)' : 'var(--red)'; }
  if (wrEl)  { wrEl.textContent = wr+'%'; wrEl.style.color = wr>=50?'var(--green)':'var(--red)'; }
  if (tEl)   tEl.textContent = total;
  if (eqEl)  { eqEl.textContent = '$' + equity.toFixed(2); eqEl.style.color = equity >= startBal ? 'var(--green)' : 'var(--red)'; }
  if (opPnlEl) { opPnlEl.textContent = (openPnl>=0?'+':'')+'$'+openPnl.toFixed(2); opPnlEl.style.color = openPnl>=0?'var(--green)':'var(--red)'; }
  if (totPnlEl) { totPnlEl.textContent = (totalPnl>=0?'+':'')+'$'+totalPnl.toFixed(2); totPnlEl.style.color = totalPnl>=0?'var(--green)':'var(--red)'; }

  // Risk snapshot panel
  const rpBal   = document.getElementById('rp-balance');
  const rpRisk  = document.getElementById('rp-risk-amt');
  const rpLimit = document.getElementById('rp-daily-limit');
  const rpPos   = document.getElementById('rp-lot-size');
  const rpBar   = document.getElementById('rp-limit-bar');
  const rpPct   = document.getElementById('rp-limit-pct');

  if (rpBal)   { rpBal.textContent   = '$' + bal.toFixed(2); rpBal.style.color = bal>=startBal?'var(--green)':'var(--red)'; }
  if (rpRisk)  rpRisk.textContent  = '$' + (bal * 0.02).toFixed(2);
  if (rpLimit) rpLimit.textContent = '$' + (bal * 0.05).toFixed(2);
  if (rpPos)   rpPos.textContent   = simPos.length;

  // Daily drawdown bar
  const drawdown = Math.max(0, (startBal - bal) / startBal * 100);
  if (rpBar) { rpBar.style.width = Math.min(100, drawdown) + '%'; rpBar.style.background = drawdown > 5 ? 'var(--red)' : drawdown > 2 ? 'var(--gold)' : 'var(--green)'; }
  if (rpPct) rpPct.textContent = drawdown.toFixed(1) + '%';

  // Recent sim trades in right panel
  const rpTrades = document.getElementById('right-panel-trades');
  if (rpTrades) {
    if (!simTrades.length) {
      rpTrades.innerHTML = '<div style="font-size:11px;color:var(--text3);">No sim trades yet</div>';
    } else {
      rpTrades.innerHTML = simTrades.slice(-5).reverse().map(t => {
        const col = t.pnl >= 0 ? 'var(--green)' : 'var(--red)';
        const sign = t.pnl >= 0 ? '+' : '';
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border);font-size:11px;">
          <span style="font-family:var(--font-mono);color:var(--text2);">${t.inst||t.pair||'?'} <span style="color:${t.dir==='BUY'?'var(--green)':'var(--red)'};font-size:9px;">${t.dir||''}</span></span>
          <span style="font-family:'Inter',sans-serif;font-weight:700;letter-spacing:-0.02em;color:${col};">${sign}$${(t.pnl||0).toFixed(2)}</span>
        </div>`;
      }).join('');
    }
  }
}

// ═══════════════════════════════════════════
// SIM TRADER ENGINE
// ═══════════════════════════════════════════
var simAccount = JSON.parse(localStorage.getItem('wm_sim_account') || 'null') || {
  balance: 10000, startBalance: 10000
};
var simPositions = JSON.parse(localStorage.getItem('wm_sim_positions') || '[]');
var simHistory   = JSON.parse(localStorage.getItem('wm_sim_trades')    || '[]');
var simDir = 'BUY';
var simPriceTimer = null;

function simSave() {
  localStorage.setItem('wm_sim_account',   JSON.stringify(simAccount));
  localStorage.setItem('wm_sim_positions', JSON.stringify(simPositions));
  if (simHistory.length > 500) simHistory = simHistory.slice(0, 500);
  localStorage.setItem('wm_sim_trades',    JSON.stringify(simHistory));
}

function simGetPrice(instrument) {
  return livePriceCache[instrument] || prevPrices[instrument] || null;
}

function simUpdatePrice() {
  const inst  = document.getElementById('sim-instrument')?.value;
  const price = simGetPrice(inst);
  const el    = document.getElementById('sim-market-price');
  if (el) el.textContent = price ? price.toFixed(['BTCUSD','ETHUSD','US30','SPX500','NAS100','XAUUSD','XAGUSD'].includes(inst) ? 2 : 5) : '—';
  simCalcRisk();
}

function simSetDir(dir) {
  simDir = dir;
  // Update confirm modal exec button colour if already open
  const execBtn = document.getElementById('sim-confirm-exec');
  if (execBtn) {
    execBtn.style.background = dir === 'BUY'
      ? 'linear-gradient(135deg,#00E87A,#00A855)'
      : 'linear-gradient(135deg,#FF3D5A,#CC0022)';
    execBtn.style.color = dir === 'BUY' ? '#000' : '#fff';
  }
}

function simToggleLimit() {
  const type = document.getElementById('sim-order-type')?.value;
  const row  = document.getElementById('sim-limit-row');
  if (row) row.style.display = type === 'market' ? 'none' : 'block';
}

function simCalcRisk() {
  const inst     = document.getElementById('sim-instrument')?.value;
  const lots     = parseFloat(document.getElementById('sim-lots')?.value) || 0.01;
  const tp       = parseFloat(document.getElementById('sim-tp')?.value)   || 0;
  const sl       = parseFloat(document.getElementById('sim-sl')?.value)   || 0;
  const leverage = parseFloat(document.getElementById('sim-leverage')?.value) || 100;
  const price    = simGetPrice(inst) || 0;

  // Pip value per lot (approx)
  const pipVal = inst === 'XAUUSD' ? 100 : inst === 'BTCUSD' ? 1 : inst === 'ETHUSD' ? 1 :
    ['US30','SPX500','NAS100'].includes(inst) ? 1 : 10;

  const margin = price ? ((price * lots * 100000) / leverage / 1000).toFixed(2) : '—';
  const slDist = sl && price ? Math.abs(price - sl) : 0;
  const tpDist = tp && price ? Math.abs(tp - price) : 0;
  const maxRisk = slDist ? (slDist * pipVal * lots).toFixed(2) : '—';
  const rr = slDist && tpDist ? '1:' + (tpDist / slDist).toFixed(2) : '—';

  const marginEl  = document.getElementById('sim-margin');
  const maxRiskEl = document.getElementById('sim-max-risk');
  const rrEl      = document.getElementById('sim-rr-display');
  if (marginEl)  marginEl.textContent  = margin !== '—' ? '$' + margin : '—';
  if (maxRiskEl) maxRiskEl.textContent = maxRisk !== '—' ? '$' + maxRisk : '—';
  if (rrEl)      rrEl.textContent      = rr;
}

function simCalcLotFromRisk() {
  const riskAmt  = parseFloat(document.getElementById('sim-risk-amt')?.value) || 0;
  const sl       = parseFloat(document.getElementById('sim-sl')?.value)       || 0;
  const inst     = document.getElementById('sim-instrument')?.value;
  const price    = simGetPrice(inst) || 0;
  if (!riskAmt || !sl || !price) return;
  const pipVal = inst === 'XAUUSD' ? 100 : inst === 'BTCUSD' ? 1 : 10;
  const slDist = Math.abs(price - sl);
  if (!slDist) return;
  const lots = Math.max(0.01, Math.floor((riskAmt / (slDist * pipVal)) * 100) / 100);
  const lotsEl = document.getElementById('sim-lots');
  if (lotsEl) lotsEl.value = lots.toFixed(2);
  simCalcRisk();
}

function simPlaceOrder() {
  const inst      = document.getElementById('sim-instrument').value;
  const lots      = parseFloat(document.getElementById('sim-lots').value)     || 0.01;
  const tp        = parseFloat(document.getElementById('sim-tp').value)        || null;
  const sl        = parseFloat(document.getElementById('sim-sl').value)        || null;
  const leverage  = parseFloat(document.getElementById('sim-leverage').value)  || 100;
  const orderType = document.getElementById('sim-order-type').value;
  const limitPx   = parseFloat(document.getElementById('sim-entry-price')?.value) || null;

  // ── Hard Stop enforcement — block new trades while suspended ──────────────
  if (simAccount && simAccount.peakBalance) {
    const ddPct = ((simAccount.peakBalance - simAccount.balance) / simAccount.peakBalance) * 100;
    const tier = getDrawdownTier(ddPct);
    if (tier.level >= 3) {
      toast('HARD STOP. Trading suspended. Close all positions and step away.');
      return;
    }
  }

  const price = orderType === 'market'
    ? (simGetPrice(inst) || 0)
    : (limitPx || simGetPrice(inst) || 0);

  if (!price) {
    toast('Fetching price for ' + inst + '...');
    fetchPriceForInstrument(inst).then(() => {
      simUpdatePrice();
      if (simGetPrice(inst)) simPlaceOrder();
      else toast('No live price available for ' + inst + '. Try selecting the instrument again.');
    });
    return;
  }

  const pipVal = inst === 'XAUUSD' ? 100 : inst === 'BTCUSD' ? 1 : inst === 'ETHUSD' ? 1 :
    ['US30','SPX500','NAS100'].includes(inst) ? 1 : 10;
  const margin = (price * lots * 100000) / leverage / 1000;

  if (margin > simAccount.balance) {
    toast('Insufficient margin. Add funds or reduce lot size.');
    return;
  }

  const pos = {
    id: Date.now(), inst, dir: simDir, lots, entryPrice: price,
    tp: tp || null, sl: sl || null, leverage, pipVal,
    openTime: new Date().toLocaleString(), status: 'open',
    type: orderType
  };

  // ── Behaviour detectors on order placement ─────────────────────────
  if (typeof logBehaviourEvent === 'function') {
    const _now      = Date.now();
    const _midnight = new Date(); _midnight.setHours(0, 0, 0, 0);

    if (simHistory.length) {
      const _last    = simHistory[0];
      const _elapsed = _last.closedTs ? (_now - _last.closedTs) : (_now - _last.id);
      // REVENGE_TRADE: last closed trade was a loss within 20 minutes
      if (_last.pnl < 0 && _elapsed < 20 * 60 * 1000) {
        logBehaviourEvent('REVENGE_TRADE', inst, null);
      }
      // FOMO_ENTRY: last trade closed within 3 minutes on a different instrument
      if (_last.closedTs && (_now - _last.closedTs) < 3 * 60 * 1000 && _last.inst !== inst) {
        logBehaviourEvent('FOMO_ENTRY', inst, null);
      }
    }
    // OVERTRADE: 5 or more trades already closed today
    const _todayCount = simHistory.filter(function(t) {
      return (t.closedTs || t.id) >= _midnight.getTime();
    }).length;
    if (_todayCount >= 5) logBehaviourEvent('OVERTRADE', inst, null);

    // TILT_PATTERN: last 4 closed trades are all losses
    if (simHistory.length >= 4 && simHistory.slice(0, 4).every(function(t) { return t.pnl < 0; })) {
      logBehaviourEvent('TILT_PATTERN', inst, null);
    }
  }
  // ──────────────────────────────────────────────────────────────────

  simPositions.push(pos);
  simSave();
  renderSimPositions();
  simUpdateAccount();
  toast(`${simDir}: ${lots} lots ${inst} at ${price.toFixed(2)}.`);
}

function simClosePosition(id) {
  const idx = simPositions.findIndex(p => p.id === id);
  if (idx === -1) return;
  const pos   = simPositions[idx];
  const price = simGetPrice(pos.inst) || pos.entryPrice;

  const pipVal = pos.pipVal || 10;
  const priceDiff = pos.dir === 'BUY' ? price - pos.entryPrice : pos.entryPrice - price;
  const pnl = priceDiff * pipVal * pos.lots;

  const closed = { ...pos, closePrice: price, pnl, closeTime: new Date().toLocaleString(), closedTs: Date.now(), status: 'closed' };
  // EARLY_EXIT: closed in profit but TP was set and not yet reached
  if (pos.tp && pnl > 0) {
    const towardsTP = pos.dir === 'BUY' ? (price < pos.tp) : (price > pos.tp);
    if (towardsTP && typeof logBehaviourEvent === 'function') {
      logBehaviourEvent('EARLY_EXIT', pos.inst, pos.id);
    }
  }
  simHistory.unshift(closed);
  simPositions.splice(idx, 1);
  simAccount.balance += pnl;
  if (simAccount.balance <= 0) { simAccount.balance = 0; toast('Account balance exhausted. Add funds to continue.'); }
  simSave();
  simWriteJournalEntry(closed);
  renderSimPositions();
  renderSimHistory();
  simUpdateAccount();
  simUpdateSessionStrip();
  renderSimJournal();
  buildHeatmap();
  toast(`Closed ${pos.dir} ${pos.inst}: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}.`);
  if (pnl < 0) simStartLockout();
  simShowAcademyBanner(closed);
}

function simCloseAll() {
  if (!simPositions.length) return;
  [...simPositions].forEach(p => simClosePosition(p.id));
}

function simUpdateAccount() {
  const openPnl = simPositions.reduce((s, p) => {
    const price = simGetPrice(p.inst) || p.entryPrice;
    const priceDiff = p.dir === 'BUY' ? price - p.entryPrice : p.entryPrice - price;
    return s + priceDiff * (p.pipVal || 10) * p.lots;
  }, 0);
  const equity   = simAccount.balance + openPnl;
  const totalPnl = simAccount.balance - simAccount.startBalance + openPnl;

  const balEl  = document.getElementById('sim-balance-display');
  const eqEl   = document.getElementById('sim-equity-display');
  const opEl   = document.getElementById('sim-pnl-display');
  const totEl  = document.getElementById('sim-total-pnl-display');

  if (balEl) { balEl.textContent = '$' + simAccount.balance.toFixed(2); balEl.style.color = simAccount.balance >= simAccount.startBalance ? 'var(--green)' : 'var(--red)'; }
  if (eqEl)  { eqEl.textContent  = '$' + equity.toFixed(2);   eqEl.style.color  = equity  >= simAccount.startBalance ? 'var(--green)' : 'var(--red)'; }
  if (opEl)  { opEl.textContent  = (openPnl >= 0 ? '+' : '') + '$' + openPnl.toFixed(2);  opEl.style.color  = openPnl  >= 0 ? 'var(--green)' : 'var(--red)'; }
  if (totEl) { totEl.textContent = (totalPnl >= 0 ? '+' : '') + '$' + totalPnl.toFixed(2); totEl.style.color = totalPnl >= 0 ? 'var(--green)' : 'var(--red)'; }
  renderSimPositionsStrip();
  // Keep right panel in sync
  updateSidebarStats();
}

function simAddFunds() {
  const amt = prompt('Enter amount to add ($):');
  const n   = parseFloat(amt);
  if (!n || n <= 0) return;
  simAccount.balance      += n;
  simAccount.startBalance += n;
  // Adding funds raises the peak — recalculate so drawdown banner reflects new baseline
  if (!simAccount.peakBalance || simAccount.balance > simAccount.peakBalance) {
    simAccount.peakBalance = simAccount.balance;
  }
  simSave();
  simUpdateAccount();
  toast(`Added $${n.toFixed(2)} to sim account.`);
}

function simResetAccount() {
  if (!confirm('Reset sim account to $10,000? All positions and history will be cleared.')) return;
  simPositions = [];
  simHistory   = [];
  simAccount   = { balance: 10000, startBalance: 10000, peakBalance: 10000 };
  simSave();
  renderSimPositions();
  renderSimHistory();
  simUpdateAccount();
  toast('Sim account reset to $10,000.');
}

function simClearHistory() {
  if (!confirm('Clear trade history?')) return;
  simHistory = [];
  simSave();
  renderSimHistory();
}

function renderSimPositions() {
  const el = document.getElementById('sim-open-positions');
  if (!el) return;

  // ── Drawdown Protection Tier (Sim Trader) ────────────────────────────────
  // Track the all-time peak balance. Initialise from startBalance the first time.
  // Only update peak when balance genuinely exceeds it — never downward.
  const simDDEl = document.getElementById('sim-drawdown-strip');
  if (simDDEl && simAccount) {
    if (!simAccount.peakBalance || simAccount.peakBalance < simAccount.startBalance) {
      simAccount.peakBalance = simAccount.startBalance || 10000;
    }
    if (simAccount.balance > simAccount.peakBalance) {
      simAccount.peakBalance = simAccount.balance;
      simSave();
    }
    const peakBal = simAccount.peakBalance;
    const current = simAccount.balance || 10000;
    const ddHtml = renderDrawdownTierStrip(peakBal, current);
    if (ddHtml) {
      simDDEl.style.display = 'block';
      simDDEl.innerHTML = ddHtml;
    } else {
      simDDEl.style.display = 'none';
    }
  }

  if (!simPositions.length) {
    el.innerHTML = '<div class="empty" style="padding:20px 0;"><div class="empty-text" style="font-size:11px;">No open positions.</div></div>';
    renderSimPositionsStrip();
    return;
  }
  el.innerHTML = simPositions.map(p => {
    const price    = simGetPrice(p.inst) || p.entryPrice;
    const priceDiff= p.dir === 'BUY' ? price - p.entryPrice : p.entryPrice - price;
    const pnl      = priceDiff * (p.pipVal || 10) * p.lots;
    const pnlColor = pnl >= 0 ? 'var(--green)' : 'var(--red)';
    const dp       = ['BTCUSD','ETHUSD','US30','SPX500','NAS100','XAUUSD','XAGUSD'].includes(p.inst) ? 2 : 5;
    return `<div style="background:var(--bg2);border-radius:7px;padding:10px;margin-bottom:7px;border-left:3px solid ${p.dir==='BUY'?'var(--green)':'var(--red)'};">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="badge badge-${p.dir.toLowerCase()}" style="font-size:8px;">${p.dir}</span>
          <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;">${p.inst}</span>
          <span style="font-family:var(--font-mono);font-size:9px;color:var(--text3);">${p.lots}L</span>
        </div>
        <span style="font-family:var(--font-display);font-size:15px;font-weight:800;color:${pnlColor};">${pnl>=0?'+':''}$${pnl.toFixed(2)}</span>
      </div>
      <div style="display:flex;gap:8px;font-family:var(--font-mono);font-size:8px;color:var(--text3);margin-bottom:7px;">
        <span>In: <strong style="color:var(--text2);">${p.entryPrice.toFixed(dp)}</strong></span>
        <span>Now: <strong style="color:var(--text2);">${price.toFixed(dp)}</strong></span>
        ${p.sl ? `<span style="color:var(--red);">SL:${p.sl.toFixed(dp)}</span>` : ''}
        ${p.tp ? `<span style="color:var(--green);">TP:${p.tp.toFixed(dp)}</span>` : ''}
      </div>
      <div style="display:flex;gap:6px;">
        <button onclick="simClosePosition(${p.id})" style="flex:1;background:var(--red-dim);border:1px solid var(--red);border-radius:5px;color:var(--red);font-family:var(--font-mono);font-size:8px;padding:4px;cursor:pointer;font-weight:700;">Close</button>
        <button onclick="simPartialClose(${p.id})" style="flex:1;background:var(--blue-dim);border:1px solid var(--blue);border-radius:5px;color:var(--blue);font-family:var(--font-mono);font-size:8px;padding:4px;cursor:pointer;">Partial</button>
      </div>
    </div>`;
  }).join('');
  renderSimPositionsStrip();
}

function simPartialClose(id) {
  const pos = simPositions.find(p => p.id === id);
  if (!pos) return;
  const maxLots = pos.lots;
  const input   = prompt(`Partial close — enter lots to close (max ${maxLots}):`);
  const closeLots = parseFloat(input);
  if (!closeLots || closeLots <= 0 || closeLots > maxLots) {
    toast('Invalid lot size for partial close.');
    return;
  }
  const price    = simGetPrice(pos.inst) || pos.entryPrice;
  const priceDiff= pos.dir === 'BUY' ? price - pos.entryPrice : pos.entryPrice - price;
  const pnl      = priceDiff * (pos.pipVal || 10) * closeLots;

  // Record partial close in history
  const partialClosed = { ...pos, lots: closeLots, closePrice: price, pnl, closeTime: new Date().toLocaleString(), closedTs: Date.now(), status: 'closed', partial: true };
  simHistory.unshift(partialClosed);

  // Reduce remaining position or remove if fully closed
  pos.lots = Math.round((pos.lots - closeLots) * 100) / 100;
  simAccount.balance += pnl;
  if (pos.lots <= 0) {
    simPositions = simPositions.filter(p => p.id !== id);
  }
  if (simAccount.balance <= 0) { simAccount.balance = 0; toast('Account exhausted. Add funds to continue.'); }
  simSave();
  simWriteJournalEntry(partialClosed);
  renderSimPositions();
  renderSimHistory();
  simUpdateAccount();
  simUpdateSessionStrip();
  renderSimJournal();
  buildHeatmap();
  toast(`Partial close: ${closeLots}L ${pos.inst}: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}.`);
  if (pnl < 0) simStartLockout();
}

function renderSimHistory() {
  const el      = document.getElementById('sim-history');
  const statsEl = document.getElementById('sim-history-stats');
  if (!el) return;
  if (!simHistory.length) {
    el.innerHTML = '<div class="empty" style="padding:20px 0;"><div class="empty-text" style="font-size:11px;">No closed trades yet.</div></div>';
    if (statsEl) statsEl.textContent = '';
    return;
  }
  const wins = simHistory.filter(t => t.pnl > 0).length;
  const wr   = Math.round(wins / simHistory.length * 100);
  const pnl  = simHistory.reduce((s, t) => s + t.pnl, 0);
  if (statsEl) statsEl.innerHTML = `<span style="color:${wr>=50?'var(--green)':'var(--red)'};">${wr}% WR</span> · <span style="color:${pnl>=0?'var(--green)':'var(--red)'};">${pnl>=0?'+':''}$${pnl.toFixed(2)}</span>`;

  el.innerHTML = simHistory.slice(0, 30).map(t => {
    const pc = t.pnl >= 0 ? 'var(--green)' : 'var(--red)';
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">
      <div style="display:flex;align-items:center;gap:7px;">
        <span class="badge badge-${t.dir.toLowerCase()}">${t.dir}</span>
        <span style="font-family:var(--font-mono);font-size:11px;color:var(--text2);">${t.inst}</span>
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text3);">${t.lots}L</span>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text3);">${t.entryPrice?.toFixed?.(2) || '—'} → ${t.closePrice?.toFixed?.(2) || '—'}</span>
        <span style="font-family:var(--font-mono);font-weight:700;color:${pc};">${t.pnl>=0?'+':''}$${t.pnl.toFixed(2)}</span>
      </div>
    </div>`;
  }).join('');
}

var simCurrentTF = '15';
var simChartInit = false;

function simPanelTab(btn, panelId) {
  document.querySelectorAll('.sim-panel-tab').forEach(b => {
    b.classList.remove('active');
    b.style.color = 'var(--text3)';
    b.style.borderBottomColor = 'transparent';
  });
  btn.classList.add('active');
  btn.style.color = 'var(--gold)';
  btn.style.borderBottomColor = 'var(--gold)';
  ['sim-panel-order','sim-panel-positions','sim-panel-history'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === panelId ? 'flex' : 'none';
    if (el && id === panelId) el.style.flexDirection = 'column';
  });
}

function simSetTF(btn, tf) {
  simCurrentTF = tf;
  document.querySelectorAll('.sim-tf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  simLoadChart();
}

// Tracks which instrument the sim chart iframe is currently showing
// so postMessage price ticks from that iframe are routed correctly
var currentSimChartPair = 'XAUUSD';

function simOnInstrumentChange() {
  const inst = document.getElementById('sim-instrument')?.value || 'XAUUSD';
  currentSimChartPair = inst;
  simLoadChart();
  simUpdatePrice();
  simCalcRisk();
  // Immediately fetch price from API if not already in cache
  if (!livePriceCache[inst]) {
    fetchPriceForInstrument(inst).then(() => {
      simUpdatePrice();
      simCalcRisk();
    });
  }
}

// Fetch price for a single instrument and populate livePriceCache.
// Priority: Binance WS (crypto) → Deriv WS (forex/metals) → TwelveData (everything else)
async function fetchPriceForInstrument(inst) {
  if (!inst) return;
  // Crypto — connect Binance WS
  if (BINANCE_SYMBOLS[inst]) {
    connectBinancePair(inst);
    await new Promise(r => setTimeout(r, 600));
    if (livePriceCache[inst]) return;
  }
  // Forex/metals — use Deriv WS (primary)
  if (DERIV_SYMBOLS[inst]) {
    atEnsureDerivFeed(inst);
    // Give Deriv WS up to 2s to deliver the first tick
    await new Promise(r => setTimeout(r, 800));
    if (livePriceCache[inst]) return;
    // Deriv didn't deliver in time — fall through to TwelveData
  }
  // TwelveData fallback (indices, softs, or if Deriv timed out)
  const tdSym = TD_SYMBOLS[inst];
  if (!tdSym) return;
  try {
    const res = await fetch(`/api/prices?symbols=${encodeURIComponent(tdSym)}`);
    if (!res.ok) return;
    const data = await res.json();
    const ETF_SCALE = { US30: 100, SPX500: 10, NAS100: 43, UK100: 110, GER40: 50, JPN225: 650, AUS200: 55, HK50: 700 };
    let price = data[tdSym];
    if (price && !isNaN(price)) {
      if (ETF_SCALE[inst]) price = price * ETF_SCALE[inst];
      livePriceCache[inst] = price;
      priceSourceCache[inst] = data._source || 'td';
      updatePriceTileFromCache(inst, price);
    }
  } catch (e) {
    console.warn('fetchPriceForInstrument fallback failed for', inst, e.message);
  }
}

var simWmChart = null;

function simLoadChart() {
  const inst = document.getElementById('sim-instrument')?.value || 'XAUUSD';
  currentSimChartPair = inst;

  if (!simWmChart) {
    if (typeof createWingmanChart !== 'function') return;
    simWmChart = createWingmanChart('sim-chart-container');
    if (!simWmChart) return;
  }

  simFetchAndLoadCandles(inst, simCurrentTF);
}

function simFetchAndLoadCandles(pair, tf) {
  if (!simWmChart) return;
  const loadEl = document.getElementById('sim-chart-loading');
  if (loadEl) { loadEl.style.display = 'flex'; }

  let promise;
  if (typeof WC_BINANCE_PAIRS !== 'undefined' && WC_BINANCE_PAIRS[pair]) {
    promise = fetchCandlesBinance(WC_BINANCE_PAIRS[pair], WC_TF_BINANCE[tf] || '15m', 500);
  } else if (typeof WC_TWELVEDATA_PAIRS !== 'undefined' && WC_TWELVEDATA_PAIRS[pair]) {
    promise = fetchCandlesTwelveData(WC_TWELVEDATA_PAIRS[pair], WC_TF_TWELVEDATA[tf] || '15min', 500);
  } else {
    promise = Promise.reject(new Error('No data source mapped for ' + pair + '. Using demo candles.'));
  }

  promise.then(function(candles) {
    if (loadEl) loadEl.style.display = 'none';
    simWmChart.loadCandles(candles);
    simUpdatePrice();
  }).catch(function(err) {
    if (loadEl) loadEl.style.display = 'none';
    console.warn('Sim chart candle fetch:', err.message || err);
    if (typeof generateDemoCandles === 'function') {
      simWmChart.loadCandles(generateDemoCandles(pair, tf));
    }
    simUpdatePrice();
  });
}

function simQuickBuy() {
  simSetDir('BUY');
  simPanelTab(document.getElementById('spt-order'), 'sim-panel-order');
  simConfirmOrder();
}

function simQuickSell() {
  simSetDir('SELL');
  simPanelTab(document.getElementById('spt-order'), 'sim-panel-order');
  simConfirmOrder();
}

function simConfirmOrder() {
  // Block new orders during revenge trade lockout
  if (simCheckLockout()) {
    const countEl = document.getElementById('sim-lockout-countdown');
    const remaining = countEl ? countEl.textContent : '...';
    toast('Trading locked. Wait ' + remaining + ' before placing a new order.');
    return;
  }

  const inst     = document.getElementById('sim-instrument')?.value || 'XAUUSD';
  const lots     = parseFloat(document.getElementById('sim-lots')?.value) || 0.01;
  const sl       = parseFloat(document.getElementById('sim-sl')?.value)   || null;
  const tp       = parseFloat(document.getElementById('sim-tp')?.value)   || null;
  const leverage = parseFloat(document.getElementById('sim-leverage')?.value) || 100;
  const price    = simGetPrice(inst);

  if (!price) {
    toast('Fetching price for ' + inst + '...');
    fetchPriceForInstrument(inst).then(() => {
      simUpdatePrice();
      if (simGetPrice(inst)) simConfirmOrder();
      else toast('No live price available for ' + inst + '. Try selecting the instrument again.');
    });
    return;
  }

  const dp      = ['BTCUSD','ETHUSD','US30','SPX500','NAS100','XAUUSD','XAGUSD'].includes(inst) ? 2 : 5;
  const pipVal  = inst === 'XAUUSD' ? 100 : inst === 'BTCUSD' || inst === 'ETHUSD' ? 1 : ['US30','SPX500','NAS100'].includes(inst) ? 1 : 10;
  const margin  = ((price * lots * 100000) / leverage / 1000).toFixed(2);
  const slDist  = sl ? Math.abs(price - sl) : null;
  const tpDist  = tp ? Math.abs(tp - price) : null;
  const maxLoss = slDist ? (slDist * pipVal * lots).toFixed(2) : '—';
  const rr      = slDist && tpDist ? '1:' + (tpDist / slDist).toFixed(2) : '—';

  const dirColor = simDir === 'BUY' ? 'var(--green)' : 'var(--red)';

  // Build confirm details
  const details = [
    `<span style="color:var(--text3);">Instrument</span><span style="color:var(--text);float:right;">${inst}</span>`,
    `<span style="color:var(--text3);">Direction</span><span style="color:${dirColor};float:right;font-weight:700;">${simDir}</span>`,
    `<span style="color:var(--text3);">Entry Price</span><span style="color:var(--gold);float:right;">${price.toFixed(dp)}</span>`,
    `<span style="color:var(--text3);">Lot Size</span><span style="color:var(--text);float:right;">${lots}</span>`,
    `<span style="color:var(--text3);">Leverage</span><span style="color:var(--text);float:right;">1:${leverage === 999999 ? 'Unlimited' : leverage}</span>`,
    sl ? `<span style="color:var(--red);">Stop Loss</span><span style="color:var(--red);float:right;">${sl.toFixed(dp)}</span>` : '',
    tp ? `<span style="color:var(--green);">Take Profit</span><span style="color:var(--green);float:right;">${tp.toFixed(dp)}</span>` : '',
    `<span style="color:var(--text3);">Margin req.</span><span style="color:var(--gold);float:right;">$${margin}</span>`,
    slDist ? `<span style="color:var(--text3);">Max loss</span><span style="color:var(--red);float:right;">$${maxLoss}</span>` : '',
    (rr !== '—') ? `<span style="color:var(--text3);">R:R ratio</span><span style="color:var(--blue);float:right;">${rr}</span>` : '',
  ].filter(Boolean).map(row => `<div style="display:block;">${row}</div>`).join('');

  document.getElementById('sim-confirm-title').textContent = `Confirm ${simDir} — ${inst}`;
  document.getElementById('sim-confirm-title').style.color = dirColor;
  document.getElementById('sim-confirm-details').innerHTML = details;
  const execBtn = document.getElementById('sim-confirm-exec');
  execBtn.style.background = simDir === 'BUY' ? 'linear-gradient(135deg,#00E87A,#00A855)' : 'linear-gradient(135deg,#FF3D5A,#CC0022)';
  execBtn.style.color = simDir === 'BUY' ? '#000' : '#fff';
  execBtn.textContent = `Confirm: ${simDir} ${lots} lots at ${price.toFixed(dp)}`;

  const modal = document.getElementById('sim-confirm-modal');
  if (modal) { modal.style.display = 'flex'; }
}

function simCancelOrder() {
  const modal = document.getElementById('sim-confirm-modal');
  if (modal) modal.style.display = 'none';
}

function simExecuteOrder() {
  simCancelOrder();
  simPlaceOrder();
}

function renderSimPositionsStrip() {
  const strip   = document.getElementById('sim-positions-strip');
  const content = document.getElementById('sim-strip-content');
  if (!strip || !content) return;
  if (!simPositions.length) { strip.style.display = 'none'; return; }
  strip.style.display = 'block';
  content.innerHTML = simPositions.map(p => {
    const price    = simGetPrice(p.inst) || p.entryPrice;
    const priceDiff= p.dir === 'BUY' ? price - p.entryPrice : p.entryPrice - price;
    const pnl      = priceDiff * (p.pipVal || 10) * p.lots;
    const col      = pnl >= 0 ? 'var(--green)' : 'var(--red)';
    const dp       = ['BTCUSD','ETHUSD','US30','SPX500','NAS100','XAUUSD','XAGUSD'].includes(p.inst) ? 2 : 5;
    return `<span style="display:inline-flex;align-items:center;gap:5px;margin-right:14px;background:var(--bg2);border-radius:5px;padding:3px 8px;border:1px solid ${pnl>=0?'var(--green-dim)':'var(--red-dim)'};">
      <span style="color:${p.dir==='BUY'?'var(--green)':'var(--red)'};">${p.dir}</span>
      <span style="color:var(--text2);">${p.inst}</span>
      <span style="color:var(--text3);">${p.lots}L</span>
      <span style="color:${col};font-weight:700;">${pnl>=0?'+':''}$${pnl.toFixed(2)}</span>
      <button onclick="simClosePosition(${p.id})" style="background:none;border:none;color:var(--text4);cursor:pointer;font-size:10px;padding:0 2px;line-height:1;" title="Close">✕</button>
    </span>`;
  }).join('');
}

function initSimTrader() {
  simUpdateAccount();
  renderSimPositions();
  renderSimHistory();
  simUpdatePrice();
  simSetDir('BUY');
  // Restore lockout state from storage
  simLockoutUntil = parseInt(localStorage.getItem('wm_sim_lockout') || '0');
  simCheckLockout();
  // Load Wingman chart and pre-fetch price
  const initInst = document.getElementById('sim-instrument')?.value || 'XAUUSD';
  currentSimChartPair = initInst;
  simLoadChart();
  if (!livePriceCache[initInst]) {
    fetchPriceForInstrument(initInst).then(() => { simUpdatePrice(); simCalcRisk(); });
  }
  // Populate risk calc balance from current sim account
  const rcBal = document.getElementById('rc-balance');
  if (rcBal && simAccount) rcBal.value = simAccount.balance.toFixed(2);
  // Render journal and session strip
  renderSimJournal();
  simUpdateSessionStrip();
  // Ensure correct CSS for full-height chart mode
  const mc  = document.querySelector('.main-content');
  const rp  = document.getElementById('right-panel');
  const app = document.getElementById('app');
  if (mc)  { mc.style.padding = '0'; mc.style.overflow = 'hidden'; }
  if (rp)  rp.style.display = 'none';
  if (app) app.classList.add('chart-mode');
  // Polling interval: price, positions, account, lockout countdown
  clearInterval(simPriceTimer);
  simPriceTimer = setInterval(() => {
    simUpdatePrice();
    renderSimPositions();
    simUpdateAccount();
    updateSidebarStats();
    simCheckLockout();
  }, 2000);
}

// ═══════════════════════════════════════════
// REVENGE TRADE LOCKOUT
// ═══════════════════════════════════════════
var simLockoutUntil = parseInt(localStorage.getItem('wm_sim_lockout') || '0');

function simStartLockout() {
  simLockoutUntil = Date.now() + 15 * 60 * 1000;
  localStorage.setItem('wm_sim_lockout', String(simLockoutUntil));
  simCheckLockout();
}

function simCheckLockout() {
  const now       = Date.now();
  const remaining = simLockoutUntil - now;
  const lockEl    = document.getElementById('sim-lockout-overlay');
  const countEl   = document.getElementById('sim-lockout-countdown');

  if (remaining > 0) {
    if (lockEl) lockEl.style.display = 'flex';
    if (countEl) {
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      countEl.textContent = mins + ':' + String(secs).padStart(2, '0');
    }
    return true;
  } else {
    simLockoutUntil = 0;
    localStorage.removeItem('wm_sim_lockout');
    if (lockEl) lockEl.style.display = 'none';
    return false;
  }
}

// ═══════════════════════════════════════════
// TRADE JOURNAL — wm_trade_journal
// ═══════════════════════════════════════════
function simWriteJournalEntry(trade) {
  const journal = JSON.parse(localStorage.getItem('wm_trade_journal') || '[]');
  journal.unshift({
    id:        trade.id,
    date:      trade.closeTime || new Date().toLocaleString(),
    pair:      trade.inst,
    dir:       trade.dir,
    lot:       trade.lots,
    pnl:       trade.pnl,
    entry:     trade.entryPrice,
    exit:      trade.closePrice,
    tf:        simCurrentTF,
    partial:   trade.partial || false,
    source:    'sim'
  });
  if (journal.length > 500) journal.length = 500;
  localStorage.setItem('wm_trade_journal', JSON.stringify(journal));
}

function renderSimJournal() {
  const listEl    = document.getElementById('sim-journal-list');
  const totalEl   = document.getElementById('sjstat-total');
  const wrEl      = document.getElementById('sjstat-wr');
  const pnlEl     = document.getElementById('sjstat-pnl');
  if (!listEl) return;

  const journal = JSON.parse(localStorage.getItem('wm_trade_journal') || '[]')
    .filter(e => e.source === 'sim');

  const total = journal.length;
  const wins  = journal.filter(e => e.pnl > 0).length;
  const netPnl = journal.reduce((s, e) => s + (e.pnl || 0), 0);
  const wr    = total ? Math.round(wins / total * 100) : null;

  if (totalEl) totalEl.textContent = total;
  if (wrEl)    { wrEl.textContent = wr !== null ? wr + '%' : '—'; wrEl.style.color = wr !== null ? (wr >= 50 ? 'var(--green)' : 'var(--red)') : 'var(--text)'; }
  if (pnlEl)   { pnlEl.textContent = (netPnl >= 0 ? '+' : '') + '$' + netPnl.toFixed(2); pnlEl.style.color = netPnl >= 0 ? 'var(--green)' : 'var(--red)'; }

  if (!total) {
    listEl.innerHTML = '<div style="font-family:var(--font-mono);font-size:10px;color:var(--text4);text-align:center;padding:24px 0;">No journal entries yet.</div>';
    return;
  }

  listEl.innerHTML = journal.slice(0, 40).map(e => {
    const col  = e.pnl >= 0 ? 'var(--green)' : 'var(--red)';
    const sign = e.pnl >= 0 ? '+' : '';
    const dp   = ['BTCUSD','ETHUSD','US30','SPX500','NAS100','XAUUSD','XAGUSD','USOIL'].includes(e.pair) ? 2 : 5;
    const entryStr = e.entry ? e.entry.toFixed(dp) : '—';
    const exitStr  = e.exit  ? e.exit.toFixed(dp)  : '—';
    return `<div style="padding:7px 0;border-bottom:1px solid var(--border);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
        <div style="display:flex;align-items:center;gap:5px;">
          <span class="badge badge-${(e.dir||'buy').toLowerCase()}" style="font-size:7px;">${e.dir || 'BUY'}</span>
          <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--text);">${e.pair}</span>
          <span style="font-family:var(--font-mono);font-size:9px;color:var(--text4);">${e.lot}L</span>
          ${e.partial ? '<span style="font-family:var(--font-mono);font-size:7px;color:var(--text4);background:var(--bg3);border-radius:3px;padding:1px 4px;">partial</span>' : ''}
        </div>
        <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${col};">${sign}$${(e.pnl||0).toFixed(2)}</span>
      </div>
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);">${entryStr} → ${exitStr} &nbsp;|&nbsp; ${e.tf ? e.tf + 'M' : ''} &nbsp;|&nbsp; ${e.date || ''}</div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════
// SESSION PERFORMANCE STRIP
// ═══════════════════════════════════════════
function simUpdateSessionStrip() {
  const tradesEl  = document.getElementById('sim-sess-trades');
  const pnlEl     = document.getElementById('sim-sess-pnl');
  const wrEl      = document.getElementById('sim-sess-wr');
  const streakEl  = document.getElementById('sim-sess-streak');
  const bestEl    = document.getElementById('sim-sess-best');
  const worstEl   = document.getElementById('sim-sess-worst');
  if (!tradesEl) return;

  // Today's trades: entries from wm_trade_journal since midnight local time
  const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
  const midTs    = midnight.getTime();
  const todayTrades = (simHistory || []).filter(t => {
    // simHistory stores closeTime as locale string — compare by timestamp id (rough proxy)
    // Use id (Date.now() at trade open) as fallback if date parsing fails
    return t.id >= midTs;
  });

  const total = todayTrades.length;
  const wins  = todayTrades.filter(t => t.pnl > 0).length;
  const netPnl = todayTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const wr    = total ? Math.round(wins / total * 100) : null;

  // Streak from most recent trades
  let streak = 0, streakType = '';
  for (const t of todayTrades) {
    if (streak === 0) { streakType = t.pnl > 0 ? 'W' : 'L'; streak = 1; }
    else if ((t.pnl > 0 && streakType === 'W') || (t.pnl <= 0 && streakType === 'L')) streak++;
    else break;
  }

  const best  = todayTrades.length ? Math.max(...todayTrades.map(t => t.pnl)) : null;
  const worst = todayTrades.length ? Math.min(...todayTrades.map(t => t.pnl)) : null;

  tradesEl.textContent = total;
  if (pnlEl)  { pnlEl.textContent = (netPnl >= 0 ? '+' : '') + '$' + netPnl.toFixed(2); pnlEl.style.color = netPnl >= 0 ? 'var(--green)' : 'var(--red)'; }
  if (wrEl)   { wrEl.textContent = wr !== null ? wr + '%' : '—'; wrEl.style.color = wr !== null ? (wr >= 50 ? 'var(--green)' : 'var(--red)') : 'var(--text3)'; }
  if (streakEl) { streakEl.textContent = streak ? streak + streakType : '—'; streakEl.style.color = streakType === 'W' ? 'var(--green)' : streakType === 'L' ? 'var(--red)' : 'var(--text3)'; }
  if (bestEl)  { bestEl.textContent  = best  !== null ? '+$' + best.toFixed(2)  : '—'; }
  if (worstEl) { worstEl.textContent = worst !== null ? (worst >= 0 ? '+' : '') + '$' + worst.toFixed(2) : '—'; worstEl.style.color = worst !== null && worst < 0 ? 'var(--red)' : 'var(--green)'; }
}

// ═══════════════════════════════════════════
// POST-TRADE ACADEMY BANNER
// ═══════════════════════════════════════════
var simBannerTimer = null;

var SIM_COACHING_TIPS = {
  win: [
    'Well executed. Review the setup in the Academy to reinforce what worked.',
    'Profitable trade recorded. Check your R:R ratio in Stage 3 to see if you held long enough.',
    'Good result. Consider whether your entry was optimal by reviewing Stage 2.',
    'Win recorded. Consistent discipline compounds over time.'
  ],
  loss: [
    'Loss recorded. Review your stop placement against the Stage 3 criteria before your next trade.',
    'Study the entry in Stage 2 before re-entering. A 15 minute pause is now active.',
    'Loss logged. Check whether your trade aligned with the session quality criteria in Stage 4.',
    'Review this setup in your journal. Identifying the reason for the loss is more valuable than the loss itself.'
  ]
};

function simShowAcademyBanner(trade) {
  const bannerEl = document.getElementById('sim-academy-banner');
  const textEl   = document.getElementById('sim-banner-text');
  if (!bannerEl || !textEl) return;

  const pool = trade.pnl >= 0 ? SIM_COACHING_TIPS.win : SIM_COACHING_TIPS.loss;
  textEl.textContent = pool[Math.floor(Math.random() * pool.length)];

  // Slide up
  bannerEl.style.bottom = '0';

  // Auto-dismiss after 7 seconds
  clearTimeout(simBannerTimer);
  simBannerTimer = setTimeout(simDismissBanner, 7000);
}

function simDismissBanner() {
  const bannerEl = document.getElementById('sim-academy-banner');
  if (bannerEl) bannerEl.style.bottom = '-90px';
  clearTimeout(simBannerTimer);
}

// ═══════════════════════════════════════════
// RISK CALCULATOR SLIDE-OUT
// ═══════════════════════════════════════════
var simRiskCalcOpen = false;

function simToggleRiskCalc() {
  const panel = document.getElementById('sim-risk-calc-panel');
  if (!panel) return;
  simRiskCalcOpen = !simRiskCalcOpen;
  panel.style.transform = simRiskCalcOpen ? 'translateX(0)' : 'translateX(100%)';
  // Pre-fill balance from current sim account when opening
  if (simRiskCalcOpen) {
    const rcBal = document.getElementById('rc-balance');
    if (rcBal && simAccount) rcBal.value = simAccount.balance.toFixed(2);
    simCalcRiskPanel();
  }
}

function simCalcRiskPanel() {
  const balance  = parseFloat(document.getElementById('rc-balance')?.value)   || 0;
  const riskPct  = parseFloat(document.getElementById('rc-risk-pct')?.value)  || 2;
  const entry    = parseFloat(document.getElementById('rc-entry')?.value)      || 0;
  const sl       = parseFloat(document.getElementById('rc-sl')?.value)         || 0;
  const inst     = document.getElementById('rc-inst')?.value || 'EURUSD';

  const riskAmt  = document.getElementById('rc-result-risk');
  const slDistEl = document.getElementById('rc-result-sldist');
  const lotsEl   = document.getElementById('rc-result-lots');
  if (!riskAmt || !slDistEl || !lotsEl) return;

  if (!balance || !entry || !sl || entry === sl) {
    riskAmt.textContent  = '—';
    slDistEl.textContent = '—';
    lotsEl.textContent   = '—';
    return;
  }

  // Pip value per standard lot (100,000 units)
  const pipVal = inst === 'XAUUSD' ? 100
               : (inst === 'BTCUSD' || inst === 'ETHUSD') ? 1
               : ['US30','SPX500','NAS100','USOIL'].includes(inst) ? 1
               : 10;

  const risk    = balance * (riskPct / 100);
  const slDist  = Math.abs(entry - sl);
  const lots    = slDist > 0 ? Math.max(0.01, Math.floor((risk / (slDist * pipVal)) * 100) / 100) : 0;

  riskAmt.textContent  = '$' + risk.toFixed(2);
  slDistEl.textContent = slDist.toFixed(5);
  lotsEl.textContent   = lots > 0 ? lots.toFixed(2) : '—';
}

