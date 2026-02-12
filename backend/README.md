# LinkForge AI - Backend

Backend API for LinkForge AI portfolio management platform.

## Tech Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Runtime**: Node.js

## Features

- 📊 **Sentiment API**: Get market sentiment data for assets
- ⚠️ **Risk Assessment**: Evaluate wallet risk and compliance
- 🌱 **ESG Scoring**: Retrieve ESG scores for assets

## API Endpoints

### Health Check
```
GET /health
```

### Sentiment Data
```
GET /api/sentiment?asset=ETH
```

**Response:**
```json
{
  "asset": "ETH",
  "sentiment": 0.65,
  "confidence": 0.8,
  "sources": ["NewsAPI", "Twitter Sentiment", "Reddit Analysis"],
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

### Wallet Risk
```
GET /api/wallet-risk?address=0x...
```

**Response:**
```json
{
  "address": "0x...",
  "riskScore": 45,
  "riskLevel": "medium",
  "factors": {
    "transactionVolume": 532,
    "uniqueCounterparties": 28,
    "suspiciousActivity": false
  },
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

### ESG Score
```
GET /api/esg-score?asset=GREEN1
```

**Response:**
```json
{
  "asset": "GREEN1",
  "score": 82,
  "category": "green",
  "metrics": {
    "environmental": 88,
    "social": 78,
    "governance": 80
  },
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

```bash
cd backend
pnpm install
```

### Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the following variables:

- `PORT` - Server port (default: 8080)
- `NEWS_API_KEY` - API key for news sentiment
- `HF_API_KEY` - Hugging Face API key for AI sentiment
- `COMPLIANCE_API_KEY` - Compliance provider API key
- `CORS_ORIGIN` - Frontend URL for CORS

### Development

```bash
pnpm dev
```

Server will start on `http://localhost:8080`

### Build & Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Main server file
│   ├── routes/           # API routes
│   │   ├── sentiment.ts  # Sentiment endpoints
│   │   ├── risk.ts       # Risk assessment endpoints
│   │   └── esg.ts        # ESG scoring endpoints
│   ├── services/         # Business logic
│   │   ├── sentiment.ts  # Sentiment service
│   │   ├── risk.ts       # Risk service
│   │   └── esg.ts        # ESG service
│   └── types/            # TypeScript types
└── tsconfig.json         # TypeScript configuration
```

## Integration with CRE

The backend endpoints can be called from Chainlink Functions/CRE workflows:

1. **Sentiment Data**: Used for market analysis in rebalancing decisions
2. **Risk Assessment**: Gate/filter for compliance checks
3. **ESG Scoring**: Determine asset eligibility for ESG-focused portfolios

## Next Steps

- [ ] Integrate real News API for sentiment analysis
- [ ] Connect to Hugging Face for AI-powered sentiment
- [ ] Add Chainalysis/TRM Labs for compliance
- [ ] Implement ESG data provider integration
- [ ] Add caching layer (Redis) for rate limiting
- [ ] Add authentication and rate limiting
- [ ] Implement request logging and monitoring
