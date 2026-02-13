import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LINKFORGE_CONTRACT, RiskLevel, type UserProfile, type AIReasoning } from '@/lib/contract';

// ============ Read Hooks ============

/**
 * Get user profile from smart contract
 */
export function useUserProfile(address?: `0x${string}`) {
  return useReadContract({
    ...LINKFORGE_CONTRACT,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

/**
 * Get latest AI reasoning for user
 */
export function useLatestReasoning(address?: `0x${string}`) {
  return useReadContract({
    ...LINKFORGE_CONTRACT,
    functionName: 'getLatestReasoning',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
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
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const requestAnalysis = (source: string, args: string[]) => {
    writeContract({
      ...LINKFORGE_CONTRACT,
      functionName: 'requestAIAnalysis',
      args: [source, args],
    });
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
    error,
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
