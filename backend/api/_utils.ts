type QueryValue = string | string[] | undefined;

export interface VercelLikeRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, QueryValue>;
}

export interface VercelLikeResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelLikeResponse;
  json(payload: unknown): void;
  end(body?: string): void;
}

export function first(value: QueryValue): string | undefined {
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

export function applyCors(req: VercelLikeRequest, res: VercelLikeResponse): void {
  const origin = getAllowedOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

export function ensureGet(req: VercelLikeRequest, res: VercelLikeResponse): boolean {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }

  return true;
}

export function sendError(res: VercelLikeResponse, code: number, error: string): void {
  res.status(code).json({ error });
}
