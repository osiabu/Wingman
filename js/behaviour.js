// ═══════════════════════════════════════════
// TRADE BEHAVIOUR REVIEW (Risk Calculator)
// ═══════════════════════════════════════════
async function refreshTradeBehaviourReview() {
  const card = document.getElementById('trade-behaviour-content');
  const btn  = document.getElementById('behaviour-refresh-btn');
  if (!card) return;

  // Combine sim trades and journal trades
  const simTrades  = JSON.parse(localStorage.getItem('wm_sim_trades') || '[]');
  const allTrades  = [...trades, ...simTrades];

  if (!allTrades.length) {
    card.innerHTML = '<div style="font-size:12px;color:var(--text3);line-height:1.6;">No trades logged yet. Use Sim Trader or log trades in your journal to get a behavioural analysis here.</div>';
    return;
  }



  card.innerHTML = '<div class="pulse" style="font-family:var(--font-mono);font-size:11px;color:var(--text3);">Analysing your trading behaviour...</div>';
  if (btn) btn.disabled = true;

  const recent = allTrades.slice(0, 20);
  const prompt = `Analyse this trader's recent behaviour across ${recent.length} trades. Be honest, direct, constructive. Focus on patterns, psychology, and risk management.

TRADES (newest first):
${JSON.stringify(recent.map(t=>({pair:t.pair||t.instrument,dir:t.dir||t.direction,lot:t.lot||t.lotSize,pnl:t.pnl,tf:t.tf||t.timeframe,notes:t.notes||''})))}

Overall: ${allTrades.length} total trades, P&L: $${allTrades.reduce((s,t)=>s+t.pnl,0).toFixed(2)}, Win rate: ${Math.round(allTrades.filter(t=>t.pnl>0).length/allTrades.length*100)}%

Respond ONLY with raw JSON:
{"summary":"2-3 sentence overview of their trading behaviour","riskPattern":"What their risk/sizing behaviour shows","psychologyPattern":"Emotional or psychological tendencies detected","lotScaling":"Analysis of how they scale positions — any martingale or escalation?","topStrength":"What they do well","topRisk":"The single biggest risk in their current approach","recommendation":"Most important thing to change or maintain"}`;

  try {
    const res = await fetch(WORKER_URL + '/behaviour', {
      method:'POST',
      headers: workerHeaders(),
      body:JSON.stringify({ prompt })
    });
    const data = await res.json();
    const text = data.content?.find(b=>b.type==='text')?.text || '';
    const r = extractJSON(text);
    if (!r) throw new Error('No analysis data');

    card.innerHTML = `
      <div style="margin-bottom:10px;">
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--blue);letter-spacing:1px;margin-bottom:4px;">OVERVIEW</div>
        <div style="font-size:12px;color:var(--text2);line-height:1.55;">${r.summary||''}</div>
      </div>
      ${r.lotScaling?`<div style="margin-bottom:10px;background:var(--bg2);border-radius:6px;padding:10px;"><div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1px;margin-bottom:4px;">POSITION SIZING</div><div style="font-size:12px;color:var(--text2);line-height:1.55;">${r.lotScaling}</div></div>`:''}
      ${r.psychologyPattern?`<div style="margin-bottom:10px;"><div style="font-family:var(--font-mono);font-size:8px;color:var(--purple);letter-spacing:1px;margin-bottom:4px;">PSYCHOLOGY</div><div style="font-size:12px;color:var(--text2);line-height:1.55;">${r.psychologyPattern}</div></div>`:''}
      ${r.topRisk?`<div style="margin-bottom:10px;background:var(--red-dim);border-radius:6px;padding:10px;"><div style="font-family:var(--font-mono);font-size:8px;color:var(--red);letter-spacing:1px;margin-bottom:4px;">KEY RISK</div><div style="font-size:12px;color:var(--text2);line-height:1.55;">${r.topRisk}</div></div>`:''}
      ${r.topStrength?`<div style="margin-bottom:10px;background:var(--green-dim);border-radius:6px;padding:10px;"><div style="font-family:var(--font-mono);font-size:8px;color:var(--green);letter-spacing:1px;margin-bottom:4px;">STRENGTH</div><div style="font-size:12px;color:var(--text2);line-height:1.55;">${r.topStrength}</div></div>`:''}
      ${r.recommendation?`<div style="background:var(--gold-dim);border-radius:6px;padding:10px;"><div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1px;margin-bottom:4px;">RECOMMENDATION</div><div style="font-size:12px;color:var(--text2);line-height:1.55;">${r.recommendation}</div></div>`:''}
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--text4);margin-top:8px;">Based on ${allTrades.length} trades (journal + sim)</div>`;
  } catch(e) {
    card.innerHTML = `<div style="font-size:11px;color:var(--red);">Analysis failed: ${e.message}</div>`;
  } finally {
    if (btn) btn.disabled = false;
  }
}


