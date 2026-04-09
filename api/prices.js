// GET /api/prices?symbols=EUR/USD,XAU/USD,USD/JPY,...
// Returns { 'EUR/USD': 1.0850, 'XAU/USD': 3050.12, _source: 'td'|'er' }
//
// Caching strategy (Upstash Redis, 20s TTL):
//   All users share one cached response — only 1 TwelveData call per 20s
//   for the entire fleet, regardless of concurrent users.
//
// Price sources (in priority order):
//   1. TwelveData /price  — real-time, covers forex + metals + indices + energy
//   2. open.er-api.com    — free daily forex fallback (no API key needed)

import { cacheGet, cacheSet } from './_redis.js';

const METAL_PREFIXES = ['XAU', 'XAG', 'XPT', 'XCU', 'XBR', 'WTI', 'UKO'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const rawSymbols = (req.query.symbols || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (!rawSymbols.length) return res.status(400).json({ error: 'symbols required' });

  const cacheKey = `prices:${rawSymbols.slice().sort().join(',')}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.json({ ...cached, _cached: true });

  const prices = {};
  let source = 'td';

  // ── 1. TwelveData /price ────────────────────────────────────────────────────
  // Covers forex, metals (XAU/USD, XAG/USD), indices (DJIA, SPX), energy (WTI/USD)
  try {
    const symbolParam = rawSymbols.join(',');
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbolParam)}&apikey=${process.env.TWELVEDATA_API_KEY}`;
    const tdRes = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await tdRes.json();

    if (rawSymbols.length === 1) {
      if (data.price) prices[rawSymbols[0]] = parseFloat(data.price);
    } else {
      for (const sym of rawSymbols) {
        const entry = data[sym];
        if (entry?.price) prices[sym] = parseFloat(entry.price);
      }
    }
  } catch (e) {
    console.warn('TwelveData /price failed:', e.message);
  }

  // ── 2. open.er-api.com fallback (free, no key, daily ECB rates) ────────────
  // Only fills in vanilla forex pairs still missing after TwelveData
  const missingForex = rawSymbols.filter(sym => {
    if (prices[sym]) return false;                           // already have it
    if (!sym.includes('/')) return false;                    // not a slash-pair (e.g. indices like DJIA)
    const base = sym.split('/')[0];
    return !METAL_PREFIXES.some(m => base.startsWith(m));   // skip metals/energy
  });

  if (missingForex.length) {
    try {
      const erRes = await fetch('https://open.er-api.com/v6/latest/USD', {
        signal: AbortSignal.timeout(6000),
      });
      if (erRes.ok) {
        const erData = await erRes.json();
        const rates = erData.rates || {};
        // rates[X] = "how many X per 1 USD"
        // Universal cross-rate formula: price(BASE/QUOTE) = rate(QUOTE) / rate(BASE)
        const getRate = c => (c === 'USD' ? 1 : rates[c]);
        for (const sym of missingForex) {
          const [base, quote] = sym.split('/');
          const b = getRate(base);
          const q = getRate(quote);
          if (b && q) prices[sym] = q / b;
        }
        // Mark as 'er' only if TwelveData returned nothing at all
        if (!rawSymbols.some(s => prices[s] && source === 'td')) source = 'er';
      }
    } catch (e) {
      console.warn('open.er-api.com failed:', e.message);
    }
  }

  const result = { ...prices, _source: source };
  await cacheSet(cacheKey, result, 20);
  return res.json(result);
}
