/**
 * LinkForge AI — CRE Workflow Standalone Simulation
 *
 * Mirrors the production CRE orchestrator logic without requiring CRE CLI login.
 * Useful for local demos and capturing simulation output for hackathon submission.
 *
 * Decision pipeline (same as Chainlink Functions on-chain execution):
 *   1. Read user profile    from LinkForgeAI contract on Base Sepolia
 *   2. Fetch market signals   (Fear & Greed Index + CoinGecko 24h price data)
 *   3. Compute risk scores    (sentiment, volatility, composite risk)
 *   4. Deepseek V3.1 decision via EigenAI API  (primary)
 *      GPT-4o-mini decision  via OpenAI API    (secondary)
 *      Rule-based fallback                      (if both unavailable)
 *
 * Usage:
 *   EIGENAI_API_KEY=sk-e6... node --experimental-strip-types simulate-standalone.ts
 *   OPENAI_API_KEY=sk-...   node --experimental-strip-types simulate-standalone.ts
 */

import { createPublicClient, http, parseAbi, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ── Config ───────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(
  readFileSync(join(__dirname, "workflows/config.json"), "utf-8")
);

const CONTRACT_ADDRESS = config.evm.contractAddress as Address;
const USER_ADDRESS     = config.evm.userAddress     as Address;
const FEAR_GREED_URL   = config.apis.fearGreedUrl;
const COINGECKO_URL    = config.apis.coingeckoUrl;
const THRESHOLDS       = config.thresholds;

// LLM provider selection — EigenAI (Deepseek V3.1) preferred, OpenAI as fallback
const EIGENAI_API_KEY  = process.env.EIGENAI_API_KEY ?? "";
const OPENAI_API_KEY   = process.env.OPENAI_API_KEY  ?? "";

const LLM = EIGENAI_API_KEY
  ? {
      key:      EIGENAI_API_KEY,
      url:      "https://api-web.eigenai.com/api/v1/chat/completions",
      model:    "deepseek-v31-terminus",
      provider: "EigenAI · Deepseek V3.1",
    }
  : OPENAI_API_KEY
  ? {
      key:      OPENAI_API_KEY,
      url:      "https://api.openai.com/v1/chat/completions",
      model:    "gpt-4o-mini",
      provider: "OpenAI · GPT-4o-mini",
    }
  : null;

// ── ABI ──────────────────────────────────────────────────────────────────────
const PROFILE_ABI = parseAbi([
  "function getProfile(address user) view returns (uint8 riskLevel, bool esgPriority, bool automationEnabled, uint256 lastRebalance)",
]);

const RISK_LEVEL_NAMES = ["LOW", "MEDIUM", "HIGH"] as const;
type RiskLevelName = typeof RISK_LEVEL_NAMES[number];

// ── Types ────────────────────────────────────────────────────────────────────
type ProfileSnapshot = {
  riskLevel: number;
  esgPriority: boolean;
  automationEnabled: boolean;
  lastRebalance: bigint;
};

type OffchainSignals = {
  fearGreedRaw: number;
  sentimentScore: number;
  ethChange24h: number;
  btcChange24h: number;
  volatilityScore: number;
  sources: Record<string, string>;
};

type ActionCode = "HOLD" | "SHIFT_TO_STABLE" | "INCREASE_EXPOSURE" | "DIVERSIFY";

type Recommendation = {
  riskScore: number;
  action: ActionCode;
  reason: string;
  decisionSource: "llm" | "rule-based";
};

const ACTION_INDEX: Record<number, ActionCode> = {
  0: "HOLD",
  1: "SHIFT_TO_STABLE",
  2: "INCREASE_EXPOSURE",
  3: "DIVERSIFY",
};

const ACTION_REASONS: Record<ActionCode, string> = {
  HOLD:              "Market conditions remain within acceptable risk tolerance.",
  SHIFT_TO_STABLE:   "Risk is elevated for this profile. Preserve capital by shifting to stable assets.",
  INCREASE_EXPOSURE: "Risk is controlled and sentiment is positive. Increase growth exposure carefully.",
  DIVERSIFY:         "Volatility is high. Diversify allocation to reduce concentration risk.",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithFallback<T>(
  label: string,
  url: string,
  fallback: T,
  parse: (res: Response) => Promise<T>
): Promise<{ value: T; source: "live" | "fallback" }> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url, 8000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { value: await parse(res), source: "live" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < 2) {
        console.log(`  ⚠ ${label} attempt ${attempt} failed (${msg}), retrying...`);
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        console.log(`  ⚠ ${label} unavailable (${msg}) — using fallback`);
      }
    }
  }
  return { value: fallback, source: "fallback" };
}

