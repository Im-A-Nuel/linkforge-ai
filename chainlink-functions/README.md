# Chainlink Functions - AI Portfolio Analysis

## Overview

This Chainlink Functions script runs on the Chainlink DON (Decentralized Oracle Network) to analyze portfolio data and generate AI-powered rebalancing recommendations.

## How It Works

```
┌──────────────┐
│ User triggers│
│  analysis    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│ Smart Contract                   │
│ requestAIAnalysis()              │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Chainlink DON                    │
│ Executes: ai-analysis.js         │
│                                  │
│ 1. Fetch market data (CoinGecko)│
│ 2. Fetch sentiment (Fear/Greed) │
│ 3. Calculate volatility          │
│ 4. Calculate risk score          │
│ 5. Calculate ESG score           │
│ 6. Generate recommendation       │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Smart Contract Callback          │
│ handleOracleFulfillment()        │
│ Stores: AIReasoning              │
└──────────────────────────────────┘
```

## Data Sources

### 1. CoinGecko API (Market Data)
**Endpoint:** `https://api.coingecko.com/api/v3/simple/price`

**Assets tracked:**
- Ethereum (ETH)
- Bitcoin (BTC)
- Chainlink (LINK)
- USD Coin (USDC)
- DAI

**Data fetched:**
- Current price (USD)
- 24h volume
- 24h price change
- Market cap

### 2. Crypto Fear & Greed Index (Sentiment)
**Endpoint:** `https://api.alternative.me/fng/`

**Returns:** 0-100 scale
- 0-24: Extreme Fear
- 25-49: Fear
- 50-74: Greed
- 75-100: Extreme Greed

**Conversion:** Mapped to -100 to +100 sentiment score

## Analysis Logic

### Volatility Score (0-100)
```javascript
Volatility = Average 24h price change across assets
Higher = More volatile market
```

### Risk Score (0-100)
```javascript
Risk = (Negative Sentiment × 0.4) + (Volatility × 0.6)
Higher = More risky conditions
```

### ESG Score (0-100)
```javascript
ESG = Average environmental score of assets
- Ethereum (PoS): 80
- Bitcoin (PoW): 30
- Chainlink: 75
- Stablecoins: 85-90
```

### Rebalance Actions

| Action | Value | When |
|--------|-------|------|
| HOLD | 0 | Stable conditions |
| SHIFT_TO_STABLE | 1 | High risk + Low user risk tolerance |
| INCREASE_EXPOSURE | 2 | Low risk + High user risk tolerance + Positive sentiment |
| DIVERSIFY | 3 | High volatility (>80) |

## Arguments

The script expects 3 arguments from the smart contract:

```javascript
args[0] = userAddress    // e.g., "0x123..."
args[1] = riskLevel      // "0" (LOW), "1" (MEDIUM), "2" (HIGH)
args[2] = esgPriority    // "true" or "false"
```

## Response Format

Returns encoded uint256 array (5 elements):

```solidity
[
  sentimentScore,     // int256 × 100 (e.g., -3000 = -30.00)
  volatilityScore,    // uint256 (0-100)
  riskScore,          // uint256 (0-100)
  esgScore,           // uint256 (0-100)
  recommendedAction   // uint8 (0-3)
]
```

## Setup Instructions

### 1. Create Chainlink Functions Subscription

Go to https://functions.chain.link/

1. **Connect Wallet** (Base Sepolia)
2. **Create Subscription**
3. **Fund with LINK** (minimum 5 LINK)
4. **Add Consumer** (your contract address)

### 2. Get DON ID

**Base Sepolia DON ID:**
```
0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000
```

### 3. Update Smart Contract

```solidity
// In LinkForgeAI.sol constructor or updateFunctionsConfig()
donId = 0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000;
subscriptionId = YOUR_SUBSCRIPTION_ID;
gasLimit = 300000; // Adjust based on needs
```

### 4. Deploy Source Code

**Option A: Inline (Simple)**
```javascript
const source = fs.readFileSync('./ai-analysis.js', 'utf8');
// Pass directly in requestAIAnalysis()
```

