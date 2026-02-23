/**
 * LinkForge AI — Chainlink Functions Source
 *
 * Runs on the Chainlink Decentralized Oracle Network (DON).
 * Each DON node executes this script independently; results are aggregated
 * via off-chain consensus before the on-chain callback fires.
 *
 * Decision pipeline:
 *   1. Fetch real-time market signals  (CoinGecko + Fear & Greed Index)
 *   2. Compute quantitative risk scores (sentiment, volatility, composite risk)
 *   3. Call Deepseek V3.1 (EigenAI) for AI-powered portfolio decision
 *   4. Fall back to rule-based logic   if LLM call fails
 *   5. ABI-encode response             for on-chain storage
 *
 * Arguments:
 *   args[0]  User wallet address
 *   args[1]  Risk level  (0 = LOW, 1 = MEDIUM, 2 = HIGH)
 *   args[2]  ESG priority ("true" / "false")
 *
 * DON-hosted Secrets (set via Chainlink Functions CLI):
 *   secrets.eigenaiKey  — EigenAI API key (sk-e6...)
 */

// ── 0. Parse arguments ───────────────────────────────────────────────────────
const userAddress  = args[0];
const userRiskLevel = parseInt(args[1]);   // 0 | 1 | 2
const esgPriority  = args[2] === "true";
const RISK_NAMES   = ["LOW", "MEDIUM", "HIGH"];

// ── 1. Fetch market signals ──────────────────────────────────────────────────
const [marketRes, sentimentRes] = await Promise.all([
  Functions.makeHttpRequest({
    url: "https://api.coingecko.com/api/v3/simple/price" +
         "?ids=ethereum,bitcoin&vs_currencies=usd&include_24hr_change=true",
  }),
  Functions.makeHttpRequest({
    url: "https://api.alternative.me/fng/",
  }),
]);

if (marketRes.error || !marketRes.data) {
  throw new Error("CoinGecko fetch failed");
}

// Fear & Greed Index: 0–100 → sentiment score: –100..+100
const fearGreedRaw  = sentimentRes.error ? 50 : parseInt(sentimentRes.data.data[0].value);
const sentimentScore = (fearGreedRaw - 50) * 2;

const ethChange24h  = marketRes.data.ethereum?.usd_24h_change ?? 0;
const btcChange24h  = marketRes.data.bitcoin?.usd_24h_change  ?? 0;

// Volatility: mean absolute 24h change, scaled 0–100
const volatilityScore = Math.min(
  Math.round((Math.abs(ethChange24h) + Math.abs(btcChange24h)) / 2 * 20),
  100
);

// Composite risk: negative sentiment (40%) + volatility (60%)
const negativeSentiment = sentimentScore < 0 ? Math.abs(sentimentScore) : 0;
const riskScore = Math.min(
  Math.round(negativeSentiment * 0.4 + volatilityScore * 0.6),
  100
);

// ESG score: static simplified weighting (Ethereum PoS, BTC PoW)
const esgScore = esgPriority ? 78 : 60;

// ── 2. Rule-based fallback decision ─────────────────────────────────────────
// Used when LLM is unavailable (no secret configured or API error).
let action =
  riskScore > 70 && userRiskLevel === 0 ? 1   // SHIFT_TO_STABLE
  : volatilityScore > 80                ? 3   // DIVERSIFY
  : riskScore < 30 && userRiskLevel === 2 && sentimentScore > 30 ? 2  // INCREASE_EXPOSURE
  : 0;                                                               // HOLD

const ACTION_REASONS = [
  "Conditions are within acceptable risk tolerance.",
  "Risk is elevated; shift part of the portfolio to stable assets.",
  "Risk is controlled and sentiment is positive; increase exposure gradually.",
  "Volatility is high; diversify to reduce concentration risk.",
];
let reasonText = ACTION_REASONS[action];

