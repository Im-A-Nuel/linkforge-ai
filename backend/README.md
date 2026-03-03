# LinkForge AI Backend

Fastify API used for demo sentiment, risk, and ESG endpoints.

## Stack

- Node.js
- TypeScript
- Fastify

## Run

```bash
cd backend
pnpm install
pnpm dev
```

Server default: `http://localhost:8080`

## Endpoints

- `GET /health`
- `GET /api/sentiment?asset=ETH`
- `GET /api/wallet-risk?address=0x...`
- `GET /api/esg-score?asset=ETH`

## Environment

Copy `.env.example` to `.env` and set:

- `PORT`
- `NEWS_API_KEY`
- `HF_API_KEY`
- `COMPLIANCE_API_KEY`
- `CORS_ORIGIN`
- `CRE_RISK_LEVEL` (optional: `0` low, `1` medium, `2` high)

## Vercel (Monorepo) Deploy

- Set project Root Directory to `backend`
- Endpoints will be served as Vercel Functions:
  - `GET /api/health`
  - `GET /api/sentiment?asset=ETH`
  - `GET /api/wallet-risk?address=0x...`
  - `GET /api/esg-score?asset=ETH`
  - `GET /api/cre-recommendation`
- Legacy health check path `/health` is rewritten to `/api/health`

## Scope Note

Current responses are hackathon-oriented and may use mock or simplified data paths.
