# LinkForge AI - Smart Contracts

Solidity smart contracts untuk LinkForge AI platform dengan Chainlink integration.

## Features

- ✅ **Profile Management**: User risk preferences, ESG priority, automation settings
- ✅ **Chainlink Functions**: AI-powered analysis via decentralized compute
- ✅ **Chainlink Data Feeds**: Real-time price data untuk crypto assets
- ✅ **Chainlink Automation**: Automated rebalancing berdasarkan AI recommendations
- ✅ **On-chain Reasoning Storage**: Transparent AI decision history

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Wallet dengan testnet ETH (Sepolia atau Base Sepolia)
- Chainlink Functions subscription ([docs](https://docs.chain.link/chainlink-functions))

## Installation

```bash
# Install dependencies
forge install

# Copy environment template
cp .env.example .env
```

## Configuration

Edit `.env` file:

```bash
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CHAINLINK_SUBSCRIPTION_ID=your_subscription_id
BASESCAN_API_KEY=your_basescan_api_key
NETWORK=base_sepolia
```

## Compile

```bash
forge build
```

## Test

```bash
forge test
```

## Deploy

### Deploy to Base Sepolia

```bash
forge script script/Deploy.s.sol:DeployLinkForgeAI --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify -vvvv
```

### Deploy to Sepolia

```bash
export NETWORK=sepolia
forge script script/Deploy.s.sol:DeployLinkForgeAI --rpc-url $SEPOLIA_RPC_URL --broadcast --verify -vvvv
```

## Contract Architecture

### Main Contract: `LinkForgeAI.sol`

#### Key Functions

**Profile Management**
```solidity
function setProfile(RiskLevel _riskLevel, bool _esgPriority, bool _automationEnabled) external
function getProfile(address user) external view returns (UserProfile memory)
```

**Chainlink Functions**
```solidity
function requestAIAnalysis(string calldata source, string[] calldata args) external returns (bytes32 requestId)
```

**Chainlink Data Feeds**
```solidity
function addPriceFeed(string calldata asset, address feedAddress) external
function getLatestPrice(string calldata asset) external view returns (int256 price, uint8 decimals)
```

**Chainlink Automation**
```solidity
function checkUpkeep(bytes calldata checkData) external view returns (bool upkeepNeeded, bytes memory performData)
function performUpkeep(bytes calldata performData) external
```

## Usage Example

### 1. Set User Profile

```solidity
// Set risk level to MEDIUM, enable ESG, enable automation
linkForgeAI.setProfile(RiskLevel.MEDIUM, true, true);
```

### 2. Request AI Analysis

```solidity
string memory source = "/* JavaScript code for AI analysis */";
string[] memory args = new string[](2);
args[0] = "0x..."; // user address
args[1] = "BTC,ETH"; // assets

bytes32 requestId = linkForgeAI.requestAIAnalysis(source, args);
```

### 3. Get Latest Price

```solidity
(int256 price, uint8 decimals) = linkForgeAI.getLatestPrice("ETH");
```

### 4. View Reasoning History

```solidity
AIReasoning[] memory history = linkForgeAI.getReasoningHistory(userAddress);
```

## Chainlink Resources

### Base Sepolia

- **Functions Router**: `0xf9B8fc078197181C841c296C876945aaa425B278`
- **DON ID**: `fun-base-sepolia-1`
- **ETH/USD Price Feed**: `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1`
- **BTC/USD Price Feed**: `0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298`

### Sepolia

- **Functions Router**: `0xb83E47C2bC239B3bf370bc41e1459A34b41238D0`
- **DON ID**: `fun-ethereum-sepolia-1`

## Security Considerations

⚠️ **IMPORTANT**: This is a hackathon/demo project. Before production:

1. Complete security audit
2. Implement access control (Ownable, role-based permissions)
3. Add reentrancy guards
4. Implement emergency pause mechanism
5. Add comprehensive test coverage
6. Implement proper DEX integration for actual rebalancing
7. Add slippage protection
8. Implement gas optimizations

## Foundry Commands

### Build
```bash
forge build
```

### Test
```bash
forge test -vvv
```

### Gas Report
```bash
forge test --gas-report
```

### Format
```bash
forge fmt
```

### Coverage
```bash
forge coverage
```

## Support

- [Chainlink Docs](https://docs.chain.link)
- [Foundry Book](https://book.getfoundry.sh)
- [Chainlink Functions](https://docs.chain.link/chainlink-functions)

## License

MIT
