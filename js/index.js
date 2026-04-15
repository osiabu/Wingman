// ═══════════════════════════════════════════════════════════════
// Wingman Cloudflare Worker (Phase 2 Update - April 2026)
// Endpoints:
//   POST /v1/scan          — Claude market scan
//   POST /v1/sentiment     — Grok sentiment analysis (Legacy)
//   POST /v1/review        — Claude trade review
//   POST /v1/analyse       — Claude chart analysis (image)
//   POST /v1/behaviour     — Claude behavioural analysis
//   GET  /v1/candles       — TwelveData OHLC candle data
//   GET  /v1/news          — Finnhub market news
//   POST /api/gemini       — Gemini 3.1 (Flash/Lite/Pro) - Phase 2
//   POST /api/grok         — xAI Grok 3 - Phase 2
//   GET  /api/rss          — News RSS Fetcher - Phase 2
// ═══════════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function err(msg, status = 500) {
  return json({ error: msg }, status);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const path = url.pathname;

    // ── PHASE 2: POST /api/gemini ──────────────────────────────────
    if (path === '/api/gemini' && request.method === 'POST') {
      const body = await request.json();
      const model = body.model || 'gemini-3.1-flash-lite-preview';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      try {
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: body.system }] },
            contents: [{ role: 'user', parts: [{ text: body.prompt }] }],
            generationConfig: {
              maxOutputTokens: body.maxTokens || 400,
              temperature: body.temperature || 0.1,
              responseMimeType: "application/json"
            }
          }),
          signal: AbortSignal.timeout(10000)
        });
        const data = await res.json();
        return json(data, res.status);
      } catch (e) {
        return err(`Gemini connection failed: ${e.message}`, 504);
      }
    }

    // ── PHASE 2: POST /api/grok ────────────────────────────────────
    if (path === '/api/grok' && request.method === 'POST') {
      const body = await request.json();
      try {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.GROK_API_KEY}`,
          },
          body: JSON.stringify({
            model: body.model || 'grok-3-fast',
            messages: [
              { role: 'system', content: body.system },
              { role: 'user', content: body.prompt }
            ],
            max_tokens: body.maxTokens || 400,
            temperature: body.temperature || 0.1
          }),
          signal: AbortSignal.timeout(15000)
        });
        const data = await res.json();
        return json(data, res.status);
      } catch (e) {
        return err(`Grok connection failed: ${e.message}`, 504);
      }
    }

    // ── PHASE 2: GET /api/rss ──────────────────────────────────────
    if (path === '/api/rss' && request.method === 'GET') {
      try {
        const rssUrl = env.RSS_FEED_URL || 'https://feeds.reuters.com/reuters/businessNews';
        const res = await fetch(rssUrl, { signal: AbortSignal.timeout(5000) });
        const xml = await res.text();
        return json({ xml });
      } catch (e) {
        return err('RSS fetch timed out', 504);
      }
    }

    // ── LEGACY: POST /v1/scan ──────────────────────────────────────
    if (path === '/v1/scan' && request.method === 'POST') {
      const body = await request.json();
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: body.system,
          messages: body.messages,
        }),
      });
      const data = await res.json();
      return json(data, res.status);
    }

    // ── LEGACY: POST /v1/sentiment ─────────────────────────────────
    if (path === '/v1/sentiment' && request.method === 'POST') {
      const body = await request.json();
      if (env.GROK_API_KEY) {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.GROK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'grok-3',
            max_tokens: 2000,
            messages: [{ role: 'user', content: body.prompt }],
          }),
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content || '';
          const match = text.match(/\{[\s\S]*\}/);
          const parsed = match ? JSON.parse(match[0]) : null;
          if (parsed) return json(parsed);
        }
      }
      return json({ sentiments: [] });
    }

    // ── LEGACY: POST /v1/review ────────────────────────────────────
    if (path === '/v1/review' && request.method === 'POST') {
      const body = await request.json();
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content: body.prompt }],
        }),
      });
      const data = await res.json();
      return json(data, res.status);
    }

    // ── LEGACY: POST /v1/analyse ───────────────────────────────────
    if (path === '/v1/analyse' && request.method === 'POST') {
      const body = await request.json();
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: body.mediaType || 'image/png',
                  data: body.imageBase64,
                },
              },
              {
                type: 'text',
                text: `Analyse this trading chart. ${body.context ? 'Context: ' + body.context : ''}`,
              },
            ],
          }],
        }),
      });
      const data = await res.json();
      return json(data, res.status);
    }

    // ── LEGACY: POST /v1/behaviour ─────────────────────────────────
    if (path === '/v1/behaviour' && request.method === 'POST') {
      const body = await request.json();
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content: body.prompt }],
        }),
      });
      const data = await res.json();
      return json(data, res.status);
    }

    // ── GET /v1/candles ────────────────────────────────────────────
    if (path === '/v1/candles' && request.method === 'GET') {
      const symbol     = url.searchParams.get('symbol');
      const interval   = url.searchParams.get('interval') || '1day';
      const outputsize = url.searchParams.get('outputsize') || '30';
      if (!symbol) return err('symbol is required', 400);
      const tdUrl = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${env.TWELVEDATA_API_KEY}`;
      const res = await fetch(tdUrl);
      const data = await res.json();
      return json(data, res.status);
    }

    // ── GET /v1/news ───────────────────────────────────────────────
    if (path === '/v1/news' && request.method === 'GET') {
      const category = url.searchParams.get('category') || 'general';
      const newsUrl  = `https://finnhub.io/api/v1/news?category=${category}&token=${env.FINNHUB_API_KEY}`;
      const res = await fetch(newsUrl);
      const data = await res.json();
      return json(data, res.status);
    }

    return err('Not found', 404);
  },
};