# LinkForge AI

> **AI-Powered Portfolio Management with Chainlink Integration**

LinkForge AI is an intelligent portfolio management platform that leverages Chainlink's decentralized oracle network and runtime environment (CRE) to automate investment decisions based on AI-driven market analysis, sentiment data, and ESG considerations.

## 🎯 Problem & Solution

**Problem:** Traditional portfolio management lacks real-time adaptability and transparent decision-making processes.

**Solution:** LinkForge AI combines:
- 🤖 **AI-driven analysis** for market sentiment and trend prediction
- ⛓️ **Chainlink CRE** for automated, trustless execution
- 🔐 **On-chain reasoning** for transparent audit trails
- 🌱 **ESG integration** for sustainable investing

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│   Frontend      │◄───────►│    Backend       │◄───────►│  External APIs  │
│   (Next.js)     │         │   (Fastify)      │         │  (Sentiment)    │
│                 │         │                  │         │                 │
└────────┬────────┘         └──────────────────┘         └─────────────────┘
         │
         │ Web3 (wagmi)
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Smart Contract                                   │
│                      (LinkForgeVault.sol)                              │
│                                                                         │
│  • Store user profiles (risk level, ESG priority)                     │
│  • Commit AI reasoning (hash + URI)                                   │
│  • Execute rebalancing actions                                         │
│  • Emit verifiable events                                             │
│                                                                         │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               │ Chainlink Integration
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                           │
         ▼                                           ▼
┌─────────────────┐                         ┌─────────────────┐
│                 │                         │                 │
│  CRE Workflow   │                         │   Automation    │
│                 │                         │                 │
│  1. Fetch data  │                         │  Periodic       │
│  2. AI decision │                         │  triggering     │
│  3. Commit hash │                         │                 │
│  4. Execute     │                         │                 │
│                 │                         │                 │
└─────────────────┘                         └─────────────────┘
```

## 🚀 Chainlink Components Used

- ✅ **CRE (Chainlink Runtime Environment)** - Core workflow orchestration
- ✅ **Chainlink Functions** - External API calls and AI processing
- ✅ **Data Feeds** - Price data for portfolio valuation
- ✅ **Automation** - Scheduled rebalancing triggers
- 🔄 **CCIP** (Optional) - Cross-chain asset management

## 📁 Project Structure

```
linkforge-ai/
├── frontend/              # Next.js frontend (React + TypeScript)
│   ├── app/              # Pages: Dashboard, Profile, Logs
│   ├── components/       # UI components
│   └── lib/              # Web3 config, utilities
│
├── backend/              # Fastify API (TypeScript)
│   ├── src/routes/      # API endpoints
│   └── src/services/    # Business logic
│
├── smartcontract/        # Solidity contracts (Hardhat)
│   ├── contracts/       # Smart contracts
│   ├── scripts/         # Deployment scripts
│   └── test/            # Contract tests
│
├── CRE/                  # Chainlink Runtime Environment
│   ├── workflows/       # CRE workflow definitions
│   └── src/             # Workflow steps and utilities
│
└── docs/                # Additional documentation
    ├── architecture.md
    └── demo-script.md
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **wagmi + viem** - Web3 integration
- **TanStack Query** - Data fetching

### Backend
- **Node.js + Fastify** - High-performance API
- **TypeScript** - Type safety

### Smart Contract
- **Solidity ^0.8.20** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Security libraries
- **Chainlink** - Oracle integration

### CRE
- **CRE CLI** - Workflow management
- **Chainlink Functions** - External data & AI

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended: `npm install -g pnpm`)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/linkforge-ai.git
cd linkforge-ai
```

### 2. Frontend Setup
```bash
cd frontend
pnpm install
cp .env.example .env.local
# Update .env.local with your config
pnpm dev
```
Frontend runs on `http://localhost:3000`

### 3. Backend Setup
```bash
cd backend
pnpm install
cp .env.example .env
# Update .env with API keys
pnpm dev
```
Backend runs on `http://localhost:8080`

### 4. Smart Contract (Coming Soon)
```bash
cd smartcontract
pnpm install
cp .env.example .env
# Update .env with deployer key
pnpm hardhat compile
pnpm hardhat test
pnpm hardhat run scripts/deploy.ts --network sepolia
```

### 5. CRE Workflow (Coming Soon)
```bash
cd CRE
# Setup CRE CLI per documentation
cre workflow simulate workflows/linkforge-rebalance.workflow.json
```

## 🌐 Deployed Addresses

### Base Sepolia Testnet
- **LinkForgeVault**: `0x...` (Coming soon)
- **Explorer**: [BaseScan](https://sepolia.basescan.org)

### Sepolia Testnet
- **LinkForgeVault**: `0x...` (Coming soon)
- **Explorer**: [Etherscan](https://sepolia.etherscan.io)

## 📖 Documentation

- [Architecture Overview](./docs/architecture.md)
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Smart Contract README](./smartcontract/README.md) (Coming soon)
- [CRE Workflow README](./CRE/README.md) (Coming soon)

## 🎬 Demo

**Video Demo**: [Link to demo video] (Coming soon)

**Demo Script**: See [docs/demo-script.md](./docs/demo-script.md) (Coming soon)

## 🗺️ Roadmap

### Milestone A - Minimal Demo (✅ In Progress)
- [x] Setup project structure
- [x] Build Frontend (Next.js)
- [x] Build Backend API
- [ ] Deploy smart contract + event logs
- [ ] CRE workflow: fetch sentiment → commit reasoning → execute action
- [ ] Frontend: connect wallet + show logs

### Milestone B - Enhanced Features
- [ ] Functions/CRE call real external APIs
- [ ] Automation trigger on interval
- [ ] Compliance gate (allow/deny)
- [ ] Real sentiment analysis integration

### Milestone C - Advanced Features (Optional)
- [ ] CCIP cross-chain transfers
- [ ] Real DEX swap integration
- [ ] Advanced AI models
- [ ] Mobile app

## 🤝 Contributing

This is a hackathon project for **Chainlink Convergence**. Contributions and feedback are welcome!

## 📄 License

MIT License

## 🙏 Acknowledgments

- Chainlink for providing the decentralized oracle infrastructure
- OpenZeppelin for secure smart contract libraries
- The Ethereum and Web3 community

---

**Built for Chainlink Convergence Hackathon 2026**