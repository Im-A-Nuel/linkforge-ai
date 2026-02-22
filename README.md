# LinkForge AI

AI-powered portfolio assistant built with Chainlink Functions, Data Feeds, and Automation on Base Sepolia.

## Scope

- Wallet-gated frontend with profile management
- On-chain AI analysis requests and result display
- On-chain activity log viewer
- Smart-contract integration for Functions + Data Feeds + Automation hooks

## Monorepo Structure

- `frontend/` Next.js app (Wagmi + RainbowKit)
- `backend/` Fastify service (demo/mock analytics endpoints)
- `smartcontract/` Foundry Solidity contracts
- `chainlink-functions/` JS source variants for Chainlink DON execution
- `CRE/` Chainlink Runtime Environment (CRE) workflow orchestration layer

## Quick Start

### 1) Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### 2) Backend

```bash
cd backend
pnpm install
pnpm dev
```

### 3) Smart Contract

```bash
cd smartcontract
forge build
forge test
```

## Security Notes

- Admin-only contract controls for config updates and feed management
- Request guardrails: profile required, source length limit, arg limit, cooldown
- Optional source-hash allowlist for Chainlink Functions source locking

## Network

- Base Sepolia
- Contract (demo): `0xC095A56a6f915fAD1Cdb14571135dEE86c879E32`
- Explorer: `https://sepolia.basescan.org/address/0xC095A56a6f915fAD1Cdb14571135dEE86c879E32`

## CRE Workflow (CRE & AI)

LinkForge includes a CRE orchestration workflow that combines:
- On-chain read from `LinkForgeAI.getProfile(address)` (Base Sepolia)
- Off-chain external data from Fear & Greed API and CoinGecko
- AI-style recommendation logic (`HOLD`, `SHIFT_TO_STABLE`, `INCREASE_EXPOSURE`, `DIVERSIFY`)

Workflow entrypoint:
- `CRE/workflows/linkforge-ai-orchestrator.ts`

Simulation config:
- `CRE/workflows/config.json`

Local simulation command (via CRE CLI):
```bash
cd CRE
cre workflow simulate --target local-simulation --config workflows/config.json workflows/linkforge-ai-orchestrator.ts
```

Detailed CRE instructions:
- `CRE/README.md`

## Demo Video (Required for Submission)

- Public source repository: `https://github.com/Im-A-Nuel/linkforge-ai`
- Public 3-5 minute video URL: `ADD_PUBLIC_VIDEO_URL_HERE`
- Video should show:
  - wallet/profile setup,
  - AI analysis flow,
  - on-chain events,
  - CRE workflow simulation command + output.
- Full recording script:
  - `docs/VIDEO-DEMO-SCRIPT.md`

## Simulation Evidence (Captured)

Latest standalone workflow simulation output (for demo recording):

```bash
cd CRE
node --experimental-strip-types simulate-standalone.ts
```

Result snapshot:
- `riskLevel=MEDIUM`
- `esgPriority=true`
- `automationEnabled=false`
- `fearGreedIndex=8`
- `sentiment=-84`
- `volatility=20`
- `action=HOLD`
- `riskScore=46`

## Chainlink File Index (Required)

Core Chainlink integrations:
- `smartcontract/src/LinkForgeAI.sol`
- `smartcontract/script/Deploy.s.sol`
- `smartcontract/script/Configure.s.sol`
- `smartcontract/DEPLOYMENT.md`
- `chainlink-functions/ai-analysis.js`
- `chainlink-functions/ai-analysis-optimized.js`
- `chainlink-functions/ai-analysis-minimal.js`
- `chainlink-functions/ai-analysis-tiny.js`
- `frontend/lib/functionsSource.ts`
- `frontend/hooks/useContract.ts`
- `frontend/hooks/useEventLogs.ts`
- `frontend/components/AIAnalysisSection.tsx`

CRE orchestration layer:
- `CRE/workflows/linkforge-ai-orchestrator.ts`
- `CRE/workflows/config.json`
- `CRE/src/steps/readProfile.ts`
- `CRE/src/steps/fetchSignals.ts`
- `CRE/src/utils/recommendation.ts`
- `CRE/src/utils/types.ts`

Submission notes:
- `docs/SUBMISSION-CRE-AI.md`

## License

MIT
