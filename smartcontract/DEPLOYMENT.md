# LinkForge AI Deployment

Network: Base Sepolia (Chain ID 84532)

## Contract

- LinkForgeAI: `0xC095A56a6f915fAD1Cdb14571135dEE86c879E32`
- BaseScan: `https://sepolia.basescan.org/address/0xC095A56a6f915fAD1Cdb14571135dEE86c879E32`
- Deployer: `0xAb4cBeFaeb226BC23F6399E0327F40e362cdDC3B`
- Deployment date: February 15, 2026

## Chainlink Functions Config

- Subscription ID: `574`
- DON ID: `fun-base-sepolia-1`
- Router: `0xf9B8fc078197181C841c296C876945aaa425B278`
- Consumer added: yes
- Gas limit (request callback): 300000

## Price Feeds

- ETH/USD: `0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1`
- BTC/USD: `0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298`

## Frontend Integration

Use these values in `frontend/.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xC095A56a6f915fAD1Cdb14571135dEE86c879E32
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

ABI source:
`https://sepolia.basescan.org/address/0xC095A56a6f915fAD1Cdb14571135dEE86c879E32#code`

## Verify Current Deployment

From `smartcontract/`:

```bash
forge test
forge script script/Configure.s.sol:ConfigureLinkForgeAI --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast -vvvv
```

## Security Notes

- This deployment is testnet-only for hackathon demo.
- Do not reuse this setup in production without audit.
- Keep private keys only in local `.env` files and never commit them.