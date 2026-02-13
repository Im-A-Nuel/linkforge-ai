// Quick test to check contract data
const { createPublicClient, http } = require('viem');
const { baseSepolia } = require('viem/chains');

const CONTRACT_ADDRESS = '0x32A00A7244226868653292DF0BdEb48EBbA02D4C';
const USER_ADDRESS = '0xAb4cBeFaeb226BC23F6399E0327F40e362cdDC3B'; // Your address from blockchain

const ABI = [
  {
    type: 'function',
    name: 'getProfile',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'riskLevel', type: 'uint8' },
          { name: 'esgPriority', type: 'bool' },
          { name: 'automationEnabled', type: 'bool' },
          { name: 'lastRebalance', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
];

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

async function test() {
  try {
    console.log('📡 Querying contract...');
    console.log('Contract:', CONTRACT_ADDRESS);
    console.log('User:', USER_ADDRESS);

    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'getProfile',
      args: [USER_ADDRESS],
    });

    console.log('\n✅ Contract Response:');
    console.log('Raw:', result);
    console.log('\nParsed:');
    console.log('  Risk Level:', result.riskLevel, '(0=Low, 1=Medium, 2=High)');
    console.log('  ESG Priority:', result.esgPriority);
    console.log('  Automation:', result.automationEnabled);
    console.log('  Last Rebalance:', result.lastRebalance.toString());
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
