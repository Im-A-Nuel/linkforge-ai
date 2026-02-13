import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from 'wagmi';
import { useState } from 'react';
import { LINKFORGE_CONTRACT, RiskLevel } from '@/lib/contract';

const INVALID_SUBSCRIPTION_SELECTOR = '0x1f6a65b6';
const USER_REJECT_PATTERNS = ['user rejected', 'user denied', 'user cancelled', 'user canceled'];
const NONCE_PATTERNS = ['nonce too low', 'replacement transaction underpriced', 'already known'];

function extractErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function normalizeContractError(error: unknown): string {
  const raw = extractErrorMessage(error);
  const lower = raw.toLowerCase();

  if (USER_REJECT_PATTERNS.some((pattern) => lower.includes(pattern))) {
    return 'User rejected transaction';
  }

  if (raw.includes(INVALID_SUBSCRIPTION_SELECTOR) || lower.includes('invalidsubscription')) {
    return 'Invalid Chainlink Functions subscription. Update subscriptionId in contract and add this contract as a consumer.';
  }

  if (lower.includes('exceeds maximum per-transaction gas limit')) {
    return 'RPC estimated gas above chain limit. Using fixed gas for this call should avoid this; if it persists, check subscription and DON config.';
  }

  if (NONCE_PATTERNS.some((pattern) => lower.includes(pattern))) {
    return 'Wallet nonce out of sync. Wait a few seconds and retry. If it persists, clear pending activity in MetaMask and refresh this page.';
  }

  return raw;
}

// ABI return types - Viem returns structs as objects, not arrays
type ProfileResult = {
  riskLevel: number;
  esgPriority: boolean;
  automationEnabled: boolean;
  lastRebalance: bigint;
};

// ============ Read Hooks ============

/**
 * Get user profile from smart contract with smart caching
 */
export function useUserProfile(address?: `0x${string}`) {
  const result = useReadContract({
    ...LINKFORGE_CONTRACT,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      // Cache for 30 seconds, then revalidate in background
      staleTime: 30000, // Data stays fresh for 30s
      gcTime: 5 * 60 * 1000, // Cache for 5 minutes
      // Only refetch on window focus or reconnect
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      // Don't poll continuously
      refetchInterval: false,
    },
  });

  return {
    ...result,
    data: result.data as ProfileResult | undefined,
  };
}

// Reasoning result type
type ReasoningResult = {
  sentimentScore: bigint;
  volatilityScore: bigint;
  riskScore: bigint;
  esgScore: bigint;
  recommendedAction: number;
  ipfsHash: string;
  timestamp: bigint;
};

/**
 * Get latest AI reasoning for user
 */
