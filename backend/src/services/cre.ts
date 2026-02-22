/**
 * CRE Recommendation Service
 * Replicates the CRE workflow logic from CRE/simulate-standalone.ts
 * Steps: fetch Fear & Greed → fetch CoinGecko → build recommendation
 */

export type RebalanceAction = 'HOLD' | 'SHIFT_TO_STABLE' | 'INCREASE_EXPOSURE' | 'DIVERSIFY';

export interface CRESignals {
  fearGreedIndex: number;
  sentimentScore: number;
  volatilityScore: number;
  ethChange24h: number;
  btcChange24h: number;
}

export interface CRERecommendation {
  action: RebalanceAction;
  riskScore: number;
  reason: string;
  signals: CRESignals;
  sources: { fearGreed: string; coingecko: string };
  generatedAt: string;
  schedule: string;
}

const THRESHOLDS = { highRisk: 70, highVolatility: 80 };
const SCHEDULE = '0 */5 * * * *';

const ACTION_REASONS: Record<RebalanceAction, string> = {
  HOLD: 'Market conditions remain within acceptable risk tolerance.',
  SHIFT_TO_STABLE: 'Risk is elevated for this profile. Preserve capital by shifting to stable assets.',
  INCREASE_EXPOSURE: 'Risk is controlled and sentiment is positive. Increase growth exposure carefully.',
  DIVERSIFY: 'Volatility is high. Diversify allocation to reduce concentration risk.',
};

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFearGreed(): Promise<{ value: number; source: string }> {
  for (let i = 1; i <= 2; i++) {
    try {
      const res = await fetchWithTimeout('https://api.alternative.me/fng/?limit=1', 7000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { data?: Array<{ value?: string }> };
      return { value: Number(data.data?.[0]?.value ?? 50), source: 'live' };
    } catch {
      if (i < 2) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return { value: 50, source: 'fallback' };
}

async function fetchCoinGecko(): Promise<{ eth: number; btc: number; source: string }> {
  const url =
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd&include_24hr_change=true';
  for (let i = 1; i <= 2; i++) {
    try {
      const res = await fetchWithTimeout(url, 7000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        ethereum?: { usd_24h_change?: number };
        bitcoin?: { usd_24h_change?: number };
      };
      return {
        eth: data.ethereum?.usd_24h_change ?? 0,
        btc: data.bitcoin?.usd_24h_change ?? 0,
        source: 'live',
      };
    } catch {
      if (i < 2) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return { eth: 0, btc: 0, source: 'fallback' };
}

export async function getCRERecommendation(): Promise<CRERecommendation> {
  const [fng, cg] = await Promise.all([fetchFearGreed(), fetchCoinGecko()]);

  const sentimentScore = Math.round((fng.value - 50) * 2);
  const avgAbsChange = (Math.abs(cg.eth) + Math.abs(cg.btc)) / 2;
  const volatilityScore = Math.min(Math.round(avgAbsChange * 20), 100);

  // Default: MEDIUM risk profile (riskLevel=1) for dashboard display
  const riskLevel = 1;
  const negativeSentiment = sentimentScore < 0 ? Math.abs(sentimentScore) : 0;
  const riskScore = Math.min(100, Math.round(negativeSentiment * 0.4 + volatilityScore * 0.6));

  let action: RebalanceAction = 'HOLD';
  if (riskScore > THRESHOLDS.highRisk && riskLevel === 0) {
    action = 'SHIFT_TO_STABLE';
  } else if (volatilityScore > THRESHOLDS.highVolatility) {
    action = 'DIVERSIFY';
  } else if (riskScore < 30 && riskLevel === 2 && sentimentScore > 30) {
    action = 'INCREASE_EXPOSURE';
  }

  return {
    action,
    riskScore,
    reason: ACTION_REASONS[action],
    signals: {
      fearGreedIndex: fng.value,
      sentimentScore,
      volatilityScore,
      ethChange24h: cg.eth,
      btcChange24h: cg.btc,
    },
    sources: { fearGreed: fng.source, coingecko: cg.source },
    generatedAt: new Date().toISOString(),
    schedule: SCHEDULE,
  };
}
