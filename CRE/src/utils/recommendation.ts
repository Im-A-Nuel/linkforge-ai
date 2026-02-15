import type { OffchainSignals } from "../steps/fetchSignals";
import type { ProfileSnapshot } from "../steps/readProfile";
import type { RebalanceAction, WorkflowConfig } from "./types";

export type Recommendation = {
  riskScore: number;
  action: RebalanceAction;
  reason: string;
};

const actionReasonByName: Record<RebalanceAction, string> = {
  HOLD: "Market conditions remain within acceptable risk tolerance.",
  SHIFT_TO_STABLE: "Risk is elevated for this profile. Preserve capital by shifting to stable assets.",
  INCREASE_EXPOSURE: "Risk is controlled and sentiment is positive. Increase growth exposure carefully.",
  DIVERSIFY: "Volatility is high. Diversify allocation to reduce concentration risk.",
};

export const buildRecommendation = (
  profile: ProfileSnapshot,
  signals: OffchainSignals,
  thresholds: WorkflowConfig["thresholds"]
): Recommendation => {
  const negativeSentiment = signals.sentimentScore < 0 ? Math.abs(signals.sentimentScore) : 0;
  const riskScore = Math.min(
    100,
    Math.round(negativeSentiment * 0.4 + signals.volatilityScore * 0.6)
  );

  let action: RebalanceAction = "HOLD";

  // Contract risk enum: 0=LOW, 1=MEDIUM, 2=HIGH
  if (riskScore > thresholds.highRisk && profile.riskLevel === 0) {
    action = "SHIFT_TO_STABLE";
  } else if (signals.volatilityScore > thresholds.highVolatility) {
    action = "DIVERSIFY";
  } else if (riskScore < 30 && profile.riskLevel === 2 && signals.sentimentScore > 30) {
    action = "INCREASE_EXPOSURE";
  }

  return {
    riskScore,
    action,
    reason: actionReasonByName[action],
  };
};