// ── CALC DIRECTION STATE ─────────────────────────────────────────────────────
var calcDirection = 'BUY';
function setCalcDir(dir) {
  calcDirection = dir;
  const buyBtn  = document.getElementById('calc-buy-btn');
  const sellBtn = document.getElementById('calc-sell-btn');
  if (dir === 'BUY') {
    buyBtn.style.borderColor  = 'var(--green)'; buyBtn.style.background  = 'var(--green-dim)'; buyBtn.style.color  = 'var(--green)';
    sellBtn.style.borderColor = 'var(--border2)'; sellBtn.style.background = 'transparent'; sellBtn.style.color = 'var(--text3)';
  } else {
    sellBtn.style.borderColor = 'var(--red)'; sellBtn.style.background  = 'var(--red-dim)'; sellBtn.style.color  = 'var(--red)';
    buyBtn.style.borderColor  = 'var(--border2)'; buyBtn.style.background = 'transparent'; buyBtn.style.color = 'var(--text3)';
  }
  calcRisk();
}

// ── PIP/POINT VALUE BY INSTRUMENT ────────────────────────────────────────────
function getPipValue(instr) {
  const metals   = ['XAUUSD','XAGUSD','XPTUSD','XCUUSD'];
  const crypto   = ['BTCUSD','ETHUSD','SOLUSD','XRPUSD','BNBUSD'];
  const indices  = ['US30','SPX500','NAS100','UK100','GER40','JPN225','AUS200'];
  const energy   = ['WTIUSD','BRTUSD','NATGAS'];
  if (metals.includes(instr))  return { pv:1.0,  label:'$1/pt',   unit:'pts',  decimals:2 };
  if (crypto.includes(instr))  return { pv:1.0,  label:'$1/pt',   unit:'pts',  decimals:2 };
  if (indices.includes(instr)) return { pv:1.0,  label:'$1/pt',   unit:'pts',  decimals:1 };
  if (energy.includes(instr))  return { pv:10.0, label:'$10/pt',  unit:'pts',  decimals:3 };
  // Forex — pip = 0.0001 for most, 0.01 for JPY pairs
  const isJPY = instr.includes('JPY');
  return isJPY
    ? { pv:1000.0, label:'$10/pip (JPY)', unit:'pips', decimals:3 }
    : { pv:10.0,   label:'$10/pip',       unit:'pips', decimals:5 };
}

// ── MARGIN CALCULATION ────────────────────────────────────────────────────────
function getMarginRequired(instr, lots, entry, leverage) {
  if (!entry || !lots || !leverage) return null;
  const metals  = ['XAUUSD','XAGUSD','XPTUSD'];
  const crypto  = ['BTCUSD','ETHUSD','SOLUSD'];
  const indices = ['US30','SPX500','NAS100','UK100','GER40'];
  let contractSize = 100000; // forex default
  if (metals.includes(instr))  contractSize = 100;    // 1 lot gold = 100 oz
  if (crypto.includes(instr))  contractSize = 1;      // 1 lot BTC = 1 BTC
  if (indices.includes(instr)) contractSize = 1;      // 1 lot index = $1/pt
  const notional = lots * contractSize * entry;
  return notional / leverage;
}

// ── AUTO-FILL LIVE PRICE ──────────────────────────────────────────────────────
function autoFillLivePrice() {
  const instr = document.getElementById('calc-instrument')?.value;
  if (!instr) return;
  const liveP = livePriceCache?.[instr];
  if (liveP) {
    document.getElementById('calc-entry').value = parseFloat(liveP).toFixed(getPipValue(instr).decimals);
    document.getElementById('calc-live-badge').textContent = '● LIVE';
    calcRisk();
  } else {
    document.getElementById('calc-live-badge').textContent = '';
  }
}

