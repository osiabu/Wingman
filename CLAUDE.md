# Claude Code Project Rules
- **Memory Management**: This project uses a "Clean Slate" rotation. Do not rely on session history for context.
- **Source of Truth**: Always read `changes.txt` at the start of a session to understand the current task status and recent modifications.
- **Handover Protocol**: Before ending a session or when requested to "checkpoint," update `changes.txt` with:
    1. **Status**: A 1-sentence summary of the current goal.
    2. **Files Touched**: A list of paths modified in the last 30 minutes.
    3. **The "Next Step" Prompt**: A specific instruction for the next account/session to pick up exactly where we left off.
- **Token Efficiency**: Be concise. Avoid re-reading files that are not listed in the "Files Touched" section of `changes.txt` unless strictly necessary.




# WINGMAN — CLAUDE CODE PROJECT RULES
# Read this file automatically at the start of every session.
# These rules apply to every prompt in every session without exception.

---

## MODEL SELECTION GUIDE

Switch models manually using `--model` flag when starting Claude Code.

| Model | Flag | Use for |
|---|---|---|
| claude-opus-4-7 | `--model claude-opus-4-7` | Architecture decisions, complex multi-file refactors, Lumen prompt engineering, Academy grading logic, any task where correctness matters more than speed |
| claude-sonnet-4-6 | `--model claude-sonnet-4-6` | Most coding tasks. Feature implementation, JS modules, chart components, UI panels, API integrations. Default for 80% of sessions. Also the Lumen Intraday decision model. |
| claude-haiku-4-5-20251001 | `--model claude-haiku-4-5-20251001` | Academy lesson content formatting, repetitive HTML templating, simple CSS fixes, icon substitution passes, single-function bug fixes, any task under 200 lines of output. Also the Lumen Scalper decision model. |

---

## GLOBAL RULES — APPLY TO EVERY FILE AND EVERY PROMPT

### Language and Copy
- No hyphens in any user-facing text, log messages, academy content, engine output, or UI labels. Use commas, colons, semicolons, em dashes (—) and full stops instead.
- No mention of "AI", "artificial intelligence", "Claude", "language model", or any reference to the underlying technology in the UI, logs, academy content, or engine output.
- The intelligence engine is named **LUMEN** throughout all user-facing strings. Function names in code retain their original names for stability.
- No emojis anywhere in the application. Replace every emoji with an SVG icon from the Wingman icon set. If an icon does not yet exist, use a plain text label or a geometric character (bullet, arrow) until the icon is available.
- All text must use complete grammatical sentences. No sentence fragments in UI labels.

### Logos
- Desktop logo: `wingmanlogo.png` (~2MB, high quality)
- Mobile logo and favicon: `wingmanlogo1.png` (~200KB)
- Update all logo `img src` tags accordingly.

### Design Tokens — Preserve Exactly
```css
--gold: #F0B429        /* Primary accent, active states, highlights */
--green: #00E87A       /* Positive, buy, profit, pass */
--red: #FF3D5A         /* Negative, sell, loss, fail */
--teal: #00C9B1        /* Secondary accent, live indicators, Lumen */
--purple: #A855F7      /* Scalp engine, tertiary accent */
--blue: #00C8FF        /* Information, data labels */
--bg: #060608          /* Page background */
--bg1: #0C0C10         /* Primary surface */
--bg2: #111116         /* Secondary surface */
--bg3: #17171E         /* Tertiary surface */
--bg4: #1C1C25         /* Elevated surface */
--border: #1E1E28
--border2: #252530
--text: #FFFFFF
--text2: #CFCFE8
--text3: #A0A0B8
--text4: #6B6B85
--font-display: 'Inter'
--font-mono: 'JetBrains Mono'
```

### Architecture
- Target architecture is modular files, not a single monolithic HTML file.
- All new code goes into the correct module file.
- No logic goes into `index.html` directly except the shell and imports.

### Token Efficiency
- Every prompt includes only the specific file(s) being edited.
- Never attach the full project to a prompt unless the task explicitly requires cross-file reading.

---

## FILE STRUCTURE