// ── 3. Deepseek V3.1 AI decision (via EigenAI DON-hosted secret) ─────────────
if (secrets.eigenaiKey) {
  const prompt =
    `You are an autonomous DeFi portfolio risk manager embedded in a Chainlink Runtime Environment (CRE) workflow. ` +
    `You receive live market signals and make portfolio rebalancing decisions for a Web3 user.\n\n` +
    `Real-time Market Data:\n` +
    `- Fear & Greed Index: ${fearGreedRaw}/100 ` +
      `(${fearGreedRaw < 25 ? "Extreme Fear" : fearGreedRaw < 45 ? "Fear" : fearGreedRaw < 55 ? "Neutral" : fearGreedRaw < 75 ? "Greed" : "Extreme Greed"})\n` +
    `- Market Sentiment: ${sentimentScore} (range −100 to +100)\n` +
    `- ETH 24h Change: ${ethChange24h.toFixed(2)}%\n` +
    `- BTC 24h Change: ${btcChange24h.toFixed(2)}%\n` +
    `- Volatility Score: ${volatilityScore}/100\n` +
    `- Composite Risk Score: ${riskScore}/100\n\n` +
    `User Portfolio Profile:\n` +
    `- Risk Tolerance: ${RISK_NAMES[userRiskLevel] ?? "MEDIUM"}\n` +
    `- ESG Priority: ${esgPriority ? "Yes (sustainable assets preferred)" : "No"}\n\n` +
    `Portfolio Actions — choose exactly ONE:\n` +
    `0 = HOLD              (conditions acceptable, maintain current allocation)\n` +
    `1 = SHIFT_TO_STABLE   (elevated risk, move to stablecoins: USDC, DAI)\n` +
    `2 = INCREASE_EXPOSURE (opportunity window, add growth assets carefully)\n` +
    `3 = DIVERSIFY         (high volatility, spread across assets)\n\n` +
    `Respond with ONLY valid JSON, no other text: {"a":<0-3>,"r":"<short reason>"}`;

  const aiRes = await Functions.makeHttpRequest({
    url: "https://api-web.eigenai.com/api/v1/chat/completions",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${secrets.eigenaiKey}`,
      "Content-Type": "application/json",
    },
    data: {
      model: "deepseek-v31-terminus",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 120,
      temperature: 0.1,  // low temp → highly deterministic across DON nodes
      chat_template_kwargs: { thinking: false },  // disable CoT for clean JSON output
    },
  });

  if (!aiRes.error) {
    try {
      const raw = aiRes.data.choices[0].message.content.trim()
        .replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
      const parsed = JSON.parse(raw);
      if (typeof parsed.a === "number" && parsed.a >= 0 && parsed.a <= 3) {
        action = Math.round(parsed.a);
        reasonText = ACTION_REASONS[action];
      }
      if (typeof parsed.r === "string") {
        const cleaned = parsed.r.replace(/\s+/g, " ").trim();
        if (cleaned) reasonText = cleaned;
      }
    } catch (_) {
      // LLM parse error → keep rule-based action
    }
  }
}

// ── 4. ABI-encode response ───────────────────────────────────────────────────
// Solidity tuple: (int256 sentimentScore, uint256 volatilityScore, uint256 riskScore,
//                  uint256 esgScore, uint256 actionIndex, string ipfsHash)
const concat = (...parts) => {
  let totalLen = 0;
  for (const p of parts) totalLen += p.length;
  const out = new Uint8Array(totalLen);
  let offset = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  return out;
};

const enc  = (v) => Functions.encodeUint256(BigInt(v));
const encI = (v) => Functions.encodeInt256(BigInt(Math.round(v)));
const shortReason = (s) => s
  .replace(/[^a-zA-Z0-9 ,.;:!?-]/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const packedReason = (shortReason(reasonText) || shortReason(ACTION_REASONS[action]) || "Risk controls active.")
  .slice(0, 30);
const encStr = (str) => {
  let text = new TextEncoder().encode(str);
  if (text.length > 32) text = text.slice(0, 32);
  const out = new Uint8Array(64);
  out.set(enc(text.length), 0);
  out.set(text, 32);
  return out;
};

return concat(
  encI(sentimentScore * 100),   // int256  — multiplied ×100 to preserve decimal
  enc(volatilityScore),          // uint256
  enc(riskScore),                // uint256
  enc(esgScore),                 // uint256
  enc(action),                   // uint256 — 0/1/2/3
  enc(192),                      // uint256 — ABI string offset
  encStr(`r:${packedReason}`),    // fixed-size packed reason (keeps response <= 256 bytes)
);
