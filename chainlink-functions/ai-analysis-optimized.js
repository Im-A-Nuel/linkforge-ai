/**
 * Optimized Chainlink Functions Source - AI Portfolio Analysis
 * Size: ~3KB (fits in gas limits)
 */

const [addr, risk, esg] = [args[0], parseInt(args[1]), args[2] === "true"];

// Fetch market data
const market = await Functions.makeHttpRequest({
  url: "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,chainlink&vs_currencies=usd&include_24hr_change=true"
});

// Fetch sentiment
const sent = await Functions.makeHttpRequest({
  url: "https://api.alternative.me/fng/"
});

if (market.error || !market.data) throw Error("Market fetch failed");

// Calculate scores
const sentiment = sent.error ? 0 : (parseInt(sent.data.data[0].value) - 50) * 2;

const volatility = (() => {
  const assets = ["ethereum", "bitcoin", "chainlink"];
  let sum = 0, count = 0;
  for (const a of assets) {
    const chg = market.data[a]?.usd_24h_change;
    if (chg) { sum += Math.abs(chg); count++; }
  }
  return count ? Math.min(Math.round(sum / count * 20), 100) : 50;
})();

const riskScore = Math.min(Math.round((sentiment < 0 ? Math.abs(sentiment) : 0) * 0.4 + volatility * 0.6), 100);

const esgScore = 75; // Simplified

// Recommend action
let action = 0; // HOLD
if (riskScore > 70 && risk === 0) action = 1; // SHIFT_TO_STABLE
else if (volatility > 80) action = 3; // DIVERSIFY
else if (riskScore < 30 && risk === 2 && sentiment > 30) action = 2; // INCREASE_EXPOSURE

// Encode response for solidity tuple:
// (int256 sentimentScore, uint256 volatilityScore, uint256 riskScore, uint256 esgScore, uint256 action, string ipfsHash)
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

const enc = (v) => Functions.encodeUint256(BigInt(v));
const encInt = (v) => Functions.encodeInt256(BigInt(Math.round(v)));

return concatBytes(
  encInt(sentiment * 100),
  enc(volatility),
  enc(riskScore),
  enc(esgScore),
  enc(action),
  enc(192),
  enc(0)
);
