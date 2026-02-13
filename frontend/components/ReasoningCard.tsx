'use client';

import { useState } from 'react';

interface ReasoningCardProps {
  sentimentScore: number; // -100 to +100
  volatilityScore: number; // 0-100
  riskScore: number; // 0-100
  esgScore: number; // 0-100
  recommendedAction: number; // 0-3
  ipfsHash?: string;
  timestamp: bigint;
}

const actionNames = {
  0: { name: 'HOLD', color: 'blue', icon: '⏸️', description: 'Maintain current allocation' },
  1: { name: 'SHIFT TO STABLE', color: 'yellow', icon: '🛡️', description: 'Move assets to stablecoins' },
  2: { name: 'INCREASE EXPOSURE', color: 'green', icon: '📈', description: 'Increase growth assets' },
  3: { name: 'DIVERSIFY', color: 'purple', icon: '🔀', description: 'Spread across multiple assets' },
};

export default function ReasoningCard({
  sentimentScore,
  volatilityScore,
  riskScore,
  esgScore,
  recommendedAction,
  ipfsHash,
  timestamp,
}: ReasoningCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const action = actionNames[recommendedAction as keyof typeof actionNames] || actionNames[0];

  const getSentimentLabel = (score: number) => {
    if (score > 50) return { label: 'Very Positive', color: 'text-green-600' };
    if (score > 20) return { label: 'Positive', color: 'text-green-500' };
    if (score > -20) return { label: 'Neutral', color: 'text-gray-600' };
    if (score > -50) return { label: 'Negative', color: 'text-orange-500' };
    return { label: 'Very Negative', color: 'text-red-600' };
  };

  const getVolatilityLabel = (score: number) => {
    if (score > 80) return { label: 'Extreme', color: 'text-red-600' };
    if (score > 60) return { label: 'High', color: 'text-orange-500' };
    if (score > 40) return { label: 'Medium', color: 'text-yellow-600' };
    return { label: 'Low', color: 'text-green-600' };
  };

  const getRiskLabel = (score: number) => {
    if (score > 70) return { label: 'High Risk', color: 'text-red-600' };
    if (score > 40) return { label: 'Medium Risk', color: 'text-yellow-600' };
    return { label: 'Low Risk', color: 'text-green-600' };
  };

  const sentiment = getSentimentLabel(sentimentScore);
  const volatility = getVolatilityLabel(volatilityScore);
  const risk = getRiskLabel(riskScore);

  const date = new Date(Number(timestamp) * 1000).toLocaleString();

  return (
    <div className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#121212]">AI Analysis Result</h2>
          <p className="text-sm text-gray-500 mt-1">{date}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl">
          🤖
        </div>
      </div>

      {/* Recommended Action */}
      <div className={`mb-6 rounded-2xl border-2 border-${action.color}-200 bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 p-5`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{action.icon}</span>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-gray-600">
              Recommended Action
            </div>
            <div className="text-2xl font-black text-[#121212]">
              {action.name}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-700 mt-2">{action.description}</p>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Sentiment */}
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">Sentiment</span>
            <span className={`text-xs font-bold ${sentiment.color}`}>{sentiment.label}</span>
          </div>
          <div className="mb-2 text-3xl font-black text-[#121212]">
            {sentimentScore > 0 ? '+' : ''}{sentimentScore}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${sentimentScore > 0 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.abs(sentimentScore)}%` }}
            />
          </div>
        </div>

        {/* Volatility */}
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">Volatility</span>
            <span className={`text-xs font-bold ${volatility.color}`}>{volatility.label}</span>
          </div>
          <div className="mb-2 text-3xl font-black text-[#121212]">{volatilityScore}</div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
              style={{ width: `${volatilityScore}%` }}
            />
          </div>
        </div>

        {/* Risk */}
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">Risk Level</span>
            <span className={`text-xs font-bold ${risk.color}`}>{risk.label}</span>
          </div>
          <div className="mb-2 text-3xl font-black text-[#121212]">{riskScore}</div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all"
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>

        {/* ESG */}
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">ESG Score</span>
            <span className="text-xs font-bold text-green-600">
              {esgScore > 70 ? 'Good' : esgScore > 50 ? 'Fair' : 'Poor'}
            </span>
          </div>
          <div className="mb-2 text-3xl font-black text-[#121212]">{esgScore}</div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
              style={{ width: `${esgScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        {showDetails ? '▼ Hide Details' : '▶ Show Details'}
      </button>

      {/* Detailed Explanation */}
      {showDetails && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <h3 className="mb-3 font-bold text-gray-900">Analysis Breakdown</h3>

          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <span className="font-semibold">📊 Market Sentiment:</span>
              <p className="mt-1 text-gray-600">
                {sentimentScore > 30
                  ? 'Market shows strong positive sentiment. Investors are confident.'
                  : sentimentScore > 0
                  ? 'Slight positive sentiment in the market. Cautiously optimistic.'
                  : sentimentScore > -30
                  ? 'Negative sentiment detected. Market showing fear.'
                  : 'Extreme fear in the market. High risk environment.'}
              </p>
            </div>

            <div>
              <span className="font-semibold">📈 Volatility Analysis:</span>
              <p className="mt-1 text-gray-600">
                {volatilityScore > 80
                  ? 'Extreme price swings detected. Market is highly unstable.'
                  : volatilityScore > 60
                  ? 'High volatility observed. Significant price movements likely.'
                  : volatilityScore > 40
                  ? 'Moderate volatility. Normal market fluctuations.'
                  : 'Low volatility. Market is stable and calm.'}
              </p>
            </div>

            <div>
              <span className="font-semibold">⚠️ Risk Assessment:</span>
              <p className="mt-1 text-gray-600">
                {riskScore > 70
                  ? 'High risk detected. Consider reducing exposure to volatile assets.'
                  : riskScore > 40
                  ? 'Moderate risk levels. Balanced approach recommended.'
                  : 'Low risk environment. Good opportunity for strategic positioning.'}
              </p>
            </div>

            <div>
              <span className="font-semibold">🌱 ESG Considerations:</span>
              <p className="mt-1 text-gray-600">
                Current portfolio has an ESG score of {esgScore}/100.
                {esgScore > 70
                  ? ' Excellent sustainability rating.'
                  : esgScore > 50
                  ? ' Moderate environmental impact.'
                  : ' Consider more sustainable assets.'}
              </p>
            </div>

            {ipfsHash && (
              <div>
                <span className="font-semibold">🔗 Full Report:</span>
                <a
                  href={`https://ipfs.io/ipfs/${ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-blue-600 hover:underline"
                >
                  View detailed analysis on IPFS →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
