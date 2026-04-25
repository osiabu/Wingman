// POST /api/scan — Market scan. Claude primary, Gemini 2.5 Flash fallback.
// Body: { system, messages, model? }
//   model defaults to claude-opus-4-7 for big-picture market intelligence.
//   Lumen Intraday passes claude-sonnet-4-6 for routine trading decisions.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages } = req.body;
  const requested = req.body.model;
  const ALLOWED = new Set(['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001']);
  const model = ALLOWED.has(requested) ? requested : 'claude-opus-4-7';

  // ── Claude (primary) ───────────────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model, max_tokens: 4000, system, messages }),
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
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature: 0.3, maxOutputTokens: 4000 },
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

  return res.status(503).json({ error: 'All scan models unavailable. Please try again shortly.' });
}
