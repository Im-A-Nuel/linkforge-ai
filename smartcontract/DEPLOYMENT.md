# LinkForge AI - Deployment Information

## 🌐 Network: Base Sepolia (Testnet)

## 📍 Contract Addresses

### Main Contract
- **LinkForgeAI**: `0x32A00A7244226868653292DF0BdEb48EBbA02D4C`
- **BaseScan**: https://sepolia.basescan.org/address/0x32a00a7244226868653292df0bdeb48ebba02d4c
- **Status**: ✅ Verified

## 🔗 Chainlink Configuration

### Chainlink Functions
- **Subscription ID**: `6262`
- **Subscription Name**: LinkForge AI Dev
- **Funded**: 0.5 LINK
- **Consumer Added**: ✅ Yes
- **Functions Router**: `0xf9B8fc078197181C841c296C876945aaa425B278`
- **DON ID**: `fun-base-sepolia-1` (0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000)

### Chainlink Data Feeds
| Asset | Feed Address | Status |
|-------|-------------|--------|
| ETH/USD | `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1` | ✅ Active |
| BTC/USD | `0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298` | ✅ Active |

## 🔑 Deployment Details

### Deployer Wallet
- **Address**: `0xAb4cBeFaeb226BC23F6399E0327F40e362cdDC3B`
- **Network**: Base Sepolia

### Gas Used
- **Deployment Gas**: 0.00001546 ETH
- **Total Transactions**: 3 (Deploy + 2 Price Feed additions)

### Deployment Date
- **Date**: February 13, 2026
- **Block**: Base Sepolia

## 📚 Contract Functions

### Profile Management
```solidity
function setProfile(RiskLevel _riskLevel, bool _esgPriority, bool _automationEnabled)
function getProfile(address user) returns (UserProfile memory)
```

### Chainlink Functions
```solidity
function requestAIAnalysis(string calldata source, string[] calldata args) returns (bytes32 requestId)
function getLatestReasoning(address user) returns (AIReasoning memory)
function getReasoningHistory(address user) returns (AIReasoning[] memory)
```

### Chainlink Data Feeds
```solidity
function addPriceFeed(string calldata asset, address feedAddress)
function getLatestPrice(string calldata asset) returns (int256 price, uint8 decimals)
```

### Chainlink Automation
```solidity
function checkUpkeep(bytes calldata checkData) returns (bool upkeepNeeded, bytes memory performData)
function performUpkeep(bytes calldata performData)
```

## 🔧 Configuration Management
```solidity
function updateFunctionsConfig(bytes32 _donId, uint64 _subscriptionId, uint32 _gasLimit)
function updateAutomationInterval(uint256 _interval)
```

## 🌐 RPC Endpoints

### Base Sepolia
- **Primary**: https://sepolia.base.org
- **Alternative**: https://base-sepolia.blockpi.network/v1/rpc/public

## 🎯 Frontend Integration

### Contract ABI
Available at: https://sepolia.basescan.org/address/0x32a00a7244226868653292df0bdeb48ebba02d4c#code

### Environment Variables for Frontend
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x32A00A7244226868653292DF0BdEb48EBbA02D4C
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

## 📊 Test Results

### ✅ Chainlink Data Feeds
- ETH/USD: Working ✓
- BTC/USD: Working ✓

### ⏳ Chainlink Functions
- Pending: Requires JavaScript source code for AI analysis

### ⏳ Chainlink Automation
- Pending: Requires upkeep registration

## 🔐 Security Notes

⚠️ **IMPORTANT**:
- This is a TESTNET deployment for hackathon/demo purposes
- DO NOT use in production without security audit
- Private key used is for development only
- No real funds should be used

## 📞 Support

- **Chainlink Functions Docs**: https://docs.chain.link/chainlink-functions
- **Base Sepolia Docs**: https://docs.base.org
- **Contract Source**: https://github.com/yourusername/linkforge-ai

## 🚀 Next Steps

1. ✅ Frontend integration with wagmi/viem
2. ⏳ Create Chainlink Functions JavaScript source for AI analysis
3. ⏳ Setup Chainlink Automation for auto-rebalancing
4. ⏳ Implement actual DEX integration for rebalancing
5. ⏳ Add comprehensive testing
6. ⏳ Security audit before mainnet

---

**Deployment Complete**: February 13, 2026
**Status**: ✅ Production Ready (Testnet)
