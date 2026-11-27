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

  // Optional static IP proxy (e.g. https://cocproxy.royaleapi.dev/v1) avoids Vercel dynamic IP 403s
  const apiBase = (process.env.COC_PROXY_URL || 'https://api.clashofclans.com/v1').replace(/\/+$/, '');
  const url = `${apiBase}/players/%23${encodeURIComponent(cleanTag)}`;

  const keys = [
    process.env.coc_api,
    process.env.coc_api_2,
  ].filter(Boolean);

  if (keys.length === 0) {
    return res.status(500).json({ error: 'Server API configuration missing' });
  }

  for (const key of keys) {
    try {
      const cocRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Accept': 'application/json',
        },
      });

      const data = await cocRes.json().catch(() => ({}));

      if (cocRes.status === 403 && data.reason === 'accessDenied.invalidIp') {
        continue;
      }

      if (cocRes.status === 404) {
        return res.status(404).json({ error: 'Player tag not found. Check your tag in-game.' });
      }

      if (!cocRes.ok) {
        return res.status(cocRes.status).json({ error: data.message || 'Unable to fetch player data right now' });
      }

      return res.status(200).json(data);
    } catch (err) {
      continue;
    }
  }

  return res.status(503).json({
    error: 'Clash of Clans API temporarily unavailable. Configure COC_PROXY_URL or whitelist server IP.'
  });
}