```
wingman/
  index.html              Shell only, ~150 lines
  vercel.json             Unchanged
  package.json            Add vite as dev dependency
  CLAUDE.md               This file
  changes.txt             Session handover (read at session start)
  wingmanlogo.png         Legacy chrome eagle logo, retained for compatibility
  wingmanlogo1.png        Legacy mobile chrome eagle logo
  wingmanfavicon.png      Legacy favicon

  api/
    intel.js              Dispatcher: routes /api/intel?source=fred|cot to the
                          underlying handlers. Counts as one Vercel function.
    _fred.js              FRED proxy. Underscore prefixed files are not routed
                          by Vercel, so they consume zero function slots.
    _cot.js               CFTC COT proxy. Same underscore convention.
    _redis.js             Upstash Redis cache wrapper used by intel handlers.
    scan.js               Lumen Intraday master synthesis (Sonnet 4.6, Gemini fallback).
    behaviour.js          Lumen Scalper master synthesis and weekly pattern miner
                          (Haiku 4.5, Gemini fallback).
    sentiment.js          Sentiment poller: Grok 3 then Haiku then Gemini server side.
    prices.js             Open exchange rates and TwelveData fallback.
    candles.js            Twelve Data candles, Redis cached.
    news.js               Finnhub news proxy.
    analyse.js            Screenshot chart analysis.
    claude.js             Generic Claude proxy.
    gemini.js             Generic Gemini proxy.

  img/
    wingman-mark.svg          Two stroke mark, gold over teal.
    wingman-lockup.svg        Mark plus wordmark for the mobile topbar.
    wingman-mark-256.png      256x256 PNG export for apple-touch-icon (deferred).
    hero-atmosphere.png       Home tab background photograph.
    og-card.png               OG meta image, 1200x630.
    onboarding-welcome.png    Stage 13 onboarding background (deferred).
    login-backdrop.png        Pre auth backdrop (deferred).
    mobile-splash.png         Mobile splash background.

  css/
    tokens.css            Design tokens (:root vars)
    base.css              Reset, typography, scrollbar
    layout.css            Sidebar, main-content, panels
    components.css        Cards, badges, buttons, chips
    academy.css           Academy-specific styles
    autotrader.css        Autotrader and scalp styles
    chart.css             Chart container styles
    home.css              Home command centre styles
    animations.css        Keyframes, transitions
    responsive.css        All @media breakpoints

  html/
    tab-home.html
    tab-academy.html
    tab-simtrader.html
    tab-autotrader.html
    tab-markets.html         Includes Live, Scan, Calendar, Sentiment, Session,
                             Flow, News, Real Yields, and Correlations sub tabs.
    tab-settings.html
    tab-legal.html

  js/
    core.js               navigate(), toast(), init()
    prices.js             WebSocket connections, livePriceCache, ticker. Persists
                          last known prices to localStorage so closed markets
                          show the last working day's quote on weekends and bank
                          holidays instead of a hyphen.
    chart.js              Lightweight Charts component
    home.js               home_ functions, intelligence snapshot grid
    academy.js            Stage logic, grading calls
    simtrader.js          Sim order entry, positions
    lumen.js              Lumen engine (Intraday and Scalper). Master synthesis
                          prompts, journal context capture, scalpMonitorPositions
                          auto close path, weekly pattern miner.
    markets.js            Scan, sentiment, COT, news, Real Yields renderer,
                          Correlation Heatmap renderer.
    behaviour.js          Detectors, score engine
    settings.js           Settings, preferences
    utils.js              Shared helpers, formatters, lumenIndicators
    intel-yields.js       FRED real yields wrapper. localStorage 24h.
    intel-cot.js          CFTC COT wrapper. localStorage 7d. Exposes
                          legacyCacheRow(asset) for the Markets tab renderer.
    intel-wyckoff.js      Wyckoff phase classifier. Sonnet 4.6 keyed by H4 bar
                          timestamp. Cached against the latest H4 close so the
                          LLM only fires on a new H4 bar.
    intel-regime.js       Pure browser ADX, ATR percentile, Bollinger compression.
                          Combined with cached Wyckoff to produce a regime label.
    intel-correlations.js Pearson correlation matrix across the Tier 1+2+3
                          universe. Detects breakdowns between halves of the
                          return series. localStorage 4h.
    intel-liquidity.js    Pure browser liquidity zone detector across H1, H4, D1.
                          localStorage 1h.
    intel-calendar.js     TradingView free CORS calendar. Adds pre_event_caution
                          and post_event_opportunity flags. localStorage 15m.
    intel-sessions.js     Active sessions and confidence multiplier (Asian 0.5,
                          London Open 1.2, NY Open 1.4, NY Close 0.7, standard 1.0).
                          No cache, no LLM cost.
    intel-portfolio.js    Reads atPositions, scalpPositions and open simTrades.
                          Total risk percent, directional count, correlated
                          cluster detection.
```

---