export function useLatestReasoning(address?: `0x${string}`) {
  const result = useReadContract({
    ...LINKFORGE_CONTRACT,
    functionName: 'getLatestReasoning',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    ...result,
    data: result.data as ReasoningResult | undefined,
  };
}

/**
 * Get reasoning history for user
 */
export function useReasoningHistory(address?: `0x${string}`) {
  return useReadContract({
    ...LINKFORGE_CONTRACT,
    functionName: 'getReasoningHistory',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Get latest price for an asset
 */
export function useAssetPrice(asset: string) {
  return useReadContract({
    ...LINKFORGE_CONTRACT,
    functionName: 'getLatestPrice',
    args: [asset],
    query: {
      enabled: !!asset,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });
}

// ============ Write Hooks ============

/**
 * Set user profile (risk level, ESG priority, automation)
 */
export function useSetProfile() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const setProfile = (riskLevel: RiskLevel, esgPriority: boolean, automationEnabled: boolean) => {
    writeContract({
      ...LINKFORGE_CONTRACT,
      functionName: 'setProfile',
      args: [riskLevel, esgPriority, automationEnabled],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    setProfile,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Request AI analysis via Chainlink Functions
 */
export function useRequestAIAnalysis() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestAnalysis = async (source: string, args: string[]) => {
    setErrorMessage(null);
    const payload = {
      ...LINKFORGE_CONTRACT,
      functionName: 'requestAIAnalysis' as const,
      args: [source, args] as const,
      // Explicit gas avoids occasional over-estimation from some RPC/wallet stacks.
      gas: BigInt(1_200_000),
    };

    try {
      return await writeContractAsync(payload);
    } catch (requestError) {
      const firstError = extractErrorMessage(requestError).toLowerCase();

      // Single retry to recover from transient wallet nonce desync.
      if (NONCE_PATTERNS.some((pattern) => firstError.includes(pattern))) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        try {
          return await writeContractAsync(payload);
        } catch (retryError) {
          const normalizedRetry = normalizeContractError(retryError);
          setErrorMessage(normalizedRetry);
          throw new Error(normalizedRetry);
        }
      }

      const normalized = normalizeContractError(requestError);
      setErrorMessage(normalized);
      throw new Error(normalized);
    }
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    requestAnalysis,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    errorMessage: errorMessage ?? (error ? normalizeContractError(error) : null),
  };
}

// ============ Helper Functions ============

/**
 * Format price from contract (handles decimals)
 */
export function formatPrice(price: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = price / divisor;
  const fraction = price % divisor;
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
  return `${whole}.${fractionStr}`;
}

/**
 * Convert RiskLevel enum to string
 */
export function riskLevelToString(level: RiskLevel): string {
  switch (level) {
    case RiskLevel.LOW:
      return 'Low';
    case RiskLevel.MEDIUM:
      return 'Medium';
    case RiskLevel.HIGH:
      return 'High';
    default:
      return 'Unknown';
  }
}

/**
 * Convert string to RiskLevel enum
 */
export function stringToRiskLevel(str: string): RiskLevel {
  switch (str.toLowerCase()) {
    case 'low':
      return RiskLevel.LOW;
    case 'medium':
      return RiskLevel.MEDIUM;
    case 'high':
      return RiskLevel.HIGH;
    default:
      return RiskLevel.MEDIUM;
  }
}

// ============ Event Logs ============

export interface ContractEvent {
  id: string;
  type: string;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: string;
  args: any;
}

/**
 * Watch for contract events in real-time
 */
export function useContractEvents(address?: `0x${string}`) {
  const [events, setEvents] = useState<ContractEvent[]>([]);

  // Watch ProfileUpdated events
  useWatchContractEvent({
    ...LINKFORGE_CONTRACT,
    eventName: 'ProfileUpdated',
    args: address ? { user: address } : undefined,
    onLogs(logs: any) {
      const newEvents = logs.map((log: any) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        type: 'ProfileUpdated',
        timestamp: BigInt(Date.now()),
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        args: log.args,
      }));
      setEvents((prev) => [...newEvents, ...prev]);
    },
  });

  // Watch ReasoningCommitted events
  useWatchContractEvent({
    ...LINKFORGE_CONTRACT,
    eventName: 'ReasoningCommitted',
    args: address ? { user: address } : undefined,
    onLogs(logs: any) {
      const newEvents = logs.map((log: any) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        type: 'ReasoningCommitted',
        timestamp: BigInt(Date.now()),
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        args: log.args,
      }));
      setEvents((prev) => [...newEvents, ...prev]);
    },
  });

  // Watch RebalanceExecuted events
  useWatchContractEvent({
    ...LINKFORGE_CONTRACT,
    eventName: 'RebalanceExecuted',
    args: address ? { user: address } : undefined,
    onLogs(logs: any) {
      const newEvents = logs.map((log: any) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        type: 'RebalanceExecuted',
        timestamp: BigInt(Date.now()),
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        args: log.args,
      }));
      setEvents((prev) => [...newEvents, ...prev]);
    },
  });

  // Watch RebalanceRequested events
  useWatchContractEvent({
    ...LINKFORGE_CONTRACT,
    eventName: 'RebalanceRequested',
    args: address ? { user: address } : undefined,
    onLogs(logs: any) {
      const newEvents = logs.map((log: any) => ({
        id: `${log.transactionHash}-${log.logIndex}`,
        type: 'RebalanceRequested',
        timestamp: BigInt(Date.now()),
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        args: log.args,
      }));
      setEvents((prev) => [...newEvents, ...prev]);
    },
  });

  return events;
}
