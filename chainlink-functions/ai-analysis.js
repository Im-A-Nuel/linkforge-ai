/**
 * Chainlink Functions Source Code for AI Portfolio Analysis
 *
 * This code runs on Chainlink DON (Decentralized Oracle Network)
 * It fetches market data, analyzes portfolio, and returns recommendations
 *
 * Arguments:
 * - args[0]: User address
 * - args[1]: Risk level (0=LOW, 1=MEDIUM, 2=HIGH)
 * - args[2]: ESG priority (true/false)
 */

// === CONFIGURATION ===
const COINGECKO_API = "https://api.coingecko.com/api/v3";
const SENTIMENT_API = "https://api.alternative.me/fng/"; // Crypto Fear & Greed Index

// === HELPER FUNCTIONS ===

/**
 * Fetch market data for major crypto assets
 */
async function fetchMarketData() {
  try {
    const response = await Functions.makeHttpRequest({
      url: `${COINGECKO_API}/simple/price?ids=ethereum,bitcoin,chainlink,usd-coin,dai&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true`,
    });

    if (response.error) {
      throw new Error("Failed to fetch market data");
    }

    return response.data;
  } catch (error) {
    console.error("Market data error:", error);
    return null;
  }
}

/**
 * Fetch crypto sentiment index (Fear & Greed)
 */
async function fetchSentiment() {
  try {
    const response = await Functions.makeHttpRequest({
      url: SENTIMENT_API,
    });

    if (response.error || !response.data?.data?.[0]) {
      throw new Error("Failed to fetch sentiment");
    }

    // Fear & Greed Index: 0-100 (0=Extreme Fear, 100=Extreme Greed)
    const fngValue = parseInt(response.data.data[0].value);

    // Convert to sentiment score: -100 to +100
    // Fear (0-49) → Negative sentiment
    // Greed (50-100) → Positive sentiment
    const sentimentScore = (fngValue - 50) * 2;

    return sentimentScore;
  } catch (error) {
    console.error("Sentiment error:", error);
    return 0; // Neutral if error
  }
}

/**
 * Calculate volatility score based on 24h price changes
 */
function calculateVolatility(marketData) {
  if (!marketData) return 50; // Default medium volatility

  const assets = ['ethereum', 'bitcoin', 'chainlink'];
  let totalVolatility = 0;
  let count = 0;

  for (const asset of assets) {
    if (marketData[asset]?.usd_24h_change) {
      // Higher absolute price change = higher volatility
      const change = Math.abs(marketData[asset].usd_24h_change);
      totalVolatility += change;
      count++;
    }
  }

  if (count === 0) return 50;

  // Average volatility, normalized to 0-100 scale
  const avgVolatility = totalVolatility / count;

  // Scale: 0-5% change = 0-100 volatility score
  const volatilityScore = Math.min(Math.round(avgVolatility * 20), 100);

  return volatilityScore;
}

/**
 * Calculate risk score based on market conditions
 */
function calculateRiskScore(sentimentScore, volatilityScore) {
  // Risk = combination of negative sentiment + high volatility

  // Negative sentiment increases risk
  const sentimentRisk = sentimentScore < 0 ? Math.abs(sentimentScore) : 0;

  // High volatility increases risk
  const volatilityRisk = volatilityScore;

  // Weighted average: 40% sentiment, 60% volatility
  const riskScore = Math.round(sentimentRisk * 0.4 + volatilityRisk * 0.6);

  return Math.min(riskScore, 100);
}

/**
 * Calculate ESG score (simplified - in production use real ESG data)
 */
function calculateESGScore(marketData) {
  // Simplified ESG scoring based on energy efficiency
  // In production: fetch real ESG ratings from APIs

  // Example: Ethereum (PoS) = 80, Bitcoin (PoW) = 30
  const esgScores = {
    ethereum: 80,  // Post-merge PoS
    bitcoin: 30,   // PoW energy intensive
    chainlink: 75, // Oracle network
    'usd-coin': 90, // Stablecoin
    dai: 85,       // Decentralized stablecoin
  };

  // Average ESG score of portfolio
  let totalScore = 0;
  let count = 0;

  for (const [asset, score] of Object.entries(esgScores)) {
    if (marketData && marketData[asset]) {
      totalScore += score;
      count++;
    }
  }

  return count > 0 ? Math.round(totalScore / count) : 70;
}

/**
 * Generate rebalance recommendation based on analysis
 */