## LUMEN ENGINE — FRAMING AND LOG FORMAT

Lumen is Wingman's market intelligence engine. It is described as an intelligence engine, never as AI.

**Correct UI framing:**
- "Lumen is observing the market."
- "Lumen logged a signal on BTCUSD."
- "Lumen Intelligence Engine: active."
- "Lumen has detected a scalp opportunity on XAUUSD."
- "No qualifying conditions detected by Lumen for this instrument."

**Log format rules:** Plain sentences, maximum 120 characters per entry, no multi-line entries, no hyphens, no emojis, no exclamation marks, no ellipsis decoration, no arrows. Use plain colons, commas, and full stops only.

**Log format examples:**
```
Lumen scan: BTCUSD | BUY | Confidence 78 | EMA alignment bullish
Lumen: XAUUSD skip. RSI divergence not confirmed on 5M.
Lumen opened EURUSD SELL 0.02L at 1.08450. SL 1.08520 TP 1.08310.
Lumen closed BTCUSD BUY at 67,420. Result: plus 2.1R.
```

**API model for Lumen calls:**
- Scalper: `claude-haiku-4-5-20251001` via `/api/behaviour` (Vercel route, server fallback to Gemini 2.5 Flash)
- Intraday: `claude-sonnet-4-6` via `/api/scan` (Vercel route, server fallback to Gemini 2.5 Flash)
- Sentiment: routed through `/api/sentiment` which fans out Grok 3 → Claude Haiku → Gemini server side
- Big picture market intelligence (Markets tab `/api/scan` default): `claude-opus-4-7`

---

## LUMEN ARCHITECTURE

Lumen runs two engines from one tab: Intraday (thirty minute scans) and Scalper (sixty second scans). Both lean on Vercel API routes that wrap Claude with a server side Gemini 2.5 Flash fallback, so the engines stay alive even when one provider is down.

**Routing:**
- Intraday decisions: `POST /api/scan` with body `{ model: "claude-sonnet-4-6", system, messages }`. Server falls back to Gemini 2.5 Flash on a Claude failure.
- Intraday instrument selection: same `/api/scan` route, same Sonnet model. Picks three instruments per UTC day. Cached in `atTodayInstruments` keyed by `atSelectionDay`.
- Scalper decisions: `POST /api/behaviour` (Claude Haiku 4.5 then Gemini 2.5 Flash).
- Sentiment poller: `POST /api/sentiment` (Grok 3 then Claude Haiku 4.5 then Gemini 2.5 Flash). Runs every five minutes while either engine is active. State lives in `wm_context.sentiment`.

**Daily budget tracker** (`lumBudget` in `js/lumen.js`):
- Caps calls per layer per UTC day to protect against runaway spend. Server endpoints already handle model fallback so this is a budget cap, not a throttle.
- Limits: intraday 200, scalper 1500, sentiment 300, select 30. Reset at the next UTC date roll over.
- Persisted in localStorage keys `wm_lum_budget` and `wm_lum_budget_day`.

**Instrument universe (Intraday):**
- Weekday full universe: `BTCUSD, ETHUSD, SOLUSD, XAUUSD, XAGUSD, EURUSD, GBPUSD, USDJPY, GBPJPY, SPX500, NAS100, US30, USOIL`.
- Weekend (Saturday or Sunday UTC): filtered to crypto only since forex, metals, indices, and commodities markets are closed.
- Sonnet picks the day's three from the universe based on sentiment, news, and weekend flag. Falls back to a default trio when the call fails.

**Weekend mode (Scalper):**
- Confidence threshold rises from sixty five to seventy five for thinner liquidity.
- The user's selected instruments are filtered to crypto only. If no crypto is selected the engine logs a hint and skips the cycle.

**Confidence thresholds:**
- Intraday: seventy five and above. Picks the highest confidence cleared signal across the day's three instruments per cycle.
- Scalper weekday: sixty five and above. Weekend: seventy five and above.

**Schema (both engines, returned by the LLM as JSON):**
- `{ action: "BUY" | "SELL" | "SKIP", confidence: 0-100, lots: number, sl: number | null, tp: number | null, reason | entry_logic, key_risk, ... }`
- Scalper additionally returns `grade` (A, B, or C) and `skip_reason` when SKIP.

