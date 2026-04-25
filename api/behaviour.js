// POST /api/behaviour — Academy grading and behavioural coaching.
// Claude Haiku first, Gemini 2.5 Flash fallback.
//
// On total failure the response body lists the upstream status and a
// short error snippet for each provider so the caller can tell a credits
// problem from a rate limit from a missing env var without grepping logs.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, prompt, maxTokens } = req.body;
  const tokens = maxTokens || 400;

  const diag = { claude: 'not attempted', gemini: 'not attempted' };

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
        diag.claude = 'status 200 but empty content';
      } else {
        let body = '';
        try { body = await upstream.text(); } catch (_) {}
        diag.claude = 'status ' + upstream.status + (body ? ': ' + body.slice(0, 200).replace(/\s+/g, ' ') : '');
      }
    } catch (e) {
      diag.claude = 'fetch threw: ' + (e && e.message ? e.message : 'unknown');
    }
  } else {
    diag.claude = 'ANTHROPIC_API_KEY not set';
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
        diag.gemini = 'status 200 but empty text';
      } else {
        let body = '';
        try { body = await upstream.text(); } catch (_) {}
        diag.gemini = 'status ' + upstream.status + (body ? ': ' + body.slice(0, 200).replace(/\s+/g, ' ') : '');
      }
    } catch (e) {
      diag.gemini = 'fetch threw: ' + (e && e.message ? e.message : 'unknown');
    }
  } else {
    diag.gemini = 'GEMINI_API_KEY not set';
  }

  return res.status(503).json({
    error: 'Both Claude and Gemini failed. Claude: ' + diag.claude + '. Gemini: ' + diag.gemini,
    diagnostics: diag
  });
}
