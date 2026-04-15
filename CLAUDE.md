# WINGMAN — CLAUDE CODE PROJECT RULES
# Read this file automatically at the start of every session.
# These rules apply to every prompt in every session without exception.

---

## MODEL SELECTION GUIDE

Switch models manually using `--model` flag when starting Claude Code.

| Model | Flag | Use for |
|---|---|---|
| claude-opus-4-6 | `--model claude-opus-4-6` | Architecture decisions, complex multi-file refactors, Lumen engine prompt engineering, Academy grading logic, any task where correctness matters more than speed |
| claude-sonnet-4-6 | `--model claude-sonnet-4-6` | Most coding tasks. Feature implementation, JS modules, chart components, UI panels, API integrations. Default for 80% of sessions |
| claude-haiku-4-5-20251001 | `--model claude-haiku-4-5-20251001` | Academy lesson content formatting, repetitive HTML templating, simple CSS fixes, icon substitution passes, single-function bug fixes, any task under 200 lines of output |

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
  wingmanlogo.png
  wingmanlogo1.png
  wingmanfavicon.png

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
    tab-markets.html
    tab-settings.html
    tab-legal.html

  js/
    core.js               navigate(), toast(), init()
    prices.js             WebSocket connections, livePriceCache, ticker
    chart.js              Lightweight Charts component
    home.js               home_ functions
    academy.js            Stage logic, grading calls
    simtrader.js          Sim order entry, positions
    lumen.js              Lumen engine (AT + scalp)
    markets.js            Scan, sentiment, COT, news
    behaviour.js          Detectors, score engine
    settings.js           Settings, preferences
    utils.js              Shared helpers, formatters
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
- Scalp mode: `claude-haiku-4-5-20251001`
- AT mode: `claude-sonnet-4-6`

---

## LUMEN PHASE 2 — MULTI-MODEL PIPELINE

Phase 2 introduces a three-layer pipeline with automatic fallback chains, a zero-cost UK guard, and a per-minute Gemini rate cap. This supplements (does not replace) the Claude-first framing above. Claude remains the preferred decision model; Gemini and Grok are there to keep Lumen running when Claude credits are exhausted or when the account must stay at zero spend.

**Three layers:**
1. Sentiment: scans recent market news and returns a reading, score, headlines, and a trump_signal flag. Runs every 5 minutes while the engine is active.
2. Data prep: condenses raw indicators into a 120 character summary string. Runs once per scan.
3. Decision: consumes the summary plus sentiment context and returns `{ verdict, confidence, sl, tp, reason }`. Runs once per scan.

**Fallback chains (first available wins):**
- Sentiment: `gemini_lite` → `grok_fast` → `claude_haiku`
- Data prep: `gemini_lite` → `gemini_flash`
- Decision: `claude_sonnet` → `gemini_flash` → `gemini_pro` → `grok_reasoning`

**Daily call budgets (per model, reset at UTC midnight):**
- `claude_sonnet` 150, `claude_haiku` 300
- `gemini_flash` 450, `gemini_lite` 950, `gemini_pro` 2
- `grok_fast` 300, `grok_reasoning` 50
- Gemini global cap: 15 calls per minute across all Gemini tiers

**Routing rules:**
- `claude_sonnet` decisions route through the worker endpoint `/v1/scan` (Anthropic Messages API).
- `claude_haiku` sentiment fallbacks route through `/v1/behaviour`.
- All Gemini tiers route through `/api/gemini`, with model strings `gemini-3.1-flash-lite-preview`, `gemini-3.1-flash-preview`, and `gemini-3.1-pro-preview`.
- Grok tiers route through `/api/grok` with model strings `grok-3-fast` and `grok-3-reasoning`.
- On a 5xx or timeout, the throttle manager records the failure and sets the model to `unavailable` for 60 seconds before retrying.

**Zero cost UK guard:**
- Gemini and Grok tiers must remain inside their free-tier quotas at all times. When quotas are exhausted, the engine pauses that model until midnight reset rather than billing the card.
- Claude tiers consume paid credits, so when the decision layer routes to Claude Sonnet the user sees it explicitly in the log source field.

**Storage key:** `wm_lum_calls` holds the per-model call counters; `wm_lum_reset_day` holds the last UTC reset day.

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