function getRebalanceAction(riskScore, volatilityScore, userRiskLevel, esgPriority, sentimentScore) {
  // Actions: 0=HOLD, 1=SHIFT_TO_STABLE, 2=INCREASE_EXPOSURE, 3=DIVERSIFY

  // High risk + low risk tolerance → Shift to stable
  if (riskScore > 70 && userRiskLevel === 0) {
    return 1; // SHIFT_TO_STABLE
  }

  // High volatility → Diversify
  if (volatilityScore > 80) {
    return 3; // DIVERSIFY
  }

  // Low risk + high risk tolerance + positive sentiment → Increase exposure
  if (riskScore < 30 && userRiskLevel === 2 && sentimentScore > 30) {
    return 2; // INCREASE_EXPOSURE
  }

  // Moderate conditions → Hold
  return 0; // HOLD
}

/**
 * Generate reasoning explanation
 */
function generateReasoning(sentimentScore, volatilityScore, riskScore, action) {
  const actionNames = ['HOLD', 'SHIFT_TO_STABLE', 'INCREASE_EXPOSURE', 'DIVERSIFY'];

  let reasoning = `Market Analysis:\n`;
  reasoning += `- Sentiment: ${sentimentScore > 0 ? 'Positive' : 'Negative'} (${sentimentScore})\n`;
  reasoning += `- Volatility: ${volatilityScore > 70 ? 'High' : volatilityScore > 40 ? 'Medium' : 'Low'} (${volatilityScore})\n`;
  reasoning += `- Risk Level: ${riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low'} (${riskScore})\n`;
  reasoning += `\nRecommendation: ${actionNames[action]}\n`;

  // Action-specific reasoning
  switch (action) {
    case 1: // SHIFT_TO_STABLE
      reasoning += `Reason: High risk detected. Consider moving assets to stablecoins (USDC, DAI) to preserve capital.`;
      break;
    case 2: // INCREASE_EXPOSURE
      reasoning += `Reason: Low risk environment with positive sentiment. Good opportunity to increase exposure to growth assets.`;
      break;
    case 3: // DIVERSIFY
      reasoning += `Reason: High volatility detected. Diversify across multiple assets to reduce portfolio risk.`;
      break;
    default: // HOLD
      reasoning += `Reason: Market conditions are stable. Maintain current allocation.`;
  }

  return reasoning;
}

// === MAIN EXECUTION ===

// Parse arguments
const userAddress = args[0];
const userRiskLevel = parseInt(args[1]); // 0=LOW, 1=MEDIUM, 2=HIGH
const esgPriority = args[2] === "true";

console.log(`Analyzing portfolio for user: ${userAddress}`);
console.log(`Risk Level: ${userRiskLevel}, ESG Priority: ${esgPriority}`);

// 1. Fetch market data
const marketData = await fetchMarketData();
if (!marketData) {
  throw new Error("Failed to fetch market data");
}

// 2. Fetch sentiment
const sentimentScore = await fetchSentiment();

// 3. Calculate scores
const volatilityScore = calculateVolatility(marketData);
const riskScore = calculateRiskScore(sentimentScore, volatilityScore);
const esgScore = calculateESGScore(marketData);

// 4. Generate recommendation
const recommendedAction = getRebalanceAction(
  riskScore,
  volatilityScore,
  userRiskLevel,
  esgPriority,
  sentimentScore
);

// 5. Generate reasoning text
const reasoning = generateReasoning(sentimentScore, volatilityScore, riskScore, recommendedAction);

console.log("Analysis complete:", {
  sentimentScore,
  volatilityScore,
  riskScore,
  esgScore,
  recommendedAction,
});

// 6. Encode response
// Solidity decode shape:
// (int256 sentimentScore, uint256 volatilityScore, uint256 riskScore, uint256 esgScore, uint256 actionIndex, string ipfsHash)
const concatBytes = (...parts) => {
  let totalLength = 0;
  for (const part of parts) totalLength += part.length;

  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

// Use empty ipfsHash so response stays compact:
// words: [sentiment, volatility, risk, esg, action, offset=192, length=0]
const response = concatBytes(
  Functions.encodeInt256(BigInt(sentimentScore) * 100n),
  Functions.encodeUint256(BigInt(volatilityScore)),
  Functions.encodeUint256(BigInt(riskScore)),
  Functions.encodeUint256(BigInt(esgScore)),
  Functions.encodeUint256(BigInt(recommendedAction)),
  Functions.encodeUint256(192n),
  Functions.encodeUint256(0n)
);

return response;
