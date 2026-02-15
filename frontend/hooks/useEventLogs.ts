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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Get current block
        const currentBlock = await publicClient.getBlockNumber();

        // Query in smaller chunks to avoid RPC limits
        const BLOCK_RANGE = BigInt(2000); // Safe range for Base Sepolia
        const fromBlock = currentBlock > BLOCK_RANGE ? currentBlock - BLOCK_RANGE : BigInt(0);

        const allLogs: EventLog[] = [];
        const blockTimestampCache = new Map<string, number>();

        const resolveBlockTimestamp = async (blockNumber?: bigint | null): Promise<number> => {
          if (blockNumber == null) {
            return Date.now();
          }

          const cacheKey = blockNumber.toString();
          const cachedTimestamp = blockTimestampCache.get(cacheKey);
          if (cachedTimestamp !== undefined) {
            return cachedTimestamp;
          }

          try {
            const block = await publicClient.getBlock({ blockNumber });
            const timestamp = Number(block.timestamp) * 1000;
            blockTimestampCache.set(cacheKey, timestamp);
            return timestamp;
          } catch (timestampError) {
            console.warn(`Error fetching block timestamp for ${cacheKey}:`, timestampError);
            return Date.now();
          }
        };

        // Helper to format logs
        const riskLevels = ['Low', 'Medium', 'High'];
        const actions = ['HOLD', 'SHIFT_TO_STABLE', 'INCREASE_EXPOSURE', 'DIVERSIFY'];

        type ProfileUpdatedArgs = {
          riskLevel?: number | bigint;
          esgPriority?: boolean;
          automationEnabled?: boolean;
        };
        type ReasoningCommittedArgs = {
          sentimentScore?: number | bigint;
          volatilityScore?: number | bigint;
          recommendedAction?: number | bigint;
          timestamp?: number | bigint;
        };
        type RebalanceExecutedArgs = {
          action?: number | bigint;
          timestamp?: number | bigint;
        };
        type RebalanceRequestedArgs = {
          requestId?: `0x${string}`;
          timestamp?: number | bigint;
        };
        const toNumber = (value: number | bigint | undefined): number => {
          if (value === undefined) return 0;
          return typeof value === 'bigint' ? Number(value) : value;
        };
        const toTimestampMs = (value: number | bigint | undefined): number => {
          const timestamp = toNumber(value);
          return timestamp > 0 ? timestamp * 1000 : Date.now();
        };

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
            const args = (log.args ?? {}) as ProfileUpdatedArgs;
            const riskLevel = toNumber(args.riskLevel);
            allLogs.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type: 'ProfileUpdated',
              timestamp: await resolveBlockTimestamp(log.blockNumber),
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              details: `Risk: ${riskLevels[riskLevel] || 'Unknown'}, ESG: ${args.esgPriority ? 'Enabled' : 'Disabled'}, Auto: ${args.automationEnabled ? 'Enabled' : 'Disabled'}`,
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
            const args = (log.args ?? {}) as ReasoningCommittedArgs;
            const recommendedAction = toNumber(args.recommendedAction);
            allLogs.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type: 'ReasoningCommitted',
              timestamp: toTimestampMs(args.timestamp),
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              details: `Action: ${actions[recommendedAction] || 'Unknown'}, Sentiment: ${toNumber(args.sentimentScore)}, Volatility: ${toNumber(args.volatilityScore)}`,
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
            const args = (log.args ?? {}) as RebalanceExecutedArgs;
            const action = toNumber(args.action);
            allLogs.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type: 'RebalanceExecuted',
              timestamp: toTimestampMs(args.timestamp),
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              details: `Action: ${actions[action] || 'Unknown'}`,
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
            const args = (log.args ?? {}) as RebalanceRequestedArgs;
            const requestIdPreview = args.requestId ? `${args.requestId.slice(0, 10)}...` : 'N/A';
            allLogs.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type: 'RebalanceRequested',
              timestamp: toTimestampMs(args.timestamp),
              blockNumber: log.blockNumber,
              transactionHash: log.transactionHash,
              details: `Request ID: ${requestIdPreview}`,
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
        setErrorMessage('Failed to fetch on-chain logs. Please refresh in a few moments.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [address]);

  return { logs, isLoading, errorMessage };
}
