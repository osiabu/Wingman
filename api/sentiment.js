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
    const data = await upstream.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    const parsed = safeParseJSON(text);
    return res.status(200).json(parsed || { sentiments: [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

function safeParseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch { return null; }
}
