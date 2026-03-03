import { getSentimentData } from '../src/services/sentiment.js';
import { getWalletRisk } from '../src/services/risk.js';
import { getESGScore } from '../src/services/esg.js';
import { getCRERecommendation } from '../src/services/cre.js';

type QueryValue = string | string[] | undefined;

interface VercelLikeRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, QueryValue>;
}

interface VercelLikeResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelLikeResponse;
  json(payload: unknown): void;
  end(body?: string): void;
}

function first(value: QueryValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getAllowedOrigin(req: VercelLikeRequest): string {
  const requestOriginRaw = req.headers.origin;
  const requestOrigin = Array.isArray(requestOriginRaw)
    ? requestOriginRaw[0]
    : requestOriginRaw;

  const configuredOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (configuredOrigins.length === 0) {
    return requestOrigin || '*';
  }

  if (requestOrigin && configuredOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return configuredOrigins[0];
}

function applyCors(req: VercelLikeRequest, res: VercelLikeResponse): void {
  const origin = getAllowedOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

function sendError(res: VercelLikeResponse, code: number, error: string): void {
  res.status(code).json({ error });
}

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  const routeParam = req.query.route;
  const route = Array.isArray(routeParam) ? routeParam.join('/') : routeParam ?? '';

  if (route === 'health') {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    return;
  }

  if (route === 'sentiment') {
    const asset = first(req.query.asset);
    if (!asset) {
      sendError(res, 400, 'Missing required parameter: asset');
      return;
    }

    try {
      const data = await getSentimentData(asset);
      res.status(200).json(data);
    } catch {
      sendError(res, 500, 'Failed to fetch sentiment data');
    }
    return;
  }

  if (route === 'wallet-risk') {
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
    return;
  }

  if (route === 'esg-score') {
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
    return;
  }

  if (route === 'cre-recommendation') {
    try {
      const data = await getCRERecommendation();
      res.status(200).json(data);
    } catch {
      sendError(res, 500, 'Failed to compute CRE recommendation');
    }
    return;
  }

  sendError(res, 404, 'Not found');
}
