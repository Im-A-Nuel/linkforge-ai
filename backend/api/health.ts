import { ensureGet, VercelLikeRequest, VercelLikeResponse } from './_utils.js';

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (!ensureGet(req, res)) return;
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
