// ═══════════════════════════════════════════════════════════════
// Wingman Cloudflare Worker
// Endpoints:
//   POST /v1/scan        — Market scan (Claude Opus, Gemini fallback)
//   POST /v1/sentiment   — Sentiment (Grok first, Claude Haiku fallback)
//   POST /v1/review      — Trade review (Claude Sonnet, Gemini fallback)
//   POST /v1/analyse     — Chart image analysis (Claude Opus, Gemini fallback)
//   POST /v1/behaviour   — Academy grading (Claude Haiku, Gemini fallback)
//   GET  /v1/candles     — TwelveData OHLC candle data
//   GET  /v1/news        — Finnhub market news
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

// Normalise Gemini response to Anthropic content format
function geminiToAnthropic(data) {
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text ? { content: [{ type: 'text', text }] } : null;
}

// Call Gemini 2.5 Flash (free tier) with a text request
async function callGeminiText(env, { system, messages, maxTokens = 3000 }) {
  if (!env.GEMINI_API_KEY) return null;
  try {
    const body = {
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
      })),
      generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens },
    };
    if (system) body.system_instruction = { parts: [{ text: system }] };
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!res.ok) return null;
    return geminiToAnthropic(await res.json());
  } catch { return null; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const path = url.pathname;

    // ── POST /v1/scan ──────────────────────────────────────────────
    // Claude Opus first, Gemini 2.5 Flash fallback
    if (path === '/v1/scan' && request.method === 'POST') {
      const body = await request.json();

      if (env.ANTHROPIC_API_KEY) {
        try {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({ model: 'claude-opus-4-6', max_tokens: 4000, system: body.system, messages: body.messages }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.content?.[0]?.text) return json(data);
          }
        } catch { /* fall through */ }
      }

      const gemini = await callGeminiText(env, { system: body.system, messages: body.messages, maxTokens: 4000 });
      if (gemini) return json(gemini);
      return err('All scan models unavailable', 503);
    }

    // ── POST /v1/sentiment ─────────────────────────────────────────
    // Grok first, Claude Haiku fallback (existing logic unchanged)
    if (path === '/v1/sentiment' && request.method === 'POST') {
      const body = await request.json();

      if (env.GROK_API_KEY) {
        try {
          const res = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.GROK_API_KEY}` },
            body: JSON.stringify({ model: 'grok-3', max_tokens: 2000, messages: [{ role: 'user', content: body.prompt }] }),
          }).catch(() => null);

          if (res && res.ok) {
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content || '';
            const parsed = safeParseJSON(text);
            if (parsed) return json(parsed);
          }
        } catch { /* fall through */ }
      }

      // Claude Haiku fallback for sentiment
      if (env.ANTHROPIC_API_KEY) {
        try {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, messages: [{ role: 'user', content: body.prompt }] }),
          });
          const data = await res.json();
          const text = data.content?.find(b => b.type === 'text')?.text || '';
          const parsed = safeParseJSON(text);
          if (parsed) return json(parsed);
        } catch { /* fall through */ }
      }

      // Gemini final fallback for sentiment
      const gemini = await callGeminiText(env, { messages: [{ role: 'user', content: body.prompt }], maxTokens: 2000 });
      if (gemini) {
        const text = gemini.content?.[0]?.text || '';
        const parsed = safeParseJSON(text);
        return json(parsed || { sentiments: [] });
      }

      return json({ sentiments: [] });
    }

    // ── POST /v1/review ────────────────────────────────────────────
    // Claude Sonnet first, Gemini 2.5 Flash fallback
    if (path === '/v1/review' && request.method === 'POST') {
      const body = await request.json();

      if (env.ANTHROPIC_API_KEY) {
        try {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: body.prompt }] }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.content?.[0]?.text) return json(data);
          }
        } catch { /* fall through */ }
      }

      const gemini = await callGeminiText(env, { messages: [{ role: 'user', content: body.prompt }], maxTokens: 1000 });
      if (gemini) return json(gemini);
      return err('All review models unavailable', 503);
    }

    // ── POST /v1/analyse ───────────────────────────────────────────
    // Claude Opus first (vision), Gemini 2.5 Flash fallback (vision capable)
    if (path === '/v1/analyse' && request.method === 'POST') {
      const body = await request.json();
      const analysisPrompt = `Analyse this trading chart. ${body.context ? 'Context: ' + body.context : ''} Provide: market structure, key levels, bias, potential setups, and what to watch for. Be specific and actionable.`;

      if (env.ANTHROPIC_API_KEY) {
        try {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
              model: 'claude-opus-4-6',
              max_tokens: 1500,
              messages: [{
                role: 'user',
                content: [
                  { type: 'image', source: { type: 'base64', media_type: body.mediaType || 'image/png', data: body.imageBase64 } },
                  { type: 'text', text: analysisPrompt },
                ],
              }],
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.content?.[0]?.text) return json(data);
          }
        } catch { /* fall through */ }
      }

      // Gemini 2.5 Flash vision fallback
      if (env.GEMINI_API_KEY) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  role: 'user',
                  parts: [
                    { inline_data: { mime_type: body.mediaType || 'image/png', data: body.imageBase64 } },
                    { text: analysisPrompt },
                  ],
                }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
              }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            const fallback = geminiToAnthropic(data);
            if (fallback) return json(fallback);
          }
        } catch { /* fall through */ }
      }

      return err('All chart analysis models unavailable', 503);
    }

    // ── POST /v1/behaviour ─────────────────────────────────────────
    // Claude Haiku first, Gemini 2.5 Flash fallback
    if (path === '/v1/behaviour' && request.method === 'POST') {
      const body = await request.json();
      const tokens = body.maxTokens || 400;

      if (env.ANTHROPIC_API_KEY) {
        try {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: tokens,
              ...(body.system ? { system: body.system } : {}),
              messages: [{ role: 'user', content: body.prompt }],
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.content?.[0]?.text) return json(data);
          }
        } catch { /* fall through */ }
      }

      const geminiBody = { messages: [{ role: 'user', content: body.prompt }], maxTokens: tokens };
      if (body.system) geminiBody.system = body.system;
      const gemini = await callGeminiText(env, geminiBody);
      if (gemini) return json(gemini);
      return err('All grading models unavailable', 503);
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
      const res = await fetch(newsUrl, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      return json(data, res.status);
    }

    return err('Not found', 404);
  },
};

// ── Helpers ────────────────────────────────────────────────────
function safeParseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}
