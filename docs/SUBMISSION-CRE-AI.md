# Submission Checklist - CRE & AI

Use this checklist before final submission.

## Core Requirement

- [x] CRE workflow exists as orchestration layer:
  - `CRE/workflows/linkforge-ai-orchestrator.ts`
- [x] Workflow integrates blockchain + external API:
  - Blockchain read: `getProfile(address)` from `LinkForgeAI`
  - External APIs: Fear & Greed + CoinGecko
- [x] Workflow simulation executed and output captured
  - Standalone simulation: `node --experimental-strip-types simulate-standalone.ts`
  - Output: riskLevel=MEDIUM, sentiment=-84, volatility=20, action=HOLD, riskScore=46
  - Profile snapshot: esgPriority=true, automationEnabled=false, lastRebalance=never
  - Contract read verified on-chain: Base Sepolia `0xC095A56a6f915fAD1Cdb14571135dEE86c879E32`
  - Live APIs: Fear & Greed Index (raw=8/100) + CoinGecko ETH/BTC 24h change
- [ ] (Alternative) live deployment on CRE network completed

## Required Submission Artifacts

- [ ] Public 3-5 minute demo video URL added to `README.md`
- [x] Public source repository available
  - `https://github.com/Im-A-Nuel/linkforge-ai`
- [x] README includes links to files that use Chainlink

## Current Status

- Remaining before final submit: add public demo video URL in `README.md`.
- Video script prepared in `docs/VIDEO-DEMO-SCRIPT.md`.

## Suggested Demo Flow (Video)

1. Show profile setup on app.
2. Trigger AI analysis and show on-chain event logs.
3. Open CRE workflow files and explain orchestration path.
4. Run CRE simulation command:
   - `cre workflow simulate --target local-simulation --config workflows/config.json workflows/linkforge-ai-orchestrator.ts`
5. Show simulation output and explain recommendation result.

## Evidence to Capture

- Terminal command + output for CRE simulation.
- BaseScan links for deployed contract and transaction examples.
- One screenshot of workflow source and one of simulation logs.
