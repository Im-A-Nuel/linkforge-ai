# LinkForge AI Frontend

Next.js frontend for wallet connection, profile settings, AI analysis requests, and on-chain activity logs.

## Stack

- Next.js 16 + React 19 + TypeScript
- Wagmi + RainbowKit + viem
- Tailwind CSS

## Run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Required Env (`.env.local`)

- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_VAULT_ADDRESS`
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` (optional)

## Notes

- AI request source is defined in `lib/functionsSource.ts`.
- Logs are fetched directly from on-chain events via `hooks/useEventLogs.ts`.
