/**
 * LinkForge AI - CRE Workflow Standalone Simulation
 *
 * Runs the same logic as the CRE workflow orchestrator without requiring
 * CRE CLI login. Useful for local demo and capturing simulation output.
 *
 * Steps:
 *   1. Read user profile from LinkForgeAI contract on Base Sepolia
 *   2. Fetch Fear & Greed Index (sentiment signal)
 *   3. Fetch CoinGecko 24h change data (volatility signal)
 *   4. Build recommendation (HOLD / SHIFT_TO_STABLE / INCREASE_EXPOSURE / DIVERSIFY)
 */

import { createPublicClient, http, parseAbi, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ── Config ─────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(
  readFileSync(join(__dirname, "workflows/config.json"), "utf-8")
);

const CONTRACT_ADDRESS = config.evm.contractAddress as Address;
const USER_ADDRESS = config.evm.userAddress as Address;
const FEAR_GREED_URL = config.apis.fearGreedUrl;
const COINGECKO_URL = config.apis.coingeckoUrl;
const THRESHOLDS = config.thresholds;

// ── ABI ────────────────────────────────────────────────────────────────────
const PROFILE_ABI = parseAbi([
  "function getProfile(address user) view returns (uint8 riskLevel, bool esgPriority, bool automationEnabled, uint256 lastRebalance)",
]);

const RISK_LEVEL_NAMES = ["LOW", "MEDIUM", "HIGH"] as const;

// ── Types ──────────────────────────────────────────────────────────────────
type ProfileSnapshot = {
  riskLevel: number;
  esgPriority: boolean;
  automationEnabled: boolean;
  lastRebalance: bigint;
};

type OffchainSignals = {
  sentimentScore: number;
  volatilityScore: number;
  fearGreedRaw: number;
  ethChange24h: number;
  btcChange24h: number;
  sources?: Record<string, string>;
};

type Recommendation = {
  riskScore: number;
  action: "HOLD" | "SHIFT_TO_STABLE" | "INCREASE_EXPOSURE" | "DIVERSIFY";
  reason: string;
};

const ACTION_REASONS = {
  HOLD: "Market conditions remain within acceptable risk tolerance.",
  SHIFT_TO_STABLE: "Risk is elevated for this profile. Preserve capital by shifting to stable assets.",
  INCREASE_EXPOSURE: "Risk is controlled and sentiment is positive. Increase growth exposure carefully.",
  DIVERSIFY: "Volatility is high. Diversify allocation to reduce concentration risk.",
};

// ── Step 1: Read on-chain profile ──────────────────────────────────────────
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
    riskLevel: result[0],
    esgPriority: result[1],
    automationEnabled: result[2],
    lastRebalance: result[3],
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
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
        console.log(`  ⚠ ${label} unavailable (${msg}) — using fallback value: ${fallback}`);
      }
    }
  }
  return { value: fallback, source: "fallback" };
}

// ── Step 2: Fetch off-chain signals ─────────────────────────────────────────
async function fetchAggregatedSignals(): Promise<OffchainSignals & { sources: Record<string, string> }> {
  console.log(`  → Fetching Fear & Greed Index from ${FEAR_GREED_URL}`);
  const fngResult = await fetchWithFallback(
    "Fear & Greed",
    FEAR_GREED_URL,
    50, // fallback: neutral
    async (res) => {
      const data = (await res.json()) as { data?: Array<{ value?: string }> };
      return Number(data.data?.[0]?.value ?? 50);
    }
  );
  const rawFng = fngResult.value;
  const sentimentScore = Math.round((rawFng - 50) * 2);

  console.log(`  → Fetching CoinGecko 24h price data`);
  const cgResult = await fetchWithFallback(
    "CoinGecko",
    COINGECKO_URL,
    { eth: 0, btc: 0 },
    async (res) => {
      const data = (await res.json()) as {
        ethereum?: { usd_24h_change?: number };
        bitcoin?: { usd_24h_change?: number };
      };
      return {
        eth: data.ethereum?.usd_24h_change ?? 0,
        btc: data.bitcoin?.usd_24h_change ?? 0,
      };
    }
  );
  const ethChange = cgResult.value.eth;
  const btcChange = cgResult.value.btc;
  const avgAbsChange = (Math.abs(ethChange) + Math.abs(btcChange)) / 2;
  const volatilityScore = Math.min(Math.round(avgAbsChange * 20), 100);

  return {
    sentimentScore,
    volatilityScore,
    fearGreedRaw: rawFng,
    ethChange24h: ethChange,
    btcChange24h: btcChange,
    sources: {
      fearGreed: fngResult.source,
      coingecko: cgResult.source,
    },
  };
}

