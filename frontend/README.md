# LinkForge AI - Frontend

Next.js frontend for LinkForge AI portfolio management platform.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Web3**: wagmi + RainbowKit + viem
- **State Management**: TanStack Query (React Query)

## Features

- ðŸ” **Wallet Connection**: RainbowKit modal with multiple wallet options
- ðŸ“Š **Dashboard**: View portfolio overview and allocation
- âš™ï¸ **Profile**: Configure risk level, ESG priority, and automation settings
- ðŸ“œ **Logs**: View on-chain events and transaction history

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

```bash
cd frontend
pnpm install
```

### Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the following variables:

- `NEXT_PUBLIC_RPC_URL` - RPC endpoint (default: Base Sepolia)
- `NEXT_PUBLIC_CHAIN_ID` - Chain ID (default: 84532 for Base Sepolia)
- `NEXT_PUBLIC_VAULT_ADDRESS` - Deployed smart contract address
- `NEXT_PUBLIC_BACKEND_URL` - Backend API base URL (default: http://localhost:8080)
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - (Optional) WalletConnect project ID

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
frontend/
â”œâ”€â”€ app/                  # Next.js App Router pages
â”‚   â”œâ”€â”€ page.tsx         # Dashboard
â”‚   â”œâ”€â”€ profile/         # Profile settings
â”‚   â””â”€â”€ logs/            # Activity logs
â”œâ”€â”€ components/          # React components
â”‚   â”œâ”€â”€ ui/             # UI components (Button, Card, etc.)
â”‚   â”œâ”€â”€ navbar.tsx      # Navigation bar
â”‚   â”œâ”€â”€ connect-wallet.tsx # Wallet connection
â”‚   â””â”€â”€ providers.tsx   # Web3 providers
â””â”€â”€ lib/                # Utilities and configurations
    â”œâ”€â”€ config.ts       # App configuration
    â””â”€â”€ wagmi.ts        # Wagmi configuration
```

## Integration with Smart Contract

Once the smart contract is deployed, update:

1. `NEXT_PUBLIC_VAULT_ADDRESS` in `.env.local`
2. Add contract ABI in `lib/abi.ts`
3. Implement contract interaction hooks in `lib/hooks/`

## Next Steps

- [ ] Add contract ABI after smart contract deployment
- [ ] Implement real event log fetching from blockchain
- [ ] Add transaction history with pagination
- [ ] Integrate with Backend API for sentiment data
- [ ] Add loading states and error handling
- [ ] Implement real-time updates with WebSocket

