// GET /api/fred?series=DFII10&days=60
// Proxies the St Louis Fed FRED observations endpoint with Upstash Redis
// caching. Used by the Lumen real yields engine.
//
// Series of interest:
//   DFII10  10 Year Treasury Inflation Indexed (real yield)
//   DGS10   10 Year Treasury Constant Maturity (nominal yield)
//   DTWEXBGS Trade Weighted US Dollar Index, Broad
//   T10YIE  10 Year breakeven inflation expectation
//
// Cache: 24 hour TTL. FRED publishes daily and a single shared cache covers
// every Wingman client. Requires FRED_API_KEY in Vercel env.

import { cacheGet, cacheSet } from './_redis.js';

const ALLOWED = new Set(['DFII10', 'DGS10', 'DTWEXBGS', 'T10YIE', 'CPIAUCSL']);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { series, days = '60' } = req.query;
  if (!series || !ALLOWED.has(series)) {
    return res.status(400).json({ error: 'series must be one of ' + Array.from(ALLOWED).join(', ') });
  }
  if (!process.env.FRED_API_KEY) {
    return res.status(503).json({ error: 'FRED_API_KEY not configured' });
  }

  const dayLimit = Math.min(Math.max(parseInt(days, 10) || 60, 5), 365);
  const cacheKey = `fred:${series}:${dayLimit}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.json({ ...cached, _cached: true });

  // FRED accepts ISO observation_start. Pull a 30 day buffer for weekend gaps.
  const start = new Date(Date.now() - (dayLimit + 30) * 86400000)
    .toISOString().slice(0, 10);

  try {
    const url = `https://api.stlouisfed.org/fred/series/observations`
      + `?series_id=${encodeURIComponent(series)}`
      + `&api_key=${process.env.FRED_API_KEY}`
      + `&file_type=json`
      + `&observation_start=${start}`
      + `&sort_order=asc`;
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error('FRED status ' + r.status);
    const data = await r.json();
    const observations = (data.observations || [])
      .filter(o => o.value && o.value !== '.')
      .map(o => ({ date: o.date, value: parseFloat(o.value) }))
      .filter(o => Number.isFinite(o.value))
      .slice(-dayLimit);

    const payload = {
      series,
      count: observations.length,
      observations,
      updatedAt: new Date().toISOString()
    };
    await cacheSet(cacheKey, payload, 24 * 3600);
    return res.json(payload);
  } catch (e) {
    return res.status(502).json({ error: 'FRED fetch failed: ' + e.message });
  }
}
