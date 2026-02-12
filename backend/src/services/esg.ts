import { ESGScore } from '../types/index.js';

/**
 * Get ESG score for a given asset
 * Currently returns mock data - integrate with real ESG data providers later
 */
export async function getESGScore(asset: string): Promise<ESGScore> {
  // TODO: Integrate with real ESG data providers

  // Mock ESG scoring
  const greenAssets = ['GREEN1', 'SOLAR', 'WIND', 'CARBON'];
  const brownAssets = ['OIL', 'COAL', 'GAS'];

  let category: 'green' | 'neutral' | 'brown';
  let environmental: number;
  let social: number;
  let governance: number;

  if (greenAssets.includes(asset.toUpperCase())) {
    category = 'green';
    environmental = 80 + Math.random() * 20;
    social = 70 + Math.random() * 30;
    governance = 75 + Math.random() * 25;
  } else if (brownAssets.includes(asset.toUpperCase())) {
    category = 'brown';
    environmental = Math.random() * 30;
    social = 30 + Math.random() * 40;
    governance = 40 + Math.random() * 40;
  } else {
    category = 'neutral';
    environmental = 40 + Math.random() * 40;
    social = 50 + Math.random() * 30;
    governance = 55 + Math.random() * 30;
  }

  const score = (environmental + social + governance) / 3;

  return {
    asset: asset.toUpperCase(),
    score: Math.round(score),
    category,
    metrics: {
      environmental: Math.round(environmental),
      social: Math.round(social),
      governance: Math.round(governance),
    },
    timestamp: new Date().toISOString(),
  };
}
