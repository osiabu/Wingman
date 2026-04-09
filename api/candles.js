// GET /api/candles?symbol=EUR/USD&interval=1h&outputsize=30
// Proxies TwelveData /time_series with Upstash Redis caching.
//
// Cache TTLs scale with the interval so stale candles are never served
// but TwelveData credits are shared across all users:
//   1min → 60s  |  5min → 2m  |  15min → 5m  |  30min → 10m
//   1h   → 30m  |  4h   → 2h  |  1day  → 4h  |  1week → 24h

import { cacheGet, cacheSet } from './_redis.js';

const TTL = {
  '1min': 60, '5min': 120, '15min': 300, '30min': 600,
  '1h': 1800, '2h': 3600, '4h': 7200, '8h': 14400,
  '1day': 14400, '1week': 86400,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { symbol, interval = '1day', outputsize = '30' } = req.query;
  if (!symbol) return res.status(400).json({ error: 'symbol is required' });

  const ttl = TTL[interval] || 300;
  const cacheKey = `candles:${symbol}:${interval}:${outputsize}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${process.env.TWELVEDATA_API_KEY}`;
    const tdRes = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await tdRes.json();
    await cacheSet(cacheKey, data, ttl);
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
