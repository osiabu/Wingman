// GET /api/intel?source=fred&series=DFII10&days=60
// GET /api/intel?source=cot&asset=gold&weeks=26
//
// Single dispatcher for read only intelligence proxies (FRED real yields,
// CFTC COT positioning). Combining them under one function keeps the project
// inside Vercel's 12 function cap on the Hobby plan. Each implementation
// lives in api/_fred.js and api/_cot.js, files prefixed with an underscore
// are treated as private helpers by Vercel and never routed.

import { fredHandler } from './_fred.js';
import { cotHandler } from './_cot.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const source = String(req.query.source || '').toLowerCase();
  if (source === 'fred') return fredHandler(req, res);
  if (source === 'cot')  return cotHandler(req, res);

  return res.status(400).json({
    error: 'source must be one of: fred, cot',
    example: '/api/intel?source=fred&series=DFII10 or /api/intel?source=cot&asset=gold'
  });
}
