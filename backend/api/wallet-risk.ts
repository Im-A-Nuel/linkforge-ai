import { getWalletRisk } from '../src/services/risk.js';
import { ensureGet, first, sendError, VercelLikeRequest, VercelLikeResponse } from './_utils.js';

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (!ensureGet(req, res)) return;

  const address = first(req.query.address);
  if (!address) {
    sendError(res, 400, 'Missing required parameter: address');
    return;
  }

  try {
    const data = await getWalletRisk(address);
    res.status(200).json(data);
  } catch {
    sendError(res, 500, 'Failed to fetch wallet risk data');
  }
}
