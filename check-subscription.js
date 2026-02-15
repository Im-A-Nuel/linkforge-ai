// Check Chainlink Functions subscription and consumer status on Base Sepolia
function loadViem() {
  try {
    return {
      viem: require('viem'),
      chains: require('viem/chains'),
    };
  } catch {
    return {
      viem: require('./frontend/node_modules/viem'),
      chains: require('./frontend/node_modules/viem/chains'),
    };
  }
}

const { viem, chains } = loadViem();
const { createPublicClient, http } = viem;
const { baseSepolia, sepolia } = chains;

const CONTRACT_ADDRESS = '0xC095A56a6f915fAD1Cdb14571135dEE86c879E32';
const FUNCTIONS_ROUTER = '0xf9B8fc078197181C841c296C876945aaa425B278';
const FUNCTIONS_ROUTER_ETH_SEPOLIA = '0xb83E47C2bC239B3bf370bc41e1459A34b41238D0';
const INVALID_SUBSCRIPTION_SELECTOR = '0x1f6a65b6';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

const contractAbi = [
  {
    inputs: [],
    name: 'subscriptionId',
    outputs: [{ type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const routerAbi = [
  {
    inputs: [{ name: 'subscriptionId', type: 'uint64' }],
    name: 'getSubscription',
    outputs: [{
      components: [
        { name: 'balance', type: 'uint96' },
        { name: 'owner', type: 'address' },
        { name: 'blockedBalance', type: 'uint96' },
        { name: 'proposedOwner', type: 'address' },
        { name: 'consumers', type: 'address[]' },
        { name: 'flags', type: 'bytes32' },
      ],
      type: 'tuple',
    }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'client', type: 'address' },
      { name: 'subscriptionId', type: 'uint64' },
    ],
    name: 'getConsumer',
    outputs: [{
      components: [
        { name: 'allowed', type: 'bool' },
        { name: 'initiatedRequests', type: 'uint64' },
        { name: 'completedRequests', type: 'uint64' },
      ],
      type: 'tuple',
    }],
    stateMutability: 'view',
    type: 'function',
  },
];

async function checkSubscription() {
  try {
    const subscriptionId = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'subscriptionId',
    });

    console.log('\n=== Chainlink Functions Subscription Check ===');
    console.log('Contract:', CONTRACT_ADDRESS);
    console.log('Router:', FUNCTIONS_ROUTER);
    console.log('Subscription ID:', subscriptionId.toString());

    try {
      const sub = await client.readContract({
        address: FUNCTIONS_ROUTER,
        abi: routerAbi,
        functionName: 'getSubscription',
        args: [subscriptionId],
      });

      const consumer = await client.readContract({
        address: FUNCTIONS_ROUTER,
        abi: routerAbi,
        functionName: 'getConsumer',
        args: [CONTRACT_ADDRESS, subscriptionId],
      });

      const hasContractConsumer = sub.consumers
        .map((value) => value.toLowerCase())
        .includes(CONTRACT_ADDRESS.toLowerCase());

      console.log('\nSubscription status: VALID');
      console.log('Owner:', sub.owner);
      console.log('Balance (juels):', sub.balance.toString());
      console.log('Consumer in list:', hasContractConsumer ? 'YES' : 'NO');
      console.log('Consumer allowed:', consumer.allowed ? 'YES' : 'NO');
      console.log('Initiated requests:', consumer.initiatedRequests.toString());
      console.log('Completed requests:', consumer.completedRequests.toString());
    } catch (routerError) {
      const message = routerError && routerError.message ? routerError.message : String(routerError);
      if (message.includes(INVALID_SUBSCRIPTION_SELECTOR) || message.includes('InvalidSubscription')) {
        console.log('\nSubscription status: INVALID');
        console.log('This subscription ID does not exist on Base Sepolia router.');

        // Common confusion: subscription created on Ethereum Sepolia instead of Base Sepolia
        try {
          const ethClient = createPublicClient({
            chain: sepolia,
            transport: http(sepolia.rpcUrls.default.http[0]),
          });

          const ethSub = await ethClient.readContract({
            address: FUNCTIONS_ROUTER_ETH_SEPOLIA,
            abi: routerAbi,
            functionName: 'getSubscription',
            args: [subscriptionId],
          });

          console.log('\nDetected network mismatch:');
          console.log('- Subscription exists on Ethereum Sepolia');
          console.log('- Owner:', ethSub.owner);
          console.log('- Balance (juels):', ethSub.balance.toString());
          console.log('- But your contract is on Base Sepolia');
          console.log('- Create/fund a Base Sepolia Functions subscription and add the same consumer contract.');
        } catch {
          // Ignore if not found on Ethereum Sepolia either
        }
      } else {
        console.log('\nCould not validate subscription on router:');
        console.log(message);
      }
    }

    console.log('\nNext steps:');
    console.log('1. Open https://functions.chain.link/base-sepolia');
    console.log('2. Ensure subscription exists and funded with LINK');
    console.log(`3. Add consumer ${CONTRACT_ADDRESS}`);
    console.log('4. If needed, call updateFunctionsConfig with a valid subscription ID');
    console.log('\nGet testnet LINK: https://faucets.chain.link/base-sepolia');
  } catch (error) {
    console.error('Error:', error.message || String(error));
  }
}

checkSubscription();
