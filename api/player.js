export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { tag } = req.query;
  if (!tag) return res.status(400).json({ error: 'Player tag is required' });

  const cleanTag = String(tag).trim().replace(/^#/, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleanTag.length < 3 || cleanTag.length > 15) {
    return res.status(400).json({ error: 'Invalid player tag format' });
  }

  let apiBase = (process.env.COC_PROXY_URL || 'https://api.clashofclans.com/v1').trim().replace(/\/+$/, '');
  if (!apiBase.endsWith('/v1')) apiBase += '/v1';
  const usingProxy = !apiBase.includes('api.clashofclans.com');
  const url = `${apiBase}/players/%23${encodeURIComponent(cleanTag)}`;

  const keys = [process.env.coc_api, process.env.coc_api_2]
    .map(k => (k || '').trim())
    .filter(Boolean);

  if (keys.length === 0) {
    return res.status(500).json({ error: 'Server API configuration missing', usingProxy });
  }

  let lastReason = 'Unknown error';
  for (const key of keys) {
    try {
      const cocRes = await fetch(url, {
        headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
      });
      const data = await cocRes.json().catch(() => ({}));

      if (cocRes.status === 403 && data.reason === 'accessDenied.invalidIp') {
        lastReason = data.message || 'accessDenied.invalidIp';
        continue;
      }
      if (cocRes.status === 404) {
        return res.status(404).json({ error: 'Player tag not found. Check your tag in-game.' });
      }
      if (!cocRes.ok) {
        return res.status(cocRes.status).json({
          error: data.message || 'Upstream API error',
          reason: data.reason || cocRes.status,
          usingProxy,
        });
      }
      return res.status(200).json(data);
    } catch (err) {
      lastReason = err.message || 'Network fetch failed';
    }
  }

  return res.status(503).json({
    error: 'Clash of Clans API unavailable',
    reason: lastReason,
    usingProxy,
  });
}
