// Upstash Redis REST helpers — shared by all API routes.
// Files prefixed with _ are NOT exposed as Vercel routes.

async function pipeline(commands) {
  const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  return res.json();
}

export async function cacheGet(key) {
  try {
    const [{ result }] = await pipeline([['GET', key]]);
    return result ? JSON.parse(result) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds) {
  try {
    await pipeline([['SET', key, JSON.stringify(value), 'EX', ttlSeconds]]);
  } catch {
    // Non-critical — carry on without caching
  }
}
