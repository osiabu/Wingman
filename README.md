# Wingman: Your Self-Hosted Financial Markets Trading Intelligence Tool

`Status: Live` | `82% Complete` | `Last updated: 2026-04-22`

Wingman is a self-hosted financial markets trading intelligence tool covering 54 instruments across equities, forex, crypto, and commodities. It provides multi-timeframe technical analysis, real-time market depth, a virtual trading simulator, and a trade journal — all running locally with no SaaS subscriptions required. Wingman aims to give independent traders a professional-grade analysis environment that rivals expensive alternatives, runs on any machine, and respects user privacy by keeping all data local.

---

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | JavaScript, HTML |
| Runtime | Browser-native |
| Charts | Lightweight Charts (TradingView) |
| Data | Public market APIs (Yahoo Finance, Alpha Vantage) |
| Storage | localStorage / IndexedDB |
| AI | Anthropic Claude API (trade commentary) |
| Infrastructure | Self-hosted / GitHub Pages |

---

### Features

> This table is automatically updated by the weekly sync script. Do not edit it manually — your changes will be overwritten.

| Feature | Description | Status |
|---------|-------------|--------|
| 54-instrument coverage | Equities, forex, crypto, commodities | ✅ Built |
| Multi-timeframe analysis | 1m / 5m / 15m / 1h / 4h / 1D / 1W charts | ✅ Built |
| Technical indicators | RSI, MACD, Bollinger Bands, EMA, SMA, VWAP | ✅ Built |
| Market depth view | Order book / bid-ask spread visualisation | ✅ Built |
| Virtual trading simulator | Paper trading with P&L tracking | ✅ Built |
| Trade journal | Log trades with entry/exit/notes and stats | ✅ Built |
| AI commentary | Claude-generated market insight per instrument | ✅ Built |
| Watchlist | Custom grouping and alert configuration | 📋 Planned |
| Screener | Filter instruments by indicator conditions | 📋 Planned |
| Export | CSV/PDF export of journal and performance stats | 📋 Planned |
| ⚠️ Extra: Trading Academy | 7-stage structured progression system | ✅ Built |
| ⚠️ Extra: Behavioural Detectors | Six detectors monitoring trading psychology | ✅ Built |
| ⚠️ Extra: Performance Profiling | Win rate, R:R, profit factor, session heatmap | ✅ Built |
| ⚠️ Extra: Risk Calculator | Position sizing with AI sanity check | ✅ Built |
| ⚠️ Extra: Price Alerts | Configurable price notifications | ✅ Built |
| ⚠️ Extra: Economic Calendar | Forex Factory integration | ✅ Built |
| ⚠️ Extra: Chart Analysis | Screenshot upload for AI analysis | ✅ Built |

**Status key:**
- ✅ Built — code exists and is functional
- 🔄 In Progress — partially implemented
- ❌ Not Started — declared in blueprint but no evidence in repo
- 📋 Planned — vision-stage, not yet in blueprint scope

---

### Getting Started

To get a local copy up and running, follow these simple steps.

**Prerequisites**
- A modern web browser
- Git (for cloning the repository)

**Installation**

1. Clone the repo:
   ```sh
   git clone https://github.com/osiabu/Wingman.git
   ```
2. Navigate to the project directory:
   ```sh
   cd Wingman
   ```
3. Open `index.html` in your web browser to run the application.

---

### Roadmap

Our future development is focused on expanding personalization and data portability features.

*   **Phase 1: Advanced Filtering & Monitoring**
    *   Implement custom watchlists for grouping and tracking instruments.
    *   Build a market screener to filter instruments by technical conditions.
    *   Configure customizable alerts for watchlist instruments.

*   **Phase 2: Data Export & Reporting**
    *   Develop CSV and PDF export functionality for the trade journal.
    *   Enable exporting of performance statistics and charts.

---

Osi Abu – Full Stack AI Engineer | https://osiabu.vercel.app