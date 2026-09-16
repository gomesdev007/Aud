import { put } from '@vercel/blob';
import crypto from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  try {
    const { script } = req.body || {};
    if (typeof script !== 'string' || !script.trim()) return res.status(400).json({ error: 'script vazio' });
    if (Buffer.byteLength(script, 'utf8') > 3500000) return res.status(413).json({ error: 'script muito grande (limite: 3.5 MB)' });
    const id = crypto.randomBytes(6).toString('hex');
    await put(`scripts/${id}.lua`, script, { access: 'public', addRandomSuffix: false, contentType: 'text/plain; charset=utf-8', cacheControlMaxAge: 60 });
    const origin = new URL(req.url, `https://${req.headers.host}`).origin;
    return res.status(201).json({ id, rawUrl: `${origin}/raw/${id}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'falha ao salvar o script no Vercel Blob' });
  }
}
