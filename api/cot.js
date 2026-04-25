// GET /api/cot?asset=gold&weeks=26
// Proxies the CFTC Public Reporting Environment (Socrata) for the Legacy COT
// Combined report (futures plus options). Used by the Lumen COT intelligence
// module and the Markets tab.
//
// Cache: 7 day TTL. CFTC publishes Friday at 15:30 EST; intra week the data
// does not change. A single shared Upstash entry covers every Wingman client.

import { cacheGet, cacheSet } from './_redis.js';

// Asset name to CFTC market contract code (Legacy Combined).
const CONTRACT_CODES = {
  gold:     '088691', // GOLD - COMMODITY EXCHANGE INC.
  silver:   '084691', // SILVER - COMMODITY EXCHANGE INC.
  copper:   '085692', // COPPER- #1 - COMMODITY EXCHANGE INC.
  oil:      '067651', // WTI CRUDE OIL - NEW YORK MERCANTILE EXCHANGE (Light Sweet)
  natgas:   '023651', // NATURAL GAS - NEW YORK MERCANTILE EXCHANGE
  eurusd:   '099741', // EURO FX - CHICAGO MERCANTILE EXCHANGE
  gbpusd:   '096742', // BRITISH POUND - CHICAGO MERCANTILE EXCHANGE
  jpyusd:   '097741', // JAPANESE YEN - CHICAGO MERCANTILE EXCHANGE
  chfusd:   '092741', // SWISS FRANC - CHICAGO MERCANTILE EXCHANGE
  cadusd:   '090741', // CANADIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE
  audusd:   '232741', // AUSTRALIAN DOLLAR - CHICAGO MERCANTILE EXCHANGE
  nzdusd:   '112741', // NEW ZEALAND DOLLAR - CHICAGO MERCANTILE EXCHANGE
  dxy:      '098662', // USD INDEX - ICE FUTURES U.S.
  btc:      '133741', // BITCOIN - CHICAGO MERCANTILE EXCHANGE
  ether:    '146021', // ETHER CASH SETTLED - CHICAGO MERCANTILE EXCHANGE
  spx:      '13874+', // S&P 500 STOCK INDEX - CHICAGO MERCANTILE EXCHANGE (kept for completeness)
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { asset = 'gold' } = req.query;
  const weeks = Math.min(Math.max(parseInt(req.query.weeks, 10) || 26, 4), 52);
  const code = CONTRACT_CODES[String(asset).toLowerCase()];
  if (!code) {
    return res.status(400).json({ error: 'asset must be one of ' + Object.keys(CONTRACT_CODES).join(', ') });
  }

  const cacheKey = `cot:legacy:${asset}:${weeks}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json({ ...cached, _cached: true });

  // Socrata accepts an optional app token via X-App-Token. Without one the
  // endpoint still serves data with throttled rate limits which the Redis
  // cache layer keeps well under.
  const headers = { 'Accept': 'application/json' };
  if (process.env.CFTC_APP_TOKEN) headers['X-App-Token'] = process.env.CFTC_APP_TOKEN;

  try {
    const url = `https://publicreporting.cftc.gov/resource/jun7-fc8e.json`
      + `?cftc_contract_market_code=${encodeURIComponent(code)}`
      + `&$order=report_date_as_yyyy_mm_dd DESC`
      + `&$limit=${weeks}`;

    const r = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
    if (!r.ok) throw new Error('CFTC status ' + r.status);
    const rows = await r.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(502).json({ error: 'CFTC returned no rows for ' + asset });
    }

    const i = (s) => Number.isFinite(parseInt(s, 10)) ? parseInt(s, 10) : 0;
    const series = rows.map((row) => {
      const commLong  = i(row.comm_positions_long_all);
      const commShort = i(row.comm_positions_short_all);
      const specLong  = i(row.noncomm_positions_long_all);
      const specShort = i(row.noncomm_positions_short_all);
      const smallLong  = i(row.nonrept_positions_long_all);
      const smallShort = i(row.nonrept_positions_short_all);
      return {
        week_ending: (row.report_date_as_yyyy_mm_dd || '').slice(0, 10),
        commercial_long: commLong,
        commercial_short: commShort,
        commercial_net: commLong - commShort,
        spec_long: specLong,
        spec_short: specShort,
        spec_net: specLong - specShort,
        small_long: smallLong,
        small_short: smallShort,
        small_net: smallLong - smallShort,
        open_interest: i(row.open_interest_all),
      };
    });

    // Server returned newest first. Persist newest first; client does its own
    // ordering when computing percentiles.
    const payload = {
      asset,
      contract_code: code,
      weeks: series.length,
      latest_week_ending: series[0]?.week_ending || null,
      series,
      updatedAt: new Date().toISOString()
    };
    await cacheSet(cacheKey, payload, 7 * 24 * 3600);
    return res.json(payload);
  } catch (e) {
    return res.status(502).json({ error: 'CFTC fetch failed: ' + e.message });
  }
}
