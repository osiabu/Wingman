# ⚡ Wingman — Trade Analyst

**Multi-asset analysis · Live order book · Institutional positioning · Economic calendar · Sim Trader · Trade journal**

A professional-grade, self-hosted trading intelligence tool that runs entirely in a single HTML file. No servers. No subscriptions beyond the APIs you configure. Your keys, your data, your edge.

---

## 🌐 Live Demo

**[https://abuj07.github.io/Wingman/](https://abuj07.github.io/Wingman/)**

---

## What Wingman Does

### Market Scan
Select any combination of 54 instruments and run a multi-timeframe analysis (Daily / 4H / 1H / 15M):
- Overall verdict and market bias with confidence level
- Specific entry zones, stop loss, take profit, and lot size
- Plain English explanation — no jargon
- Copy-ready trade summary
- Cross-asset correlation intelligence when scanning multiple pairs
- Dual sentiment layer: Grok (xAI) or Gemini Flash runs live sentiment alongside the technical scan

### Sim Trader
Full virtual trading simulator with a live TradingView chart:
- Virtual account starting at $10,000 — add funds anytime
- Prominent **▲ BUY** and **▼ SELL** buttons in the order panel (not blocking the chart)
- Set Stop Loss, Take Profit, lot size, risk amount, and leverage before placing
- Leverage from 1:10 to 1:Unlimited (including 1:2000, 1:5000)
- Confirmation modal shows entry price, margin, max loss, and R:R before execution
- **Partial close** — close any portion of an open position without closing it all
- Full close on individual positions or close all at once
- Open positions strip below the chart showing live P&L
- Complete trade history with win rate and net P&L

### Live Chart
Full-screen TradingView chart covering all 54 instruments across 6 timeframes, with a pip/RR calculator on the side panel.

### Event Calendar
Monthly economic calendar powered by **TradingView** (primary) with **Finnhub** news integration:
- TradingView provides structured economic events with impact scoring (low/medium/high)
- Finnhub news boosts colour coding — events mentioned in live Bloomberg/Reuters headlines get elevated to HIGH or SPEECH
- Breaking Finnhub headlines also appear as standalone calendar entries
- Timezone selector — display all times in your local timezone
- Click any date for fresh events — no stale cache
- Only the selected date is highlighted (single-highlight)
- Compact single-line event rows with colour-coded impact badges
- Curated recurring events: FOMC, ECB, BOE MPC, OPEC, NFP, US CPI, G7/G20

### Session Heatmap
P&L by day of week × session, pulling from Sim Trader and/or Trade Journal (toggleable). Best and worst days, pair performance breakdown.

### Market Depth
- **Retail Sentiment (OANDA)** — Long/short ratios, contrarian signal
- **Crypto Order Book (Binance)** — Real-time 10-level bid/ask depth, auto-refresh every 10s
- **COT Report (CFTC)** — Institutional positioning for Gold, Silver, Oil, EUR/USD, GBP/USD, JPY, Bitcoin
- **Options Flow (CBOE)** — Put/call ratios for SPX, Nasdaq, Gold ETF with VIX fear gauge

### Risk Calculator
Enter balance, risk %, instrument, entry and stop loss to get recommended lot size. Includes a **Trade Behaviour Review** — a dynamic analysis of your actual sizing patterns across Sim Trader and Journal trades, detecting martingale escalation and psychology patterns.

### Trade Journal
Log trades manually. Get a full coaching review on any trade: grade, technical assessment, psychology, pattern detection, improvement focus.

### Price Alerts
Set price alerts on any of the 54 instruments. Checks every 5 seconds. Browser push notification or toast fallback. Persists across sessions.

### Chart Analysis
Upload any chart screenshot for a full technical breakdown: trend, structure, support/resistance, candlestick patterns, potential setups. Includes "Read aloud."

### Pre-Trade Checklist
Six-item pre-trade checklist based on core trading rules. One-tap reset and All Clear confirmation.

---

## Instrument Coverage (54 assets)

| Group | Instruments |
|---|---|
| Metals | XAU/USD (Gold), XAG/USD (Silver), XPT/USD (Platinum), XCU/USD (Copper) |
| Forex — Majors | EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD, NZD/USD |
| Forex — Minors | EUR/GBP, EUR/JPY, GBP/JPY, AUD/JPY, CAD/JPY, EUR/CHF, GBP/CHF, EUR/CAD, AUD/CAD, AUD/NZD, CHF/JPY |
| Crypto | BTC, ETH, SOL, XRP, BNB, ADA, DOT, LINK |
| Indices | US30, SPX500, NAS100, UK100 (FTSE), GER40 (DAX), JPN225, AUS200, HK50 |
| Energy | WTI Crude, Brent Crude, Natural Gas, Gasoline |
| Softs & Ags | Coffee, Cocoa, Sugar, Wheat, Corn, Soybean, Cotton, Lumber |
| Derived | XAU/EUR, XAU/GBP, BTC/ETH, XAU/BTC |

---

## API Keys — What You Need

| Key | Required | Cost | What it unlocks |
|---|---|---|---|
| **Claude API** | ✅ Yes | Pay-as-you-go (~$5 lasts months) | Market scan, trade review, chart analysis, behaviour review |
| **Twelve Data** | Optional | Free (800 calls/day) | Live candle data for multi-timeframe analysis |
| **Grok (xAI)** | Optional | Paid | Real-time sentiment from X/social data |
| **Gemini Flash** | Optional | Free (1,500/day) | Sentiment analysis (free Grok alternative) |

**News and calendar are built-in** — no Finnhub key required. Market news from Bloomberg, Reuters, CNBC and MarketWatch loads automatically.

**Without Twelve Data:** The scan runs on Claude's market knowledge with live prices from Binance (crypto) and exchangerate.host (forex). Candle-based technical analysis requires a Twelve Data key.

---

## Getting Started

### Option 1 — Hosted version
Go to **[https://abuj07.github.io/Wingman/](https://abuj07.github.io/Wingman/)** and enter your Claude API key.

### Option 2 — Self-host

```bash
git clone https://github.com/abuj07/Wingman.git
cd Wingman
open index.html
```

Or serve locally:
```bash
npx serve .
# Visit http://localhost:3000
```

---

## Architecture

Wingman is a **single HTML file** (~5,900 lines). No build system, no npm, no backend.

**Data flow:**
```
Browser → Anthropic API        — market scan, trade review, chart analysis
Browser → xAI / Gemini API     — sentiment analysis [optional]
Browser → Twelve Data API      — live candles [optional]
Browser → Binance WebSocket    — real-time crypto prices [free, no key]
Browser → Binance REST API     — crypto order book [free, no key]
Browser → exchangerate.host    — forex price fallback [free, no key]
Browser → TradingView Calendar — economic events [free, no key]
Browser → Finnhub API          — news headlines + calendar boost [built-in key]
Browser → CBOE API             — options flow, 15-min delayed [free, no key]
Browser → OANDA                — retail sentiment [free, no key]
Browser → CFTC                 — COT institutional data [free, no key, public domain]
```

**Storage:** All user data (trades, sim account, keys, alerts, settings) in `localStorage`. Nothing on any server.

---

## Data Source Licensing

| Source | Commercial use | Notes |
|--------|---------------|-------|
| Anthropic Claude API | ✅ Yes | Standard commercial API |
| TradingView widget | 🟡 Grey area | Widget ToS targets brokers; analysis tools are common practice |
| Twelve Data | ✅ Yes (paid tier) | Free tier for personal; paid for commercial |
| Finnhub | ✅ Yes | Free tier permits commercial use |
| Binance API | ✅ Yes | Public data, no restriction |
| exchangerate.host | ✅ Yes | Free, commercial OK |
| CBOE (15-min delayed) | ✅ Yes (with attribution) | Public delayed data |
| OANDA sentiment | 🟡 Check ToS | Public endpoint; get written permission when scaling |
| CFTC COT data | ✅ Yes | US government public domain |

**Removed:** Yahoo Finance (non-commercial ToS) and ForexFactory (scraping prohibited).

---

## Navigation

**Trading**
- Market Scan — Multi-timeframe analysis with sentiment
- Live Chart — Full-screen TradingView with instrument selector and calculator
- Sim Trader — Virtual account with live chart, BUY/SELL, partial close, full position management
- Risk Calculator — Lot size calculator with trade behaviour review

**Markets & Analysis**
- Market Depth — OANDA sentiment, Binance order book, COT report, options flow
- Event Calendar — TradingView events + Finnhub news colour boost
- Trade Journal — Log trades, view P&L, get trade reviews
- Session Heatmap — Visual P&L by day and session (Sim + Journal)
- Price Alerts — Set price-level alerts on any instrument
- Chart Analysis — Upload chart screenshot for technical breakdown
- Checklist — Pre-trade checklist

**Settings**
- Claude API key (required)
- Twelve Data key (recommended)
- Grok / Gemini Flash key (optional sentiment)
- Default balance and risk percentage

---

## Disclaimer

Wingman is an analytical tool, not financial advice. All analysis, setups, and signals are for informational purposes only. Trading leveraged instruments carries significant risk of loss. Never risk more than you can afford to lose.

---

## License

MIT — fork it, modify it, deploy your own instance. Attribution appreciated.

*Built as a solo project. Feedback and pull requests welcome.*