**Indicators:**
- `lumenIndicators(instrument)` in `js/utils.js` reuses the existing `fetchCandles` helper from `prices.js`. Crypto fetches go to Binance REST, everything else to Vercel `/api/candles` with Upstash Redis cache.
- Computes RSI fourteen, EMA twenty, EMA fifty over the last sixty fifteen minute candles. Live current price is read from `livePriceCache` (Binance WebSocket for crypto, Deriv WebSocket for forex and metals, Vercel `/api/prices` for indices and commodities).

**Worker retired (April 2026):**
- The Cloudflare Worker at `worker/index.js` was duplicated by Vercel routes that also have Redis caching the Worker lacks.
- All Lumen calls now hit Vercel directly. The Worker is left in place but no client code calls it. Safe to delete after a deploy or two of stable operation.

---

## LUMEN SYSTEM PROMPT — SCALP MODE

```
You are Lumen, a market intelligence engine. Your role is to analyse
technical and contextual market data and return a trading signal.

You return only valid JSON. No prose. No explanation outside JSON.

Output format:
{
  "action": "BUY" or "SELL" or "SKIP",
  "confidence": integer 0 to 100,
  "lots": decimal (e.g. 0.02),
  "sl": decimal (stop loss price, null if skip),
  "tp": decimal (take profit price, null if skip),
  "grade": "A" or "B" or "C",
  "entry_logic": string under 80 characters,
  "key_risk": string under 60 characters,
  "instinct_reading": string under 80 characters,
  "tier2_signals": array of up to 3 short strings,
  "tier3_confirmations": array of up to 2 short strings,
  "skip_reason": string under 80 characters (only when action is SKIP)
}

Signal grading:
Grade A: All three tiers confirm. Session optimal. Spread normal.
Grade B: Two tiers confirm. Acceptable session. Minor concerns.
Grade C: One tier confirms. Enter only with tight risk.
Skip: Insufficient confirmation or risk outweighs opportunity.

Three-tier confirmation framework:
Tier 1 (structure): Trend direction, key S/R level, price position relative to EMA 50.
Tier 2 (momentum): RSI, MACD, Stochastic — at least two of three must confirm.
Tier 3 (context): Session quality score, Fear and Greed, spread, COT direction, recent news absence.

Risk rules:
SL must be at least 1 ATR from entry.
TP must give a minimum 1.5R to 1 ratio.
Never enter a position in the same direction as an existing open position on the same instrument.
Reduce confidence by 20 if less than 30 minutes before or after a high-impact news event.
```

---

## LUMEN SYSTEM PROMPT — AT MODE (30-MINUTE SCANS)

```
You are Lumen, a market intelligence engine. You analyse multi-timeframe
technical data and return a structured trading signal for BTCUSD.

You return only valid JSON. No prose. No explanation outside JSON.

Output format:
{
  "action": "BUY" or "SELL" or "HOLD",
  "confidence": integer 0 to 100,
  "lots": decimal,
  "sl": decimal (null if HOLD),
  "tp": decimal (null if HOLD),
  "strategy": string under 100 characters,
  "reason": string under 100 characters,
  "key_risk": string under 60 characters,
  "timeframe_alignment": { "1h": "bullish|bearish|neutral", "4h": "...", "1d": "..." }
}

Use the 1H chart for entry timing. Use 4H and 1D for structural context.
Only take BUY signals when 4H and 1D are aligned bullish or neutral.
Only take SELL signals when 4H and 1D are aligned bearish or neutral.
Maximum 3 positions open simultaneously.
Maximum daily loss 4 percent of account before engine pauses.
Same risk rules as scalp mode.
```

---

## ACADEMY — GRADING API CALL

```
Model: claude-haiku-4-5-20251001
Max tokens: 400
System: "You are an Academy grading engine. Grade the submitted trade against the stage criteria. Return only valid JSON."

Output format:
{
  "passed": boolean,
  "score": integer 0 to 100,
  "grade": "A" or "B" or "C" or "D" or "F",
  "criteria_results": [{ "criterion": string, "passed": boolean, "comment": string }],
  "strengths": [string, string],
  "improvements": [string, string],
  "coaching_note": string under 100 characters
}
```

Coaching note must not use hyphens. Must not mention AI. Must be a single complete sentence in plain English.

**Academy localStorage keys:**
- `wm_academy_stage` — Integer, current highest unlocked stage, default 1
- `wm_stage_[N]_status` — locked / active / cooldown / passed
- `wm_stage_[N]_cooldown` — Timestamp, when cooldown expires
- `wm_stage_[N]_attempts` — Integer
- `wm_stage_[N]_passed_at` — Timestamp
- `wm_grade_history` — Array, max 100, newest first

---

## BEHAVIOUR ENGINE