// ── Step 1: Read on-chain profile ────────────────────────────────────────────
async function readUserProfile(): Promise<ProfileSnapshot> {
  console.log("  → Connecting to Base Sepolia RPC...");
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  console.log(`  → Calling getProfile(${USER_ADDRESS}) on ${CONTRACT_ADDRESS}`);
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: PROFILE_ABI,
    functionName: "getProfile",
    args: [USER_ADDRESS],
  });

  return {
    riskLevel:         result[0],
    esgPriority:       result[1],
    automationEnabled: result[2],
    lastRebalance:     result[3],
  };
}

// ── Step 2: Fetch off-chain market signals ────────────────────────────────────
async function fetchAggregatedSignals(): Promise<OffchainSignals> {
  console.log(`  → Fetching Fear & Greed Index from ${FEAR_GREED_URL}`);
  const fngResult = await fetchWithFallback(
    "Fear & Greed",
    FEAR_GREED_URL,
    50,
    async (res) => {
      const data = (await res.json()) as { data?: Array<{ value?: string }> };
      return Number(data.data?.[0]?.value ?? 50);
    }
  );

  console.log("  → Fetching CoinGecko 24h price data");
  const cgResult = await fetchWithFallback(
    "CoinGecko",
    COINGECKO_URL,
    { eth: 0, btc: 0 },
    async (res) => {
      const data = (await res.json()) as {
        ethereum?: { usd_24h_change?: number };
        bitcoin?:  { usd_24h_change?: number };
      };
      return {
        eth: data.ethereum?.usd_24h_change ?? 0,
        btc: data.bitcoin?.usd_24h_change  ?? 0,
      };
    }
  );

  const fearGreedRaw   = fngResult.value;
  const sentimentScore = Math.round((fearGreedRaw - 50) * 2);
  const ethChange24h   = cgResult.value.eth;
  const btcChange24h   = cgResult.value.btc;
  const volatilityScore = Math.min(
    Math.round((Math.abs(ethChange24h) + Math.abs(btcChange24h)) / 2 * 20),
    100
  );

  return {
    fearGreedRaw,
    sentimentScore,
    ethChange24h,
    btcChange24h,
    volatilityScore,
    sources: {
      fearGreed: fngResult.source,
      coingecko: cgResult.source,
    },
  };
}

// ── Step 3: Compute risk score ────────────────────────────────────────────────
function computeRiskScore(signals: OffchainSignals): number {
  const negativeSentiment = signals.sentimentScore < 0 ? Math.abs(signals.sentimentScore) : 0;
  return Math.min(
    100,
    Math.round(negativeSentiment * 0.4 + signals.volatilityScore * 0.6)
  );
}

// ── Step 4a: Rule-based fallback decision ─────────────────────────────────────
function ruleBasedDecision(
  profile: ProfileSnapshot,
  signals: OffchainSignals,
  riskScore: number
): ActionCode {
  if (riskScore > THRESHOLDS.highRisk && profile.riskLevel === 0) return "SHIFT_TO_STABLE";
  if (signals.volatilityScore > THRESHOLDS.highVolatility)          return "DIVERSIFY";
  if (riskScore < 30 && profile.riskLevel === 2 && signals.sentimentScore > 30) return "INCREASE_EXPOSURE";
  return "HOLD";
}

