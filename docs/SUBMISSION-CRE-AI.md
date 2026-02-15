# Submission Checklist - CRE & AI

Use this checklist before final submission.

## Core Requirement

- [x] CRE workflow exists as orchestration layer:
  - `CRE/workflows/linkforge-ai-orchestrator.ts`
- [x] Workflow integrates blockchain + external API:
  - Blockchain read: `getProfile(address)` from `LinkForgeAI`
  - External APIs: Fear & Greed + CoinGecko
- [ ] CRE CLI simulation executed and output captured
- [ ] (Alternative) live deployment on CRE network completed

## Required Submission Artifacts

- [ ] Public 3-5 minute demo video URL added to `README.md`
- [ ] Public source repository available
- [x] README includes links to files that use Chainlink

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
