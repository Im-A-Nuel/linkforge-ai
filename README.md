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

LinkForge integrates a full AI decision pipeline into a Chainlink Runtime Environment (CRE) orchestration workflow:

1. **On-chain read** — `LinkForgeAI.getProfile(address)` on Base Sepolia via `cre.capabilities.EVMClient`
2. **External data** — Fear & Greed Index + CoinGecko 24h price data via `cre.capabilities.HTTPClient` with `consensusMedianAggregation`
3. **Quantitative scoring** — sentiment score, volatility score, composite risk score
4. **GPT-4o-mini decision** — OpenAI API call with full market context + user risk profile → returns `HOLD / SHIFT_TO_STABLE / INCREASE_EXPOSURE / DIVERSIFY`
5. **Rule-based fallback** — activates automatically if LLM is unavailable
6. **On-chain commit** — result encoded and stored via Chainlink Functions `fulfillRequest` callback

### Chainlink Functions: Setting the EigenAI Secret

The Chainlink Functions source (`chainlink-functions/ai-analysis.js`) reads `secrets.eigenaiKey`
and calls Deepseek V3.1 via the EigenAI API (OpenAI-compatible endpoint).
To enable AI decisions in the live DON, set a DON-hosted secret:

```bash
# 1. Encrypt and upload secret to Chainlink DON
npx @chainlink/functions-toolkit secrets set eigenaiKey "sk-e6YOUR_KEY" \
  --network base-sepolia \
  --slotId 0 \
  --ttl 240

# 2. Note the returned encryptedSecretsUrls reference
# 3. Pass it in the requestAIAnalysis call (see contract docs)
```

### Workflow entrypoint
- `CRE/workflows/linkforge-ai-orchestrator.ts`
- `CRE/workflows/config.json`

### Local simulation (via CRE CLI)
```bash
cd CRE
cre workflow simulate --target local-simulation --config workflows/config.json workflows/linkforge-ai-orchestrator.ts
```

### Standalone simulation with real AI output (for demo video)
```bash
cd CRE
OPENAI_API_KEY=sk-your-key node --experimental-strip-types simulate-standalone.ts
```

Detailed CRE instructions: `CRE/README.md`

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
