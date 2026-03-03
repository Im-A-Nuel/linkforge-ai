import { getCRERecommendation } from '../src/services/cre.js';
import { ensureGet, sendError, VercelLikeRequest, VercelLikeResponse } from './_utils.js';

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (!ensureGet(req, res)) return;

  try {
    const data = await getCRERecommendation();
    res.status(200).json(data);
  } catch {
    sendError(res, 500, 'Failed to compute CRE recommendation');
  }
}
