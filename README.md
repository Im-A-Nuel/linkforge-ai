# 🤖 LinkForge AI

> AI-Powered Portfolio Management on Blockchain with Chainlink Integration

A decentralized portfolio manager that uses **Chainlink oracles** to analyze market data and provide personalized investment recommendations based on your risk profile.

## ✨ Features

- 🤖 **AI Analysis** - Get recommendations powered by Chainlink Functions
- 📊 **Real-time Data** - Market prices from Chainlink Data Feeds
- ⚡ **Automation** - Auto-rebalance via Chainlink Automation
- 🎯 **Personalized** - Based on your risk tolerance and ESG preferences
- 🔐 **On-Chain** - All analysis stored transparently on blockchain
- 💾 **Smart Caching** - 90% fewer RPC calls with intelligent caching

## 🎬 Demo

**Contract Address (Base Sepolia):** `0x32A00A7244226868653292DF0BdEb48EBbA02D4C`

**Verify:** https://sepolia.basescan.org/address/0x32A00A7244226868653292DF0BdEb48EBbA02D4C

## 🚀 Quick Start

```bash
# Install frontend
cd frontend
npm install

# Run development server
npm run dev
```

**Open:** http://localhost:3000

👉 **Full guide:** [QUICK-START.md](./QUICK-START.md)

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [QUICK-START.md](./QUICK-START.md) | 5-minute setup guide |
| [AI-ANALYSIS-GUIDE.md](./AI-ANALYSIS-GUIDE.md) | How AI analysis works |
| [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) | What's implemented |
| [frontend/TROUBLESHOOTING.md](./frontend/TROUBLESHOOTING.md) | Debug guide |

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │  Next.js + React + Wagmi
│  (User UI)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│   Smart Contract        │  Solidity on Base Sepolia
│   LinkForgeAI.sol       │
└───────┬─────────────────┘
        │
        ├──▶ Chainlink Functions  (AI Analysis)
        ├──▶ Chainlink Data Feeds (Price Oracles)
        └──▶ Chainlink Automation (Auto-Rebalance)
```

## 🎯 How It Works

### 1. Set Your Profile
Configure risk tolerance (Low/Medium/High) and ESG preferences

### 2. Request AI Analysis
Click button to trigger Chainlink Functions

### 3. AI Analyzes Data
Chainlink DON fetches:
- Market prices (CoinGecko)
- Sentiment index (Fear & Greed)
- Calculates volatility, risk, ESG scores

### 4. Get Recommendations
AI returns one of:
- **HOLD** - Maintain current allocation
- **SHIFT TO STABLE** - Move to stablecoins
- **INCREASE EXPOSURE** - Buy growth assets
- **DIVERSIFY** - Spread across multiple assets

## 💻 Tech Stack

**Smart Contract:**
- Solidity ^0.8.19
- Foundry
- Chainlink Contracts

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- Wagmi v2 + RainbowKit
- Tailwind CSS v4

**Blockchain:**
- Base Sepolia Testnet
- Chainlink DON

## 🔗 Chainlink Integration

### Functions (AI Analysis)
```javascript
// chainlink-functions/ai-analysis.js
const marketData = await fetchMarketData();
const sentiment = await fetchSentiment();
const recommendation = analyzeAndRecommend();
return encoded(recommendation);
```

### Data Feeds (Price Oracles)
```solidity
function getLatestPrice(string memory asset)
  returns (int256 price, uint8 decimals)
```

### Automation (Auto-Rebalance)
```solidity
function checkUpkeep() returns (bool upkeepNeeded)
function performUpkeep() // Execute rebalance
```

## 📊 Analysis Output

```json
{
  "sentimentScore": 45,      // -100 to +100
  "volatilityScore": 62,     // 0-100
  "riskScore": 55,           // 0-100
  "esgScore": 78,            // 0-100
  "recommendedAction": 0     // HOLD/STABLE/GROW/DIVERSIFY
}
```

## 💰 Costs

**Per AI Analysis:**
- Gas: ~$0.001
- LINK: ~$0.50-$1.00

**Monthly (optimized):**
- 100 users: ~$1,000-2,000

## 🛠️ Development

### Build Smart Contract
```bash
cd smartcontract
forge build
forge test
```

### Test Frontend
```bash
cd frontend
npm run dev      # Development
npm run build    # Production build
```

## 📝 Key Functions

```solidity
// User Profile
function setProfile(RiskLevel risk, bool esg, bool automation)

// AI Analysis
function requestAIAnalysis(string source, string[] args)

// Read Data
function getProfile(address user) returns (UserProfile)
function getLatestReasoning(address user) returns (AIReasoning)
```

## 🚧 Roadmap

- [x] Chainlink Functions integration
- [x] AI analysis UI
- [x] Profile management
- [x] Event logs
- [ ] Manual rebalance execution
- [ ] Real portfolio balances
- [ ] IPFS integration
- [ ] Historical charts

## 📄 License

MIT License

## 🙏 Acknowledgments

- [Chainlink](https://chain.link)
- [Base](https://base.org)
- [RainbowKit](https://rainbowkit.com)
- [Wagmi](https://wagmi.sh)

---

**Built with ❤️ using Chainlink**
