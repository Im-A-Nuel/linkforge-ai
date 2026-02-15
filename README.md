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

## License

MIT
