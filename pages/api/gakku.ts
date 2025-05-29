// pages/api/gakku.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { api = 'XKT004' } = req.query as { api?: string };

  const apiKey = process.env.REINFOLIB_API_KEY;
  if (!apiKey) {
    console.error('Missing REINFOLIB_API_KEY');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  // ── 学校位置取得 (XKT006) ──
  if (api === 'XKT006') {
    const { latitude, longitude, level } = req.query as Record<string, string>;
    if (!latitude || !longitude || !level) {
      return res
        .status(400)
        .json({ error: 'latitude, longitude, level parameters are required' });
    }

    const url = new URL(
      'https://www.reinfolib.mlit.go.jp/ex-api/external/XKT006'
    );
    url.searchParams.set('response_format', 'geojson');
    url.searchParams.set('latitude', latitude);
    url.searchParams.set('longitude', longitude);
    url.searchParams.set('level', level);

    try {
      const r = await fetch(url.toString(), {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
        },
      });
      if (!r.ok) {
        return res.status(r.status).end();
      }
      const data = await r.json();
      return res.status(200).json(data);
    } catch (err) {
      console.error('XKT006 fetch failed', err);
      return res.status(500).json({ error: 'Fetch failed' });
    }
  }

  // ── タイル取得 (XKT004/XKT005) ──
  const { code, z, x, y } = req.query as Record<string, string>;
  if (!code || !z || !x || !y) {
    return res
      .status(400)
      .json({ error: 'code, z, x, y parameters are required' });
  }
  const url = new URL(
    api === 'XKT005'
      ? 'https://www.reinfolib.mlit.go.jp/ex-api/external/XKT005'
      : 'https://www.reinfolib.mlit.go.jp/ex-api/external/XKT004'
  );
  url.searchParams.set('response_format', 'geojson');
  url.searchParams.set('administrativeAreaCode', code);
  url.searchParams.set('z', z);
  url.searchParams.set('x', x);
  url.searchParams.set('y', y);

  try {
    const r = await fetch(url.toString(), {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });
    if (!r.ok) {
      return res.status(r.status).end();
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Tile fetch failed', err);
    return res.status(500).json({ error: 'Fetch failed' });
  }
}
