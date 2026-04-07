# Wingman

A self-hosted trading intelligence tool covering 54 instruments across multi-timeframe technical analysis, real-time market depth, a virtual trading simulator, a trade journal with AI coaching, and an economic event calendar.

## Problem Statement

Retail traders typically work with fragmented tools: a charting platform for technicals, a separate news feed, a spreadsheet journal, and no coherent view of institutional positioning or cross-asset correlation. Professional-grade tooling requires expensive subscriptions, and most AI-integrated trading tools add AI as a surface feature without connecting it to structured market data. Wingman consolidates analysis, simulation, journalling, and AI reasoning into a single self-hosted file with no server dependency, so traders keep full control of their API keys, their data, and their workflow.

## Demo / Screenshot

**Live:** [https://abuj07.github.io/Wingman/](https://abuj07.github.io/Wingman/)

## Tech Stack

| Layer | Technologies |
|---|---|
| Language | JavaScript |
| Frontend | HTML, CSS, vanilla JavaScript (single file, no framework, no build step) |
| AI and LLM | Claude API (primary: market scan, trade review, chart analysis), Gemini Flash or Grok xAI (sentiment, optional) |
| Infrastructure | GitHub Pages (hosted), or self-hosted via any static file server |

## Architecture Overview

Wingman is a single HTML file of approximately 5,900 lines. There is no backend, no build process, and no server. The browser communicates directly with external APIs using keys that the user enters and stores in `localStorage`. All user data, including trade history, simulator account state, price alerts, settings, and API keys, persists in `localStorage` and never leaves the device. The data flow is entirely client-side: the Anthropic API handles market scan reasoning, trade review, and chart image analysis; the Twelve Data API provides live candlestick data for multi-timeframe technical analysis; Binance WebSocket streams real-time crypto prices; the Binance REST API supplies live order book depth; exchangerate.host provides a forex price fallback; the TradingView widget powers the live chart and economic calendar; Finnhub provides news headlines and calendar event boosting; the CBOE API supplies delayed options flow data; OANDA provides retail sentiment; and the CFTC makes COT institutional positioning data available as public domain. Each data source is accessed independently from the browser with no intermediary proxy.

## Key Features

- A multi-timeframe market scan across 54 instruments (metals, forex majors and minors, crypto, indices, energy, soft commodities, and derived pairs) that produces an overall verdict, market bias, entry zones, stop loss, take profit, lot size, and a plain English explanation. Cross-asset correlation intelligence activates when scanning multiple instruments simultaneously.
- A full virtual trading simulator with a $10,000 starting account, BUY and SELL order entry, configurable stop loss and take profit, leverage from 1:10 to 1:unlimited, partial position close, live P&L tracking, a complete trade history with win rate, and a confirmation modal showing margin and maximum risk before execution.
- A live Market Depth view combining OANDA retail long and short sentiment ratios with a contrarian signal, a Binance real-time 10-level order book refreshing every 10 seconds, CFTC COT institutional positioning for eight major markets, and CBOE put and call ratios with a VIX fear gauge.
- A Trade Journal with AI-assisted trade coaching: each logged trade receives a grade, technical assessment, psychology analysis, pattern detection across the journal history, and a specific improvement focus from Claude.
- A chart analysis feature accepting any uploaded screenshot and returning a full technical breakdown covering trend, structure, support and resistance, candlestick patterns, and potential setups, with a read-aloud option.

## How to Run Locally

### Prerequisites

- A modern web browser.
- An Anthropic API key (required for market scan, trade review, and chart analysis).
- A Twelve Data API key (recommended, free tier gives 800 calls per day, enables live candle data).
- A Grok or Gemini Flash API key (optional, enables live sentiment analysis).

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/abuj07/Wingman.git
cd Wingman
```

### Run

```bash
# Option 1: Open directly in a browser
open index.html

# Option 2: Serve locally
npx serve .
# Visit http://localhost:3000
```

Enter your Claude API key in the Settings panel on first launch. Twelve Data and sentiment keys are optional and can be added later.

## AI Integration

Wingman uses the Claude API as its primary intelligence layer, called directly from the browser. The market scan sends candlestick data, instrument metadata, and user-defined parameters to Claude with a structured prompt requesting an overall verdict, bias, specific entry zones, stop loss, take profit, and a plain English explanation formatted for copy-paste. Trade review prompts send the full trade parameters and any journal notes to Claude, which returns a structured coaching response covering technical execution, psychology, and pattern recognition. Chart analysis sends a base64-encoded image directly to Claude's vision capability and requests a technical breakdown. Dual sentiment uses either Gemini Flash or Grok to process live news and social data alongside the technical scan, with the result injected into the scan output. All API keys are stored in `localStorage` and sent directly from the browser to the respective APIs; no key ever passes through a server. This repository corresponds to the Wingman product in Osi's portfolio.

## Status

🟢 **Live** — deployed and publicly accessible at [https://abuj07.github.io/Wingman/](https://abuj07.github.io/Wingman/).

## Author

**Osi Abu** — Full Stack AI Engineer and AI Builder, London.
🌐 [osiabu.dev](https://www.osiabu.dev)
💼 [LinkedIn](https://www.linkedin.com/in/osiabu)
🐙 [GitHub](https://www.github.com/abuj07)