// ── SANITY CHECKS ─────────────────────────────────────────────────────────────
function runSanityChecks(bal, riskPct, riskAmt, lots, leverage, rr, instr, marginReq) {
  const warnings = [];
  const dangers  = [];

  if (riskPct > 5)  dangers.push(`You are risking <strong>${riskPct}%</strong> of your account on one trade. Professional traders rarely exceed 1-2%. This is reckless.`);
  else if (riskPct > 2) warnings.push(`Risk at ${riskPct}% is aggressive. Consider reducing to 1-2%.`);

  if (leverage >= 500) dangers.push(`Leverage of 1:${leverage} is extreme. A 0.2% move against you wipes your margin. This is gambling, not trading.`);
  else if (leverage >= 200) warnings.push(`Leverage 1:${leverage} is very high. Ensure your stop loss is tight and your broker has negative balance protection.`);
  else if (leverage >= 100) warnings.push(`ℹ️ Leverage 1:${leverage}. Sensible for experienced traders — keep stops tight.`);

  if (rr > 0 && rr < 1) dangers.push(`Risk:Reward of 1:${rr.toFixed(2)} means you risk more than you could gain. You need a win rate above ${Math.round(100/(1+rr))}% just to break even. Take this trade only with strong conviction.`);
  else if (rr > 0 && rr < 1.5) warnings.push(`R:R of 1:${rr.toFixed(2)} is below ideal. Aim for 1:2 minimum.`);

  if (marginReq && bal > 0 && marginReq > bal * 0.3) dangers.push(`This trade uses <strong>${((marginReq/bal)*100).toFixed(0)}%</strong> of your account as margin. You will have almost no buffer against adverse moves.`);

  if (lots >= 10) warnings.push(`Large position size (${lots} lots). Double-check your broker's minimum margin requirements.`);

  const crypto = ['BTCUSD','ETHUSD','SOLUSD'];
  if (crypto.includes(instr) && leverage > 10) warnings.push(`Crypto with leverage ${leverage}:1 is highly volatile. Crypto can move 5 to 10% in minutes. Keep lots small.`);

  return { warnings, dangers };
}

