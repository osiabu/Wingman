# Wingman

An intelligent trader training platform covering 54 instruments. Simulated trading, AI trade feedback, behavioural coaching, performance profiling, and a 7-stage Academy journey — all free, no account required.

**Live:** Coming soon via Vercel.

---

## What Wingman Is

Wingman is a **trader training platform**, not a signals service or broker. Everything runs in a simulated environment. No real funds are ever used.

The core philosophy: the Sim Trader is the classroom. AI grades real practice trades, not quizzes. Traders progress through structured stages, receive feedback on every trade, and build verifiable skills before risking real capital.

> This platform does not provide financial advice. All trading is simulated and for educational purposes only.

---

## Features

### Market Scan
Multi-timeframe analysis across 54 instruments (metals, forex majors and minors, crypto, indices, energy). Returns bias, entry zones, stop loss, take profit, and a plain English explanation. Cross-asset correlation activates when scanning multiple pairs simultaneously.

### Sim Trader
Full virtual trading simulator with a $10,000 starting account. BUY and SELL order entry, configurable stop loss and take profit, leverage options, partial close, live P&L tracking, and complete trade history with win rate.

### Trading Academy (7-Stage Journey)
A structured progression system where each stage must be passed before the next unlocks:

| Stage | Focus | Requirement |
|-------|-------|-------------|
| 1 | Foundation | 5-question knowledge check, pass 4/5 |
| 2 | Risk First | 10 graded sim trades, correct sizing |
| 3 | Reading the Market | 15 trades with HTF bias alignment |
| 4 | The Setup | 15 trades, average confluence score 65+ |
| 5 | Managing the Trade | 20 trades, hold ratio above 1.2 |
| 6 | Consistency | 30 trades, zero behavioural flags |
| 7 | Graduation | 50-trade final assessment, Trader Passport |

### Behavioural Detectors
Six live detectors monitor: revenge trading, overtrading, FOMO entries, early exits, stop widening, and tilt patterns (2+ flags in one session).

### AI Trade Review
Every closed sim trade generates a review card: entry quality score, stop placement score, exit quality, behavioural flags, what was done well, and what to improve.

### Performance Profiling
Win rate, average risk:reward, profit factor, session heatmap, instrument breakdown, and regime performance (trending vs ranging vs volatile).

### Additional Tools
- **Risk Calculator** with AI sanity check
- **Market Depth** combining OANDA sentiment, Binance order book, CFTC COT data, and CBOE options flow
- **Trade Journal** with AI coaching per logged trade
- **Chart Analysis** via screenshot upload
- **Price Alerts**
- **Session Heatmap**
- **Economic Calendar** via Forex Factory

---

## Tech Stack

| Layer | Detail |
|-------|--------|
| Language | Vanilla JavaScript |
| Frontend | Single HTML file, no framework, no build step |
| AI | Claude API (market scan, trade review, chart analysis), Grok xAI (optional sentiment) |
| Prices | Binance WebSocket (crypto), metals.live (metals), exchangerate.host (forex fallback) |
| Charts | TradingView widget (BINANCE:BTCUSDT default) |
| Hosting | Vercel (primary), or any static file server |

---

## Architecture

Single HTML file (~370KB). No backend, no build process. The browser communicates directly with external APIs. All user data (trades, settings, alerts) persists in `localStorage` and never leaves the device. AI keys are optional — the platform is fully usable without them via the server-side worker.

---

## Running Locally

```bash
git clone https://github.com/abuj07/Wingman.git
cd Wingman
npx serve .
# Visit http://localhost:3000
```

Or just open `index.html` directly in a browser.

No API keys required to launch. Add a Grok key in Settings for live sentiment analysis.

---

## Deployment (Go-Live)

### Vercel (primary)
```bash
npm i -g vercel
vercel        # preview deployment
vercel --prod # production deployment
```
Connect the GitHub repo in the Vercel dashboard and every push to `main` deploys automatically.

### Custom Domain
1. Add a `CNAME` file to the repo root containing your domain (e.g. `wingman.trade`)
2. In your DNS provider, add a `CNAME` record pointing to `abuj07.github.io`
3. In GitHub repo Settings > Pages, set your custom domain and enable HTTPS

### Vercel (recommended for future backend features)
```bash
npm i -g vercel
vercel
```
Environment variables for server-side AI keys go in the Vercel dashboard under Project > Settings > Environment Variables.

---

## Environment Variables (Server-Side)

When deploying with a backend (Vercel/Cloudflare Worker), set these as server-side secrets — never in the browser:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude AI analysis |
| `GEMINI_API_KEY` | Gemini Flash sentiment (fallback) |
| `TWELVEDATA_API_KEY` | Forex candle data |

The Grok API key remains user-supplied (entered in Settings), as it powers personal sentiment preferences.

---

## Legal

Wingman is not authorised or regulated by the Financial Conduct Authority (FCA) or any financial regulatory body. It does not constitute financial advice or an offer to buy or sell any financial instrument. All trading is simulated and for educational purposes only.

See the in-app Privacy Policy and Terms & Conditions pages for full detail.

---

## Author

**Osi Abu** — Full Stack AI Engineer, London.
- [osiabu.dev](https://www.osiabu.dev)
- [LinkedIn](https://www.linkedin.com/in/osiabu)
- [GitHub](https://www.github.com/abuj07)
