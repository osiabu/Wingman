export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Try Grok first, fall back to Claude Haiku
  if (process.env.GROK_API_KEY) {
    try {
      const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-3',
          max_tokens: 2000,
          messages: [{ role: 'user', content: req.body.prompt }],
        }),
      });
      if (grokRes.ok) {
        const data = await grokRes.json();
        const text = data.choices?.[0]?.message?.content || '';
        const parsed = safeParseJSON(text);
        if (parsed) return res.status(200).json(parsed);
      }
    } catch (_) { /* fall through to Claude */ }
  }

  // Claude Haiku fallback
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2000,
          messages: [{ role: 'user', content: req.body.prompt }],
        }),
      });
      if (upstream.ok) {
        const data = await upstream.json();
        const text = data.content?.find(b => b.type === 'text')?.text || '';
        const parsed = safeParseJSON(text);
        if (parsed) return res.status(200).json(parsed);
      }
    } catch (_) { /* fall through */ }
  }

  // Gemini 2.5 Flash final fallback (free tier)
  if (process.env.GEMINI_API_KEY) {
    try {
      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: req.body.prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2000 },
          }),
        }
      );
      if (upstream.ok) {
        const data = await upstream.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = safeParseJSON(text);
        if (parsed) return res.status(200).json(parsed);
      }
    } catch (_) { /* fall through */ }
  }

  return res.status(503).json({ error: 'All sentiment models unavailable.', sentiments: [] });
}

function safeParseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch { return null; }
}