// ── Step 3: Build recommendation ───────────────────────────────────────────
function buildRecommendation(
  profile: ProfileSnapshot,
  signals: OffchainSignals
): Recommendation {
  const negativeSentiment = signals.sentimentScore < 0 ? Math.abs(signals.sentimentScore) : 0;
  const riskScore = Math.min(
    100,
    Math.round(negativeSentiment * 0.4 + signals.volatilityScore * 0.6)
  );

  let action: Recommendation["action"] = "HOLD";
  if (riskScore > THRESHOLDS.highRisk && profile.riskLevel === 0) {
    action = "SHIFT_TO_STABLE";
  } else if (signals.volatilityScore > THRESHOLDS.highVolatility) {
    action = "DIVERSIFY";
  } else if (riskScore < 30 && profile.riskLevel === 2 && signals.sentimentScore > 30) {
    action = "INCREASE_EXPOSURE";
  }

  return { riskScore, action, reason: ACTION_REASONS[action] };
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║      LinkForge AI — CRE Workflow Simulation              ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`Contract : ${CONTRACT_ADDRESS}`);
  console.log(`User     : ${USER_ADDRESS}`);
  console.log(`Chain    : Base Sepolia (chain ID 84532)`);
  console.log(`Schedule : ${config.schedule.schedule}`);
  console.log();

  // Step 1
  console.log("[ Step 1 ] Reading on-chain user profile...");
  const profile = await readUserProfile();
  console.log(`  ✓ riskLevel        = ${profile.riskLevel} (${RISK_LEVEL_NAMES[profile.riskLevel]})`);
  console.log(`  ✓ esgPriority      = ${profile.esgPriority}`);
  console.log(`  ✓ automationEnabled= ${profile.automationEnabled}`);
  console.log(`  ✓ lastRebalance    = ${profile.lastRebalance === 0n ? "never" : new Date(Number(profile.lastRebalance) * 1000).toISOString()}`);
  console.log();

  // Step 2
  console.log("[ Step 2 ] Fetching off-chain market signals...");
  const signals = await fetchAggregatedSignals();
  console.log(`  ✓ Fear & Greed raw = ${signals.fearGreedRaw} / 100 [${signals.sources?.fearGreed ?? "live"}]`);
  console.log(`  ✓ sentimentScore   = ${signals.sentimentScore} (range -100..100)`);
  console.log(`  ✓ ETH 24h change   = ${signals.ethChange24h.toFixed(2)}% [${signals.sources?.coingecko ?? "live"}]`);
  console.log(`  ✓ BTC 24h change   = ${signals.btcChange24h.toFixed(2)}%`);
  console.log(`  ✓ volatilityScore  = ${signals.volatilityScore} / 100`);
  console.log();

  // Step 3
  console.log("[ Step 3 ] Computing recommendation...");
  const rec = buildRecommendation(profile, signals);
  console.log(`  ✓ riskScore        = ${rec.riskScore} / 100`);
  console.log(`  ✓ action           = ${rec.action}`);
  console.log(`  ✓ reason           = ${rec.reason}`);
  console.log();

  // Output
  const output = {
    workflow: "linkforge-ai-orchestrator",
    generatedAt: new Date().toISOString(),
    config: {
      contractAddress: CONTRACT_ADDRESS,
      userAddress: USER_ADDRESS,
      chain: "base-sepolia",
      schedule: config.schedule.schedule,
      thresholds: THRESHOLDS,
    },
    profile: {
      riskLevel: profile.riskLevel,
      riskLevelName: RISK_LEVEL_NAMES[profile.riskLevel],
      esgPriority: profile.esgPriority,
      automationEnabled: profile.automationEnabled,
    },
    signals: {
      fearGreedIndex: signals.fearGreedRaw,
      sentimentScore: signals.sentimentScore,
      volatilityScore: signals.volatilityScore,
      ethChange24h: signals.ethChange24h,
      btcChange24h: signals.btcChange24h,
    },
    recommendation: rec,
  };

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  Simulation Output (JSON)                                ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(JSON.stringify(output, null, 2));

  console.log();
  console.log(`CRE cycle completed user=${USER_ADDRESS} riskLevel=${profile.riskLevel} sentiment=${signals.sentimentScore} volatility=${signals.volatilityScore} action=${rec.action} riskScore=${rec.riskScore}`);
}

main().catch((err) => {
  console.error("✗ Simulation failed:", err);
  process.exit(1);
});
