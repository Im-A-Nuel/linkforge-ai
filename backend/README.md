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

## Scope Note

Current responses are hackathon-oriented and may use mock or simplified data paths.