// ── MAIN CALC FUNCTION ───────────────────────────────────────────────────────
function calcRisk() {
  const bal      = parseFloat(document.getElementById('calc-balance')?.value) || 0;
  const riskPct  = parseFloat(document.getElementById('calc-risk')?.value)    || 1;
  const entry    = parseFloat(document.getElementById('calc-entry')?.value)   || 0;
  const sl       = parseFloat(document.getElementById('calc-sl')?.value)      || 0;
  const tp       = parseFloat(document.getElementById('calc-tp')?.value)      || 0;
  const instr    = document.getElementById('calc-instrument')?.value || 'XAUUSD';
  const leverage = parseFloat(document.getElementById('calc-leverage')?.value) || 100;

  const riskAmt  = bal * riskPct / 100;
  const riskEl   = document.getElementById('calc-risk-usd');
  if (riskEl) riskEl.textContent = bal ? '$' + riskAmt.toFixed(2) : '$0';

  // Keep scan balance in sync
  const balInput = document.getElementById('balance-input');
  if (balInput && bal && !balInput.value) balInput.value = bal;

  if (!entry || !sl) {
    ['calc-lot-result','calc-margin-req','calc-rr-ratio','calc-max-loss',
     'calc-sl-dist','calc-tp-dist','calc-pipval'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
    const strip = document.getElementById('calc-sanity-strip');
    if (strip) strip.style.display = 'none';
    return;
  }

  const { pv, label, unit, decimals } = getPipValue(instr);
  const slDist = Math.abs(entry - sl);
  const tpDist = tp ? Math.abs(tp - entry) : 0;
  const rr     = tpDist && slDist ? tpDist / slDist : 0;

  // Lot size from risk amount and SL distance
  const raw = riskAmt / (slDist * pv);
  const lots = Math.max(0.01, Math.floor(raw * 100) / 100);

  const marginReq = getMarginRequired(instr, lots, entry, leverage);
  const maxLoss   = lots * slDist * pv;

  // Update results
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('calc-lot-result', lots.toFixed(2));
  set('calc-margin-req', marginReq ? '$' + marginReq.toFixed(0) : '—');
  set('calc-rr-ratio',   rr ? '1:' + rr.toFixed(1) : '—');
  set('calc-max-loss',   '$' + maxLoss.toFixed(2));
  set('calc-sl-dist',    slDist.toFixed(decimals > 3 ? 1 : decimals) + ' ' + unit);
  set('calc-tp-dist',    tpDist ? tpDist.toFixed(decimals > 3 ? 1 : decimals) + ' ' + unit : '—');
  set('calc-pipval',     label);

  // Sanity checks
  const { warnings, dangers } = runSanityChecks(bal, riskPct, riskAmt, lots, leverage, rr, instr, marginReq);
  const strip = document.getElementById('calc-sanity-strip');
  if (strip) {
    if (warnings.length || dangers.length) {
      strip.style.display = 'block';
      strip.innerHTML = [
        ...dangers.map(d => `<div style="background:var(--red-dim);border:1px solid var(--red);border-radius:8px;padding:9px 12px;margin-bottom:6px;font-size:12px;color:var(--text2);line-height:1.55;">${d}</div>`),
        ...warnings.map(w => `<div style="background:var(--gold-dim);border:1px solid var(--gold);border-radius:8px;padding:9px 12px;margin-bottom:6px;font-size:12px;color:var(--text2);line-height:1.55;">${w}</div>`)
      ].join('');
    } else {
      strip.style.display = 'none';
    }
  }

  // ── Drawdown Protection Tiers ────────────────────────────────────────────────
  // Read peak balance from localStorage (updated when user changes balance input)
  // and current balance from the calc input, then render tier strip
  const ddStrip = document.getElementById('calc-drawdown-strip');
  if (ddStrip && bal > 0) {
    const storedPeak = parseFloat(localStorage.getItem('wm_balance_peak') || '0');
    // If current balance is higher than stored peak, update the peak
    if (bal > storedPeak) {
      localStorage.setItem('wm_balance_peak', String(bal));
    }
    const peak = Math.max(bal, storedPeak);
    const html = renderDrawdownTierStrip(peak, bal);
    if (html) {
      ddStrip.style.display = 'block';
      ddStrip.innerHTML = html;
    } else {
      ddStrip.style.display = 'none';
    }
  }
}

// Legacy alias so any remaining updateRisk() calls still work
function calcLot() { calcRisk(); }

// ── AI TRADE INTENTION ANALYSIS ───────────────────────────────────────────────
async function runTradeIntentionAnalysis() {
  const bal      = parseFloat(document.getElementById('calc-balance')?.value)  || 0;
  const riskPct  = parseFloat(document.getElementById('calc-risk')?.value)     || 1;
  const entry    = parseFloat(document.getElementById('calc-entry')?.value)    || 0;
  const sl       = parseFloat(document.getElementById('calc-sl')?.value)       || 0;
  const tp       = parseFloat(document.getElementById('calc-tp')?.value)       || 0;
  const instr    = document.getElementById('calc-instrument')?.value || 'XAUUSD';
  const leverage = parseFloat(document.getElementById('calc-leverage')?.value) || 100;
  const dir      = calcDirection;
  const lots     = parseFloat(document.getElementById('calc-lot-result')?.textContent) || 0;

  if (!bal || !entry || !sl) { toast('Fill in balance, entry and stop loss first'); return; }
  // Screenshot analysis available to all users

  const resultEl = document.getElementById('calc-ai-result');
  const btn      = document.getElementById('calc-ai-btn');
  resultEl.innerHTML = '<div class="card"><div class="pulse" style="font-family:var(--font-mono);font-size:11px;color:var(--text3);">Analysing trade intention...</div></div>';
  btn.disabled = true;

  const riskAmt = bal * riskPct / 100;
  const { pv }  = getPipValue(instr);
  const slDist  = Math.abs(entry - sl);
  const tpDist  = tp ? Math.abs(tp - entry) : 0;
  const rr      = tpDist && slDist ? (tpDist/slDist).toFixed(2) : 'not set';
  const maxLoss = (lots * slDist * pv).toFixed(2);
  const liveP   = livePriceCache?.[instr];

  const prompt = `You are an elite trading risk manager and coach. A trader is about to place the following trade. Give an honest, direct, professional assessment.

TRADE INTENTION:
Instrument: ${instr}
Direction: ${dir}
Leverage: 1:${leverage}
Account Balance: $${bal}
Risk per trade: ${riskPct}% ($${riskAmt.toFixed(2)})
Entry price: ${entry}
Stop loss: ${sl} (distance: ${slDist.toFixed(4)})
Take profit: ${tp || 'NOT SET'}
Risk:Reward: ${rr}
Calculated lot size: ${lots}
Max potential loss: $${maxLoss}
${liveP ? `Current live price: ${liveP}` : ''}
${trades.length ? `Trader's recent trades (last 5): ${JSON.stringify(trades.slice(0,5).map(t=>({pair:t.pair,dir:t.dir,pnl:t.pnl,lot:t.lot})))}` : ''}

Respond ONLY with this JSON structure:
{
  "verdict": "PROCEED" | "CAUTION" | "DO NOT TRADE",
  "verdictReason": "One sentence summary of your verdict",
  "technicalAssessment": "Is the entry logical? Is the SL placement sensible? Is the TP realistic? (2-3 sentences)",
  "riskAssessment": "Assessment of the risk parameters, leverage, and lot size relative to account (2-3 sentences)",
  "entryQuality": "Score 1-10 with brief reason",
  "suggestedAdjustments": ["Specific actionable adjustment 1", "Specific actionable adjustment 2"],
  "alternativeSetup": "If you see a better setup based on typical ${instr} structure, describe it briefly. Otherwise null.",
  "psychologyFlag": "Any psychology concern detected from their trade history or this setup? Otherwise null.",
  "finalWord": "One punchy sentence — the most important thing for this trader to know right now."
}`;

  try {
    const res = await fetch(WORKER_URL + '/behaviour', {
      method: 'POST', headers: workerHeaders(),
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    const r    = extractJSON(text);
    if (!r) throw new Error('Could not parse AI response');

    const vColor = r.verdict === 'PROCEED' ? 'var(--green)' : r.verdict === 'CAUTION' ? 'var(--gold)' : 'var(--red)';
    const vBg    = r.verdict === 'PROCEED' ? 'var(--green-dim)' : r.verdict === 'CAUTION' ? 'var(--gold-dim)' : 'var(--red-dim)';

    resultEl.innerHTML = `<div class="card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;padding:12px;background:${vBg};border-radius:10px;border:1px solid ${vColor};">
        <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:${vColor};">${r.verdict}</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.5;">${r.verdictReason||''}</div>
      </div>
      ${r.technicalAssessment ? `<div style="margin-bottom:10px;"><div class="card-label" style="color:var(--blue);">TECHNICAL</div><div style="font-size:12px;color:var(--text2);line-height:1.6;">${r.technicalAssessment}</div></div>` : ''}
      ${r.riskAssessment ? `<div style="margin-bottom:10px;"><div class="card-label" style="color:var(--red);">RISK</div><div style="font-size:12px;color:var(--text2);line-height:1.6;">${r.riskAssessment}</div></div>` : ''}
      ${r.entryQuality ? `<div style="margin-bottom:10px;background:var(--bg2);border-radius:6px;padding:8px 12px;display:flex;align-items:center;gap:10px;"><span style="font-family:var(--font-mono);font-size:9px;color:var(--text3);">ENTRY QUALITY</span><span style="font-family:var(--font-display);font-size:18px;font-weight:800;color:var(--gold);">${r.entryQuality}</span><span style="font-size:11px;color:var(--text3);">/10</span></div>` : ''}
      ${r.suggestedAdjustments?.length ? `<div style="margin-bottom:10px;"><div class="card-label" style="color:var(--gold);">ADJUSTMENTS</div>${r.suggestedAdjustments.map(a=>`<div style="font-size:12px;color:var(--text2);line-height:1.6;padding:3px 0;">· ${a}</div>`).join('')}</div>` : ''}
      ${r.alternativeSetup ? `<div style="margin-bottom:10px;background:var(--blue-dim);border-radius:6px;padding:10px;"><div class="card-label" style="color:var(--blue);">ALTERNATIVE SETUP</div><div style="font-size:12px;color:var(--text2);line-height:1.6;">${r.alternativeSetup}</div></div>` : ''}
      ${r.psychologyFlag ? `<div style="margin-bottom:10px;background:var(--purple-dim);border-radius:6px;padding:10px;"><div class="card-label" style="color:var(--purple);">PSYCHOLOGY</div><div style="font-size:12px;color:var(--text2);line-height:1.6;">${r.psychologyFlag}</div></div>` : ''}
      ${r.finalWord ? `<div style="background:var(--bg2);border-radius:8px;padding:12px;border-left:3px solid ${vColor};"><div style="font-size:13px;color:var(--text);line-height:1.6;font-style:italic;">"${r.finalWord}"</div></div>` : ''}
    </div>`;
  } catch(e) {
    resultEl.innerHTML = `<div style="color:var(--red);font-size:12px;padding:8px;">Analysis failed: ${e.message}</div>`;
  } finally {
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════════
// TRADE REVIEW
// ═══════════════════════════════════════════
async function reviewTrade(id) {
  const trade = trades.find(t => t.id === id);
  if (!trade) return;
  const el = document.getElementById('review-' + id);
  if (!el) return;
  if (el.style.display === 'block') { el.style.display = 'none'; return; }

  el.style.display = 'block';
  el.innerHTML = '<div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);padding:10px 0;" class="pulse">Reviewing trade...</div>';

  // Build context from all trades for pattern detection
  const recentLosses = trades.filter(t => t.pnl < 0).slice(0, 5);
  const recentWins   = trades.filter(t => t.pnl > 0).slice(0, 5);
  const totalPnl     = trades.reduce((s,t) => s+t.pnl, 0);

  const reviewPrompt = `Review this trade and the trader's overall pattern:

TRADE BEING REVIEWED:
Pair: ${trade.pair} | Direction: ${trade.dir} | Lot: ${trade.lot}
Entry: ${trade.entry} | Exit: ${trade.exit} | P&L: ${trade.pnl >= 0 ? '+' : ''}$${trade.pnl}
Timeframe: ${trade.tf} | Date: ${trade.date}
Notes: "${trade.notes || 'none'}"

RECENT CONTEXT (last 5 losses): ${JSON.stringify(recentLosses.map(t=>({pair:t.pair,dir:t.dir,pnl:t.pnl,notes:t.notes})))}
RECENT WINS: ${JSON.stringify(recentWins.map(t=>({pair:t.pair,dir:t.dir,pnl:t.pnl})))}
Overall P&L: $${totalPnl.toFixed(2)} across ${trades.length} trades.

Respond ONLY with raw JSON:
{"score":75,"grade":"B","technicalAssessment":"2-3 sentences on the technical quality of this trade","psychologyAssessment":"2-3 sentences on the psychology/behaviour shown","patterns":"Any concerning patterns you see across recent trades","improvement":"The single most important thing this trader should focus on","strengths":"What they did well"}`;

  try {
    const res = await fetch(WORKER_URL + '/review', {
      method:'POST',
      headers: workerHeaders(),
      body:JSON.stringify({ prompt: reviewPrompt })
    });
    const data = await res.json();
    const text = data.content?.find(b=>b.type==='text')?.text || '';
    const review = extractJSON(text);
    if (!review) throw new Error('Could not parse review');

    const gradeColor = review.score >= 70 ? 'var(--green)' : review.score >= 50 ? 'var(--gold)' : 'var(--red)';
    el.innerHTML = `<div class="review-card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div class="review-score" style="background:${gradeColor}22;border:2px solid ${gradeColor};color:${gradeColor};">${review.grade || '?'}</div>
        <div>
          <div style="font-family:var(--font-display);font-size:16px;font-weight:800;color:${gradeColor};">Score: ${review.score}/100</div>
          <div style="font-family:var(--font-mono);font-size:9px;color:var(--text3);letter-spacing:1px;">TRADE REVIEW</div>
        </div>
      </div>
      ${review.technicalAssessment ? `<div style="margin-bottom:10px;"><div style="font-family:var(--font-mono);font-size:8px;color:var(--blue);letter-spacing:1px;margin-bottom:4px;">TECHNICAL</div><div style="font-size:12px;color:var(--text2);line-height:1.55;">${review.technicalAssessment}</div></div>` : ''}
      ${review.psychologyAssessment ? `<div style="margin-bottom:10px;"><div style="font-family:var(--font-mono);font-size:8px;color:var(--purple);letter-spacing:1px;margin-bottom:4px;">PSYCHOLOGY</div><div style="font-size:12px;color:var(--text2);line-height:1.55;">${review.psychologyAssessment}</div></div>` : ''}
      ${review.patterns ? `<div style="margin-bottom:10px;background:var(--red-dim);border-radius:6px;padding:10px;"><div style="font-family:var(--font-mono);font-size:8px;color:var(--red);letter-spacing:1px;margin-bottom:4px;">PATTERN DETECTED</div><div style="font-size:12px;color:var(--text2);line-height:1.55;">${review.patterns}</div></div>` : ''}
      ${review.strengths ? `<div style="margin-bottom:10px;background:var(--green-dim);border-radius:6px;padding:10px;"><div style="font-family:var(--font-mono);font-size:8px;color:var(--green);letter-spacing:1px;margin-bottom:4px;">STRENGTHS</div><div style="font-size:12px;color:var(--text2);line-height:1.55;">${review.strengths}</div></div>` : ''}
      ${review.improvement ? `<div style="background:var(--gold-dim);border-radius:6px;padding:10px;"><div style="font-family:var(--font-mono);font-size:8px;color:var(--gold);letter-spacing:1px;margin-bottom:4px;">FOCUS ON THIS</div><div style="font-size:12px;color:var(--text2);line-height:1.55;">${review.improvement}</div></div>` : ''}
    </div>`;
  } catch(e) {
    el.innerHTML = `<div style="font-size:11px;color:var(--red);padding:8px 0;">Review failed: ${e.message}</div>`;
  }
}

// ═══════════════════════════════════════════
// BEHAVIOUR ENGINE — STAGE 10
// Central log, score, nudge, weekly report
// ═══════════════════════════════════════════

var _lastNudgeTime = 0;

var BEH_DEDUCTIONS = {
  REVENGE_TRADE:  10,
  FOMO_ENTRY:     7,
  EARLY_EXIT:     5,
  STOP_WIDENING:  6,
  OVERTRADE:      4,
  TILT_PATTERN:   12
};

var BEH_NUDGE_LABELS = {
  REVENGE_TRADE: 'Revenge trade detected',
  FOMO_ENTRY:    'FOMO entry detected',
  EARLY_EXIT:    'Early exit detected',
  STOP_WIDENING: 'Stop widening detected',
  OVERTRADE:     'Overtrade detected',
  TILT_PATTERN:  'Tilt pattern detected'
};

// ── Central entry point for all behaviour events ──────────────────────────────
function logBehaviourEvent(type, instrument, tradeId) {
  var log = JSON.parse(localStorage.getItem('wm_behaviour_log') || '[]');
  log.unshift({ type: type, timestamp: Date.now(), instrument: instrument || null, sessionId: null, tradeId: tradeId || null });
  if (log.length > 200) log = log.slice(0, 200);
  localStorage.setItem('wm_behaviour_log', JSON.stringify(log));
  if (typeof acadRenderFlags === 'function') acadRenderFlags();
  showNudge(type);
}

// ── Behaviour score with trend ─────────────────────────────────────────────────
function calcBehaviourScore(daysBack) {
  daysBack = daysBack || 7;
  var now      = Date.now();
  var cutoff   = now - daysBack * 86400000;
  var prevCut  = cutoff - daysBack * 86400000;
  var log      = JSON.parse(localStorage.getItem('wm_behaviour_log') || '[]');

  var thisPeriod = log.filter(function(e) { return e.timestamp >= cutoff; });
  var prevPeriod = log.filter(function(e) { return e.timestamp >= prevCut && e.timestamp < cutoff; });

  function scoreFrom(events) {
    var d = 0;
    events.forEach(function(e) { d += (BEH_DEDUCTIONS[e.type] || 0); });
    return Math.max(0, 100 - d);
  }

  var thisScore = scoreFrom(thisPeriod);
  var prevScore = scoreFrom(prevPeriod);
  var diff      = thisScore - prevScore;
  var trend     = diff > 5 ? 'UP' : diff < -5 ? 'DOWN' : 'STABLE';

  var counts = {};
  thisPeriod.forEach(function(e) { counts[e.type] = (counts[e.type] || 0) + 1; });
  var topFlag = null, topCount = 0;
  Object.keys(counts).forEach(function(k) {
    if (counts[k] > topCount) { topCount = counts[k]; topFlag = k; }
  });

  var label = thisScore >= 80 ? 'Excellent' : thisScore >= 60 ? 'Good' : thisScore >= 40 ? 'Fair' : 'Needs Work';
  return { score: thisScore, label: label, trend: trend, topFlag: topFlag };
}

// ── In-app nudge notification bar ─────────────────────────────────────────────
function showNudge(type) {
  if (Date.now() - _lastNudgeTime < 5 * 60 * 1000) return;
  _lastNudgeTime = Date.now();

  var label = BEH_NUDGE_LABELS[type] || type.replace(/_/g, ' ').toLowerCase();

  var existing = document.getElementById('behaviour-nudge');
  if (existing) { clearTimeout(existing._dismissTimer); existing.remove(); }

  var bar = document.createElement('div');
  bar.id = 'behaviour-nudge';
  bar.innerHTML =
    '<span class="beh-nudge-flag">' + label + '</span>' +
    '<button class="beh-nudge-link" onclick="navigate(\'academy\', null); closeBehNudge();">View in Academy</button>' +
    '<button class="beh-nudge-dismiss" onclick="closeBehNudge()">&#x2715;</button>';
  document.body.appendChild(bar);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() { bar.classList.add('beh-nudge-visible'); });
  });

  bar._dismissTimer = setTimeout(closeBehNudge, 8000);
}

function closeBehNudge() {
  var bar = document.getElementById('behaviour-nudge');
  if (!bar) return;
  clearTimeout(bar._dismissTimer);
  bar.classList.remove('beh-nudge-visible');
  setTimeout(function() { if (bar && bar.parentNode) bar.remove(); }, 350);
}

// ── Weekly behaviour report ────────────────────────────────────────────────────
function _behISOWeek(date) {
  var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  var day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  var yr = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return { week: Math.ceil((((d - yr) / 86400000) + 1) / 7), year: d.getUTCFullYear() };
}

function checkWeeklyReport() {
  var today = new Date();
  if (today.getDay() !== 1) return; // Monday only

  var lastShown = parseInt(localStorage.getItem('wm_last_weekly_report') || '0');
  if (lastShown && (Date.now() - lastShown) < 7 * 24 * 60 * 60 * 1000) return;

  var log    = JSON.parse(localStorage.getItem('wm_behaviour_log') || '[]');
  var simT   = JSON.parse(localStorage.getItem('wm_sim_trades')    || '[]');
  var journl = JSON.parse(localStorage.getItem('wm_trade_journal') || '[]');
  if (!log.length && !simT.length && !journl.length) return;

  showWeeklyReport();
}

async function showWeeklyReport() {
  var modal = document.getElementById('weekly-report-modal');
  if (!modal) return;

  var now     = Date.now();
  var cut7    = now - 7  * 86400000;
  var cut14   = now - 14 * 86400000;
  var log     = JSON.parse(localStorage.getItem('wm_behaviour_log') || '[]');

  function scoreFrom(events) {
    var d = 0;
    events.forEach(function(e) { d += (BEH_DEDUCTIONS[e.type] || 0); });
    return Math.max(0, 100 - d);
  }

  var thisPeriod = log.filter(function(e) { return e.timestamp >= cut7; });
  var prevPeriod = log.filter(function(e) { return e.timestamp >= cut14 && e.timestamp < cut7; });
  var thisScore  = scoreFrom(thisPeriod);
  var prevScore  = scoreFrom(prevPeriod);
  var diff       = thisScore - prevScore;
  var trend      = diff > 5 ? 'UP' : diff < -5 ? 'DOWN' : 'STABLE';

  var counts = {};
  thisPeriod.forEach(function(e) { counts[e.type] = (counts[e.type] || 0) + 1; });
  var sortedFlags = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; });
  var top1 = sortedFlags[0] || null;
  var top2 = sortedFlags[1] || null;

  var currentStage = parseInt(localStorage.getItem('wm_academy_stage') || '1');
  var passedCount  = 0;
  for (var i = 1; i <= 8; i++) {
    if (localStorage.getItem('wm_stage_' + i + '_status') === 'passed') passedCount++;
  }

  var trendArrow = trend === 'UP' ? '&#9650;' : trend === 'DOWN' ? '&#9660;' : '&#9654;';
  var trendColor = trend === 'UP' ? 'var(--green)' : trend === 'DOWN' ? 'var(--red)' : 'var(--text3)';
  var scoreColor = thisScore >= 70 ? 'var(--green)' : thisScore >= 40 ? 'var(--gold)' : 'var(--red)';
  var label1     = top1 ? (BEH_NUDGE_LABELS[top1] || top1) : null;
  var label2     = top2 ? (BEH_NUDGE_LABELS[top2] || top2) : null;

  var wk       = _behISOWeek(new Date());
  var cacheKey = 'wm_weekly_coaching_' + wk.year + '_' + wk.week;
  var coaching = localStorage.getItem(cacheKey) || '';

  var bodyEl = document.getElementById('weekly-report-body');
  if (bodyEl) {
    bodyEl.innerHTML =
      '<div class="wr-score-row">' +
        '<div class="wr-score-block">' +
          '<div class="wr-score-label">THIS WEEK</div>' +
          '<div class="wr-score-num" style="color:' + scoreColor + ';">' + thisScore + '</div>' +
          '<div class="wr-score-sub">' + (thisScore >= 80 ? 'Excellent' : thisScore >= 60 ? 'Good' : thisScore >= 40 ? 'Fair' : 'Needs Work') + '</div>' +
        '</div>' +
        '<div class="wr-trend" style="color:' + trendColor + ';">' + trendArrow + '</div>' +
        '<div class="wr-score-block">' +
          '<div class="wr-score-label">LAST WEEK</div>' +
          '<div class="wr-score-num" style="color:var(--text3);">' + prevScore + '</div>' +
          '<div class="wr-score-sub">&nbsp;</div>' +
        '</div>' +
      '</div>' +
      '<div class="wr-flags-row">' +
        '<div class="wr-section-label">TOP FLAGS THIS WEEK</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
          (label1 ? '<span class="acad-flag-badge">' + label1 + '</span>' : '') +
          (label2 ? '<span class="acad-flag-badge">' + label2 + '</span>' : '') +
          (!label1 ? '<span class="acad-flag-none">No flags this week. Excellent discipline.</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="wr-coaching-row">' +
        '<div class="wr-section-label">COACHING</div>' +
        '<div id="wr-coaching-text" class="wr-coaching-text">' +
          (coaching ? coaching : '<span style="color:var(--text3);font-size:11px;" class="pulse">Loading your coaching note...</span>') +
        '</div>' +
      '</div>' +
      '<div class="wr-progress-row">' +
        '<div class="wr-section-label">ACADEMY PROGRESS</div>' +
        '<div class="wr-progress-text">Stage ' + currentStage + ' active. ' + passedCount + ' of 8 stages passed.</div>' +
      '</div>';
  }

  modal.style.display = 'flex';

  if (!coaching) {
    if (top1) {
      try {
        var coachPrompt = 'In one complete sentence of plain English with no hyphens, coach a trader whose top behaviour flags this week were ' + (top1 || 'none') + ' and ' + (top2 || 'none') + '. Be direct and specific. Do not mention AI.';
        var res  = await fetch(WORKER_URL + '/behaviour', {
          method: 'POST', headers: workerHeaders(),
          body: JSON.stringify({ prompt: coachPrompt, maxTokens: 80 })
        });
        var data = await res.json();
        var text = (data.content && data.content[0] && data.content[0].text) || '';
        text = text.replace(/^[\s"'`{]+|[\s"'`}]+$/g, '').trim();
        if (text) {
          localStorage.setItem(cacheKey, text);
          var coachEl = document.getElementById('wr-coaching-text');
          if (coachEl) coachEl.textContent = text;
        }
      } catch (_) {
        var coachEl = document.getElementById('wr-coaching-text');
        if (coachEl) coachEl.textContent = 'Review your flagged trades and identify what triggered each one before your next session.';
      }
    } else {
      var coachEl = document.getElementById('wr-coaching-text');
      if (coachEl) coachEl.textContent = 'Your trading discipline this week was excellent. Keep maintaining consistent process over outcomes.';
    }
  }
}

function closeWeeklyReport() {
  var modal = document.getElementById('weekly-report-modal');
  if (modal) modal.style.display = 'none';
  localStorage.setItem('wm_last_weekly_report', String(Date.now()));
}

// Expose showNudge on window so any module can call it
window.showNudge = showNudge;

// Trigger weekly report check on page load
setTimeout(checkWeeklyReport, 800);

