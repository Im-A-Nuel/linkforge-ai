import { getESGScore } from '../src/services/esg.js';
import { ensureGet, first, sendError, VercelLikeRequest, VercelLikeResponse } from './_utils.js';

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (!ensureGet(req, res)) return;

  const asset = first(req.query.asset);
  if (!asset) {
    sendError(res, 400, 'Missing required parameter: asset');
    return;
  }

  try {
    const data = await getESGScore(asset);
    res.status(200).json(data);
  } catch {
    sendError(res, 500, 'Failed to fetch ESG score');
  }
}
