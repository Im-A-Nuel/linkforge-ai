import { baseSepolia } from 'viem/chains';
import LinkForgeABI from './LinkForgeAI.abi.json';

export const CONTRACT_ADDRESS = '0x32A00A7244226868653292DF0BdEb48EBbA02D4C' as const;

export const LINKFORGE_CONTRACT = {
  address: CONTRACT_ADDRESS,
  abi: LinkForgeABI,
  chainId: baseSepolia.id,
} as const;

// Risk Level enum (matching contract)
export enum RiskLevel {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

// Rebalance Action enum (matching contract)
export enum RebalanceAction {
  HOLD = 0,
  SHIFT_TO_STABLE = 1,
  INCREASE_EXPOSURE = 2,
  DIVERSIFY = 3,
}

// TypeScript types for contract structs
export interface UserProfile {
  riskLevel: RiskLevel;
  esgPriority: boolean;
  automationEnabled: boolean;
  lastRebalance: bigint;
}

export interface AIReasoning {
  sentimentScore: bigint;
  volatilityScore: bigint;
  riskScore: bigint;
  esgScore: bigint;
  recommendedAction: RebalanceAction;
  ipfsHash: string;
  timestamp: bigint;
}
