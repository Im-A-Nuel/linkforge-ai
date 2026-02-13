import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { baseSepolia } from 'viem/chains';
import { LINKFORGE_CONTRACT } from '@/lib/contract';

export interface EventLog {
  id: string;
  type: string;
  timestamp: number;
  blockNumber: bigint;
  transactionHash: string;
  details: string;
  color: string;
}

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

export function useEventLogs(address?: `0x${string}`) {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    const fetchLogs = async () => {
      try {
        setIsLoading(true);

        // Get current block
        const currentBlock = await publicClient.getBlockNumber();

        // Query in smaller chunks to avoid RPC limits
        const BLOCK_RANGE = BigInt(2000); // Safe range for Base Sepolia
        const fromBlock = currentBlock > BLOCK_RANGE ? currentBlock - BLOCK_RANGE : BigInt(0);

        const allLogs: EventLog[] = [];

        // Helper to format logs
        const riskLevels = ['Low', 'Medium', 'High'];
        const actions = ['HOLD', 'SHIFT_TO_STABLE', 'INCREASE_EXPOSURE', 'DIVERSIFY'];

        // Fetch ProfileUpdated events
        try {
          const profileLogs = await publicClient.getLogs({
            address: LINKFORGE_CONTRACT.address,
            event: parseAbiItem('event ProfileUpdated(address indexed user, uint8 riskLevel, bool esgPriority, bool automationEnabled)'),
            args: { user: address },
            fromBlock,
            toBlock: 'latest',
          });

          for (const log of profileLogs) {
            const args = log.args as any;
            allLogs.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type: 'ProfileUpdated',
              timestamp: Date.now(),
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              details: `Risk: ${riskLevels[args.riskLevel] || 'Unknown'}, ESG: ${args.esgPriority ? 'Enabled' : 'Disabled'}, Auto: ${args.automationEnabled ? 'Enabled' : 'Disabled'}`,
              color: 'blue',
            });
          }
        } catch (err) {
          console.warn('Error fetching ProfileUpdated events:', err);
        }

        // Fetch ReasoningCommitted events
        try {
          const reasoningLogs = await publicClient.getLogs({
            address: LINKFORGE_CONTRACT.address,
            event: parseAbiItem('event ReasoningCommitted(address indexed user, int256 sentimentScore, uint256 volatilityScore, uint8 recommendedAction, string ipfsHash, uint256 timestamp)'),
            args: { user: address },
            fromBlock,
            toBlock: 'latest',
          });

          for (const log of reasoningLogs) {
            const args = log.args as any;
            allLogs.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type: 'ReasoningCommitted',
              timestamp: Number(args.timestamp) * 1000,
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              details: `Action: ${actions[args.recommendedAction] || 'Unknown'}, Sentiment: ${args.sentimentScore}, Volatility: ${args.volatilityScore}`,
              color: 'purple',
            });
          }
        } catch (err) {
          console.warn('Error fetching ReasoningCommitted events:', err);
        }

        // Fetch RebalanceExecuted events
        try {
          const rebalanceLogs = await publicClient.getLogs({
            address: LINKFORGE_CONTRACT.address,
            event: parseAbiItem('event RebalanceExecuted(address indexed user, uint8 action, uint256 timestamp)'),
            args: { user: address },
            fromBlock,
            toBlock: 'latest',
          });

          for (const log of rebalanceLogs) {
            const args = log.args as any;
            allLogs.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type: 'RebalanceExecuted',
              timestamp: Number(args.timestamp) * 1000,
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              details: `Action: ${actions[args.action] || 'Unknown'}`,
              color: 'green',
            });
          }
        } catch (err) {
          console.warn('Error fetching RebalanceExecuted events:', err);
        }

        // Fetch RebalanceRequested events
        try {
          const requestedLogs = await publicClient.getLogs({
            address: LINKFORGE_CONTRACT.address,
            event: parseAbiItem('event RebalanceRequested(address indexed user, bytes32 indexed requestId, uint256 timestamp)'),
            args: { user: address },
            fromBlock,
            toBlock: 'latest',
          });

          for (const log of requestedLogs) {
            const args = log.args as any;
            allLogs.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type: 'RebalanceRequested',
              timestamp: Number(args.timestamp) * 1000,
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              details: `Request ID: ${args.requestId.slice(0, 10)}...`,
              color: 'amber',
            });
          }
        } catch (err) {
          console.warn('Error fetching RebalanceRequested events:', err);
        }

        // Sort by block number (newest first)
        allLogs.sort((a, b) => Number(b.blockNumber - a.blockNumber));

        setLogs(allLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [address]);

  return { logs, isLoading };
}
