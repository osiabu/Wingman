// POST /api/analyse — Chart image analysis.
// Claude Opus first (vision), Gemini 2.5 Flash fallback (also supports vision).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, mediaType, context } = req.body;
  const analysisPrompt = `Analyse this trading chart. ${context ? 'Context: ' + context : ''} Provide: market structure, key levels, bias, potential setups, and what to watch for. Be specific and actionable.`;

  // ── Claude Opus (primary, vision) ─────────────────────────────
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
          model: 'claude-opus-4-6',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/png', data: imageBase64 } },
              { type: 'text', text: analysisPrompt },
            ],
          }],
        }),
      });
      if (upstream.ok) {
        const data = await upstream.json();
        if (data.content?.[0]?.text) return res.status(200).json(data);
      }
    } catch (_) { /* fall through */ }
  }

  // ── Gemini 2.5 Flash (fallback, free tier, vision capable) ────
  if (process.env.GEMINI_API_KEY) {
    try {
      const upstream = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [
                { inline_data: { mime_type: mediaType || 'image/png', data: imageBase64 } },
                { text: analysisPrompt },
              ],
            }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
          }),
        }
      );
      if (upstream.ok) {
        const data = await upstream.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) return res.status(200).json({ content: [{ type: 'text', text }] });
      }
    } catch (_) { /* fall through */ }
  }

  return res.status(503).json({ error: 'All chart analysis models unavailable. Please try again shortly.' });
}