**localStorage key:** `wm_behaviour_log` — Array of `{ type, timestamp, instrument, sessionId, tradeId }`, newest first, max 200 entries.

**Flag types:** REVENGE_TRADE, FOMO_ENTRY, EARLY_EXIT, STOP_WIDENING, OVERTRADE, TILT_PATTERN

**Score deductions (7-day window):**
- REVENGE_TRADE: −10
- FOMO_ENTRY: −7
- EARLY_EXIT: −5
- STOP_WIDENING: −6
- OVERTRADE: −4
- TILT_PATTERN: −12
- Floor at 0

`calcBehaviourScore()` returns `{ score, label, trend, topFlag }` where trend is UP / DOWN / STABLE.

**Weekly coaching API call:**
- Model: `claude-haiku-4-5-20251001`, max tokens: 80
- Cache result in `wm_weekly_coaching_[week_number]`
- Prompt must not use hyphens and must not mention AI

---

## LOCALSTORAGE CAP LIMITS

| Key | Max entries |
|---|---|
| wm_scalp_log | 200 |
| wm_behaviour_log | 200 |
| wm_trade_journal | 500 |
| wm_at_log | 100 |
| wm_grade_history | 100 |

---

## STAGE COMPLETION TRACKER

Update this list as stages are completed.

```
[ ] Stage 0   File architecture refactor         Model: Opus
[ ] Stage 1   Navigation and shell               Model: Sonnet
[ ] Stage 2   Home tab                           Model: Sonnet
[ ] Stage 3   Wingman Chart component            Model: Sonnet
[x] Stage 4   Sim Trader                         Model: Sonnet
[x] Stage 5   Lumen engine refactor              Model: Opus
[x] Stage 6   Academy infrastructure             Model: Sonnet
[ ] Stage 7   Academy content: stages 1 and 2   Model: Haiku
[ ] Stage 8   Academy content: stages 3 and 4   Model: Haiku
[ ] Stage 9   Academy content: stages 5, 6, 7   Model: Haiku
[ ] Stage 10  Behaviour engine                   Model: Sonnet
[ ] Stage 11  Trader Passport                    Model: Sonnet
[ ] Stage 12  Markets tab                        Model: Sonnet
[ ] Stage 13  Onboarding flow                    Model: Sonnet
[ ] Stage 14  Settings and legal                 Model: Haiku
[x] Stage 15  Performance and polish             Model: Sonnet
```

---

## PROMPT TEMPLATES

**Starting a new stage:**
```
I am implementing Stage [X] of the Wingman build. Attached: [files].
Implement only what Stage [X] specifies. Do not modify any other file.
Global rules: no hyphens in user-facing text, no emojis, no AI mentions, Lumen is the engine name.
```

**Fixing a bug found during testing:**
```
Stage [X] is implemented. Bug found: [describe the bug exactly].
The relevant function is [name] in [file]. Fix only this issue.
```

**Splitting a large stage:**
```
Implement Stage [X] Part A only: [first half of tasks].
I will ask for Part B separately.
```

---

## STAGE QUICK REFERENCE

| Stage | Model | Files |
|---|---|---|
| 0 | Opus | index.html → full modular split |
| 1 | Sonnet | index.html, css/layout.css, js/core.js, html/tab-*.html |
| 2 | Sonnet | html/tab-home.html, js/home.js, css/home.css |
| 3 | Sonnet | js/chart.js, css/chart.css |
| 4 | Sonnet | html/tab-simtrader.html, js/simtrader.js, css/autotrader.css |
| 5 | Opus | js/lumen.js, html/tab-autotrader.html, css/autotrader.css |
| 6 | Sonnet | html/tab-academy.html, js/academy.js, css/academy.css |
| 7 | Haiku | js/academy.js (ACADEMY_STAGES[1] and [2] only) |
| 8 | Haiku | js/academy.js (ACADEMY_STAGES[3] and [4] only) |
| 9 | Haiku | js/academy.js (ACADEMY_STAGES[5], [6], [7] only) |
| 10 | Sonnet | js/behaviour.js, html/tab-academy.html (flags panel only) |
| 11 | Sonnet | html/tab-academy.html (passport section), js/academy.js |
| 12 | Sonnet | html/tab-markets.html, js/markets.js |
| 13 | Sonnet | js/core.js (onboarding modal), css/components.css |
| 14 | Haiku | html/tab-settings.html, html/tab-legal.html |
| 15 | Sonnet | All JS files, css/animations.css, css/responsive.css |
