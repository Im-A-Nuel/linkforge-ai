# LinkForge CRE Workflow

This folder contains the Chainlink Runtime Environment (CRE) orchestration workflow used by LinkForge AI.

## What This Workflow Does

On each cron run, the workflow:
1. Reads user profile from `LinkForgeAI` smart contract on Base Sepolia.
2. Fetches external off-chain market signals:
   - Fear & Greed Index API
   - CoinGecko 24h price change API
3. Computes a recommendation (`HOLD`, `SHIFT_TO_STABLE`, `INCREASE_EXPOSURE`, `DIVERSIFY`).
4. Outputs a structured orchestration result.

This satisfies a CRE orchestration pattern that combines blockchain + external API data in one workflow.

## Files

- `workflows/linkforge-ai-orchestrator.ts`: workflow entrypoint
- `workflows/config.json`: local simulation config
- `src/steps/readProfile.ts`: on-chain profile read step
- `src/steps/fetchSignals.ts`: off-chain data fetch/aggregation step
- `src/utils/recommendation.ts`: decision logic
- `src/utils/types.ts`: shared types and ABI

## Prerequisites

- Bun runtime installed
- CRE CLI installed

References:
- https://docs.chain.link/cre/getting-started/cli-installation
- https://www.npmjs.com/package/@chainlink/cre-sdk

## Install Dependencies

```bash
cd CRE
npm install
```

## Simulate Workflow (CRE CLI)

```bash
cd CRE
cre workflow simulate --target local-simulation --config workflows/config.json workflows/linkforge-ai-orchestrator.ts
```

If your workflow needs transaction broadcasting in simulation mode:

```bash
cre workflow simulate --broadcast --target local-simulation --config workflows/config.json workflows/linkforge-ai-orchestrator.ts
```

## Notes for Submission

- Update `workflows/config.json` with your intended `userAddress` for demo.
- Record terminal output from simulation and include it in your 3-5 minute video.
