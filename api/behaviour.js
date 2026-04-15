// POST /api/behaviour — Academy grading and behavioural coaching.
// Claude Haiku first, Gemini 2.5 Flash fallback.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, prompt, maxTokens } = req.body;
  const tokens = maxTokens || 400;

  // ── Claude Haiku (primary) ─────────────────────────────────────
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
          max_tokens: tokens,
          ...(system ? { system } : {}),
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (upstream.ok) {
        const data = await upstream.json();
        if (data.content?.[0]?.text) return res.status(200).json(data);
      }
    } catch (_) { /* fall through */ }
  }

  // ── Gemini 2.5 Flash (fallback, free tier) ─────────────────────
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiBody = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: tokens },
      };
      if (system) geminiBody.system_instruction = { parts: [{ text: system }] };

      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody) }
      );
      if (upstream.ok) {
        const data = await upstream.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) return res.status(200).json({ content: [{ type: 'text', text }] });
      }
    } catch (_) { /* fall through */ }
  }

  return res.status(503).json({ error: 'All grading models unavailable. Please try again shortly.' });
}
