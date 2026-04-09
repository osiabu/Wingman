// GET /api/news?category=general
// Proxies Finnhub market news with a 5-minute Redis cache.

import { cacheGet, cacheSet } from './_redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const category = req.query.category || 'general';
  const cacheKey = `news:${category}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = `https://finnhub.io/api/v1/news?category=${category}&token=${process.env.FINNHUB_API_KEY}`;
    const newsRes = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await newsRes.json();
    await cacheSet(cacheKey, data, 300); // 5 min
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
