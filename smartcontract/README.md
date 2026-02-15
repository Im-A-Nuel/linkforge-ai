# LinkForge AI Smart Contracts

Solidity contracts for on-chain profile management, AI request orchestration (Chainlink Functions), and event-based automation hooks.

## Contract

- Main: `src/LinkForgeAI.sol`
- Compiler: Solidity `0.8.19`
- Tooling: Foundry

## Security Controls (MVP)

- Owner-based admin protection (`onlyOwner`) for:
  - Functions config updates
  - Price feed registration
  - Automation interval updates
  - Request limit updates
  - Source-hash allowlist updates
- Request guardrails:
  - Profile must be set before AI request
  - Request cooldown per user
  - Max source length and max arg length
  - Optional source hash locking (`allowedSourceHash`)
- Callback hardening:
  - Graceful handling for failed DON response
  - Unknown request IDs ignored
  - Out-of-range action values normalized to `HOLD`

## Setup

```bash
forge install
forge build
forge test
```

## Environment Example

```bash
PRIVATE_KEY=your_private_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CHAINLINK_SUBSCRIPTION_ID=your_subscription_id
BASESCAN_API_KEY=your_basescan_api_key
```

## Deploy

```bash
forge script script/Deploy.s.sol:DeployLinkForgeAI --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify -vvvv
```
