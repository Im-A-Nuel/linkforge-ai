import { parseAbi } from "viem";

export const LINKFORGE_PROFILE_ABI = parseAbi([
  "function getProfile(address user) view returns (uint8 riskLevel, bool esgPriority, bool automationEnabled, uint256 lastRebalance)"
]);

export type WorkflowConfig = {
  schedule: { schedule: string };
  evm: {
    chainSelectorName: string;
    contractAddress: string;
    userAddress: string;
  };
  apis: {
    fearGreedUrl: string;
    coingeckoUrl: string;
  };
  thresholds: {
    highRisk: number;
    highVolatility: number;
  };
};

export type RebalanceAction =
  | "HOLD"
  | "SHIFT_TO_STABLE"
  | "INCREASE_EXPOSURE"
  | "DIVERSIFY";
