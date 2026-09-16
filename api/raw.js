import { get } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('method not allowed');
  const id = String(req.query?.id || '').toLowerCase();
  if (!/^[a-f0-9]{12}$/.test(id)) return res.status(404).send('script not found');
  try {
    const result = await get(`scripts/${id}.lua`, { access: 'public' });
    if (!result || result.statusCode !== 200) return res.status(404).send('script not found');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    return res.status(200).send(await new Response(result.stream).text());
  } catch (error) {
    console.error(error);
    return res.status(500).send('internal server error');
  }
}