// ── Step 4b: LLM AI decision (EigenAI · Deepseek V3.1 or OpenAI · GPT-4o-mini) ──
async function llmDecision(
  profile: ProfileSnapshot,
  signals: OffchainSignals,
  riskScore: number
): Promise<{ action: ActionCode; reason: string; source: "llm" | "rule-based" }> {
  const fallbackAction = ruleBasedDecision(profile, signals, riskScore);
  const fallback = {
    action: fallbackAction,
    reason: ACTION_REASONS[fallbackAction],
    source: "rule-based" as const,
  };

  if (!LLM) {
    console.log("  ⚠ No LLM API key set — using rule-based fallback");
    console.log("    (Set EIGENAI_API_KEY or OPENAI_API_KEY to enable AI decisions)");
    return fallback;
  }

  const riskName: RiskLevelName = RISK_LEVEL_NAMES[profile.riskLevel] ?? "MEDIUM";
  const fng = signals.fearGreedRaw;

  const prompt =
    `You are an autonomous DeFi portfolio risk manager embedded in a Chainlink Runtime Environment (CRE) workflow. ` +
    `You receive live market signals and make on-chain portfolio rebalancing decisions.\n\n` +
    `Real-time Market Data:\n` +
    `- Fear & Greed Index: ${fng}/100 ` +
      `(${fng < 25 ? "Extreme Fear" : fng < 45 ? "Fear" : fng < 55 ? "Neutral" : fng < 75 ? "Greed" : "Extreme Greed"})\n` +
    `- Market Sentiment Score: ${signals.sentimentScore} (range: −100 to +100)\n` +
    `- ETH 24h Price Change: ${signals.ethChange24h.toFixed(2)}%\n` +
    `- BTC 24h Price Change: ${signals.btcChange24h.toFixed(2)}%\n` +
    `- Composite Volatility Score: ${signals.volatilityScore}/100\n` +
    `- Composite Risk Score: ${riskScore}/100\n\n` +
    `User Portfolio Profile:\n` +
    `- Risk Tolerance: ${riskName}\n` +
    `- ESG Priority: ${profile.esgPriority ? "Yes (sustainable assets preferred)" : "No"}\n` +
    `- Chainlink Automation: ${profile.automationEnabled ? "Enabled" : "Disabled"}\n\n` +
    `Portfolio Actions — choose exactly ONE:\n` +
    `0 = HOLD              (conditions acceptable, maintain current allocation)\n` +
    `1 = SHIFT_TO_STABLE   (elevated risk detected, move to stablecoins: USDC, DAI)\n` +
    `2 = INCREASE_EXPOSURE (constructive setup, gradually add growth asset exposure)\n` +
    `3 = DIVERSIFY         (high volatility, spread across assets, reduce concentration)\n\n` +
    `Respond with ONLY valid JSON (no other text): {"action": <0-3>, "reasoning": "<one concise sentence>"}`;

  try {
    console.log(`  → Calling ${LLM.provider}...`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    const body: Record<string, unknown> = {
      model:       LLM.model,
      messages:    [{ role: "user", content: prompt }],
      max_tokens:  180,
      temperature: 0.1,
    };

    // EigenAI-specific: disable chain-of-thought to get clean JSON output
    if (EIGENAI_API_KEY) {
      body.chat_template_kwargs = { thinking: false };
    }

    const res = await fetch(LLM.url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LLM.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`${LLM.provider} returned HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      model: string;
      choices: Array<{ message: { content: string } }>;
      usage?: { total_tokens: number };
    };

    const content = data.choices[0]?.message?.content?.trim();
    if (!content) throw new Error(`Empty response from ${LLM.provider}`);

    // Strip markdown code fences if present (some models wrap JSON in ```json ... ```)
    const jsonText = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const parsed = JSON.parse(jsonText) as { action: number; reasoning?: string };

    if (typeof parsed.action !== "number" || parsed.action < 0 || parsed.action > 3) {
      throw new Error(`Invalid action index: ${parsed.action}`);
    }

    const actionCode = ACTION_INDEX[Math.round(parsed.action)];
    return {
      action: actionCode,
      reason: parsed.reasoning ?? ACTION_REASONS[actionCode],
      source: "llm",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  ⚠ ${LLM.provider} call failed (${msg}) — using rule-based fallback`);
    return fallback;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║      LinkForge AI — CRE Workflow Simulation              ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`Contract : ${CONTRACT_ADDRESS}`);
  console.log(`User     : ${USER_ADDRESS}`);
  console.log(`Chain    : Base Sepolia (chain ID 84532)`);
  console.log(`Schedule : ${config.schedule.schedule}`);
  console.log(`AI Model : ${LLM ? LLM.provider : "rule-based fallback (no API key set)"}`);
  console.log();

  // ── Step 1 ─────────────────────────────────────────────────────────────────
  console.log("[ Step 1 ] Reading on-chain user profile...");
  const profile = await readUserProfile();
  console.log(`  ✓ riskLevel         = ${profile.riskLevel} (${RISK_LEVEL_NAMES[profile.riskLevel]})`);
  console.log(`  ✓ esgPriority       = ${profile.esgPriority}`);
  console.log(`  ✓ automationEnabled = ${profile.automationEnabled}`);
  console.log(`  ✓ lastRebalance     = ${profile.lastRebalance === 0n ? "never" : new Date(Number(profile.lastRebalance) * 1000).toISOString()}`);
  console.log();

  // ── Step 2 ─────────────────────────────────────────────────────────────────
  console.log("[ Step 2 ] Fetching off-chain market signals...");
  const signals = await fetchAggregatedSignals();
  console.log(`  ✓ Fear & Greed raw  = ${signals.fearGreedRaw}/100  [${signals.sources.fearGreed}]`);
  console.log(`  ✓ sentimentScore    = ${signals.sentimentScore}  (range −100..+100)`);
  console.log(`  ✓ ETH 24h change    = ${signals.ethChange24h.toFixed(2)}%  [${signals.sources.coingecko}]`);
  console.log(`  ✓ BTC 24h change    = ${signals.btcChange24h.toFixed(2)}%`);
  console.log(`  ✓ volatilityScore   = ${signals.volatilityScore}/100`);
  console.log();

  // ── Step 3 ─────────────────────────────────────────────────────────────────
  console.log("[ Step 3 ] Computing composite risk score...");
  const riskScore = computeRiskScore(signals);
  console.log(`  ✓ riskScore         = ${riskScore}/100`);
  console.log(`    formula: (negativeSentiment × 0.4) + (volatility × 0.6)`);
  console.log();

  // ── Step 4 ─────────────────────────────────────────────────────────────────
  console.log(`[ Step 4 ] AI decision engine (${LLM ? LLM.provider : "rule-based"})...`);
  const decision = await llmDecision(profile, signals, riskScore);
  console.log(`  ✓ decision source   = ${decision.source.toUpperCase()}`);
  console.log(`  ✓ action            = ${decision.action}`);
  console.log(`  ✓ reasoning         = "${decision.reason}"`);
  console.log();

  // ── Output ─────────────────────────────────────────────────────────────────
  const output = {
    workflow:    "linkforge-ai-orchestrator",
    generatedAt: new Date().toISOString(),
    config: {
      contractAddress: CONTRACT_ADDRESS,
      userAddress:     USER_ADDRESS,
      chain:           "base-sepolia",
      schedule:        config.schedule.schedule,
      thresholds:      THRESHOLDS,
    },
    profile: {
      riskLevel:         profile.riskLevel,
      riskLevelName:     RISK_LEVEL_NAMES[profile.riskLevel],
      esgPriority:       profile.esgPriority,
      automationEnabled: profile.automationEnabled,
    },
    signals: {
      fearGreedIndex:   signals.fearGreedRaw,
      sentimentScore:   signals.sentimentScore,
      volatilityScore:  signals.volatilityScore,
      ethChange24h:     signals.ethChange24h,
      btcChange24h:     signals.btcChange24h,
      sources:          signals.sources,
    },
    recommendation: {
      riskScore,
      action:         decision.action,
      reason:         decision.reason,
      decisionSource: decision.source,
    },
  };

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  Simulation Output (JSON)                                ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(JSON.stringify(output, null, 2));

  console.log();
  console.log(
    `CRE cycle completed  user=${USER_ADDRESS}  riskLevel=${profile.riskLevel}` +
    `  sentiment=${signals.sentimentScore}  volatility=${signals.volatilityScore}` +
    `  action=${decision.action}  riskScore=${riskScore}  source=${decision.source}`
  );
}

main().catch((err) => {
  console.error("✗ Simulation failed:", err);
  process.exit(1);
});