**Option B: IPFS (Production)**
```bash
# Upload to IPFS
ipfs add ai-analysis.js
# Get CID: QmXXX...

# Reference in contract
const sourceHash = "QmXXX...";
```

## Testing

### Local Test (Node.js)
```javascript
// test-functions.js
const args = [
  "0xAb4cBeFaeb226BC23F6399E0327F40e362cdDC3B", // address
  "1",  // MEDIUM risk
  "true" // ESG priority
];

// Mock Functions object
const Functions = {
  makeHttpRequest: async (config) => {
    const response = await fetch(config.url);
    return { data: await response.json() };
  },
  encodeUint256: (value) => value.toString(16).padStart(64, '0'),
  hexToBytes: (hex) => Buffer.from(hex, 'hex'),
};

// Run the script
eval(sourceCode);
```

### Chainlink Functions Playground
1. Go to https://functions.chain.link/playground
2. Paste source code
3. Add test arguments
4. Click "Run"
5. Check output

## Cost Estimation

**Per Request:**
- Gas: ~300,000 gas units
- LINK: ~0.05-0.1 LINK (Base Sepolia)
- USD: ~$0.50-$1.00 at current prices

**For 100 users/day:**
- Daily: 5-10 LINK
- Monthly: 150-300 LINK
- USD: ~$3,000-6,000/month

**Optimization tips:**
- Cache results (don't re-analyze every minute)
- Batch multiple users
- Use cheaper DON if available

## Error Handling

### Common Errors

**1. API Rate Limits**
```javascript
Error: 429 Too Many Requests
Fix: Add retry logic with exponential backoff
```

**2. Timeout**
```javascript
Error: Execution timeout (>5s)
Fix: Optimize HTTP requests, reduce data fetching
```

**3. Insufficient LINK**
```javascript
Error: Subscription not funded
Fix: Add LINK to subscription
```

## Production Considerations

### Security
- [ ] Rate limit API calls
- [ ] Validate input arguments
- [ ] Sanitize user data
- [ ] Use HTTPS for all APIs
- [ ] Handle API key rotation

### Reliability
- [ ] Add fallback data sources
- [ ] Implement retry logic
- [ ] Cache intermediate results
- [ ] Monitor uptime
- [ ] Alert on failures

### Cost Optimization
- [ ] Batch requests where possible
- [ ] Cache market data (5-15 min)
- [ ] Use cheaper APIs
- [ ] Optimize gas usage
- [ ] Set reasonable gas limits

### Monitoring
- [ ] Log all executions
- [ ] Track success/failure rates
- [ ] Monitor LINK balance
- [ ] Alert on anomalies
- [ ] Dashboard for metrics

## Advanced Features (Future)

### Machine Learning Integration
```javascript
// Use AI model APIs
const mlResponse = await Functions.makeHttpRequest({
  url: "https://api.openai.com/v1/completions",
  method: "POST",
  headers: { "Authorization": `Bearer ${apiKey}` },
  data: { model: "gpt-4", prompt: "Analyze..." }
});
```

### Multiple Data Sources
```javascript
// Combine data from multiple APIs
const data = await Promise.all([
  fetchCoinGecko(),
  fetchCoinMarketCap(),
  fetchMessari(),
]);
```

### Custom Risk Models
```javascript
// User-specific risk calculation
function calculateCustomRisk(userData, marketData) {
  // Incorporate user's historical trades
  // Factor in portfolio composition
  // Consider external risk factors
}
```

## Resources

- [Chainlink Functions Docs](https://docs.chain.link/chainlink-functions)
- [Functions Tutorial](https://docs.chain.link/chainlink-functions/tutorials)
- [DON IDs](https://docs.chain.link/chainlink-functions/supported-networks)
- [API Documentation](https://www.coingecko.com/en/api/documentation)
- [Functions Playground](https://functions.chain.link/playground)

## Support

Issues? Questions?
- GitHub Issues: https://github.com/smartcontractkit/functions-hardhat-starter-kit
- Discord: https://discord.gg/chainlink
- Stack Overflow: [chainlink-functions] tag
