import { cre, Runner, sendErrorResponse, type Runtime, type Workflow } from "@chainlink/cre-sdk";
import { z } from "zod";
import { fetchAggregatedSignals } from "../src/steps/fetchSignals";
import { readUserProfile } from "../src/steps/readProfile";
import { buildRecommendation } from "../src/utils/recommendation";
import type { WorkflowConfig } from "../src/utils/types";

const configSchema = z.object({
  schedule: z.object({
    schedule: z.string(),
  }),
  evm: z.object({
    chainSelectorName: z.string(),
    contractAddress: z.string(),
    userAddress: z.string(),
  }),
  apis: z.object({
    fearGreedUrl: z.string().url(),
    coingeckoUrl: z.string().url(),
  }),
  thresholds: z.object({
    highRisk: z.number().min(0).max(100),
    highVolatility: z.number().min(0).max(100),
  }),
});

const onCronTrigger = (runtime: Runtime<WorkflowConfig>) => {
  const profile = readUserProfile(runtime);
  const signals = fetchAggregatedSignals(runtime);
  const recommendation = buildRecommendation(profile, signals, runtime.config.thresholds);

  runtime.log(
    `CRE cycle completed user=${runtime.config.evm.userAddress} riskLevel=${profile.riskLevel} sentiment=${signals.sentimentScore} volatility=${signals.volatilityScore} action=${recommendation.action} riskScore=${recommendation.riskScore}`
  );

  return {
    profile,
    signals,
    recommendation,
    generatedAt: new Date().toISOString(),
  };
};

function initWorkflow(config: WorkflowConfig): Workflow<WorkflowConfig> {
  const cronCapability = new cre.capabilities.CronCapability();
  const trigger = cronCapability.trigger(config.schedule);
  return [cre.handler(trigger, (runtime) => onCronTrigger(runtime))];
}

async function main() {
  const runner = await Runner.newRunner<WorkflowConfig>({ configSchema });
  await runner.run(initWorkflow);
}

main().catch(sendErrorResponse);
