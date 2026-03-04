# Submission Checklist - CRE & AI

Use this checklist before final submission.

## Core Requirement

- [x] CRE workflow exists as orchestration layer:
  - `CRE/workflows/linkforge-ai-orchestrator.ts`
- [x] Workflow integrates blockchain + external API:
  - Blockchain read: `getProfile(address)` from `LinkForgeAI`
  - External APIs: Fear & Greed + CoinGecko
- [x] Workflow simulation executed and output captured
  - Standalone simulation: `EIGENAI_API_KEY=sk-... node --experimental-strip-types simulate-standalone.ts`
  - Output: riskLevel=MEDIUM, sentiment=-90, volatility=100, action=SHIFT_TO_STABLE, riskScore=96
  - AI decision source: LLM — EigenAI · Deepseek V3.1 (not rule-based)
  - LLM reasoning: "Extreme fear, negative sentiment, and maximum volatility scores indicate severe market stress, requiring a defensive shift to stablecoins for a medium-risk profile."
  - Profile snapshot: esgPriority=true, automationEnabled=true, lastRebalance=2026-02-22
  - Contract read verified on-chain: Base Sepolia `0xC095A56a6f915fAD1Cdb14571135dEE86c879E32`
  - Live APIs: Fear & Greed Index (raw=5/100, Extreme Fear) + CoinGecko ETH -5.75% / BTC -4.63%
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
