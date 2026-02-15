'use client';

import { useEffect, useState } from 'react';

interface ReasoningCardProps {
  sentimentScore: number; // -100 to +100
  volatilityScore: number; // 0-100
  riskScore: number; // 0-100
  esgScore: number; // 0-100
  recommendedAction: number; // 0-3
  ipfsHash?: string;
  timestamp: bigint;
}

type ActionIconKind = 'hold' | 'stable' | 'increase' | 'diversify';

type ActionStyle = {
  name: string;
  description: string;
  badge: string;
  badgeClass: string;
  panelClass: string;
  iconWrapClass: string;
  icon: ActionIconKind;
};

const ACTIONS: Record<number, ActionStyle> = {
  0: {
    name: 'HOLD',
    description: 'Maintain current allocation and monitor the next signal window.',
    badge: 'Balanced',
    badgeClass: 'bg-sky-100 text-sky-700',
    panelClass: 'border-sky-200 bg-[linear-gradient(140deg,#f7fbff_0%,#ebf4ff_100%)]',
    iconWrapClass: 'bg-sky-600 text-white',
    icon: 'hold',
  },
  1: {
    name: 'SHIFT TO STABLE',
    description: 'Move part of the portfolio to stable assets to reduce downside risk.',
    badge: 'Defensive',
    badgeClass: 'bg-amber-100 text-amber-700',
    panelClass: 'border-amber-200 bg-[linear-gradient(140deg,#fff9ed_0%,#fff1d6_100%)]',
    iconWrapClass: 'bg-amber-500 text-white',
    icon: 'stable',
  },
  2: {
    name: 'INCREASE EXPOSURE',
    description: 'Gradually add growth exposure while sentiment remains constructive.',
    badge: 'Opportunistic',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    panelClass: 'border-emerald-200 bg-[linear-gradient(140deg,#effef6_0%,#dbfae9_100%)]',
    iconWrapClass: 'bg-emerald-600 text-white',
    icon: 'increase',
  },
  3: {
    name: 'DIVERSIFY',
    description: 'Spread exposure across assets and reduce concentration risk.',
    badge: 'Risk Spread',
    badgeClass: 'bg-violet-100 text-violet-700',
    panelClass: 'border-violet-200 bg-[linear-gradient(140deg,#f7f5ff_0%,#ede9ff_100%)]',
    iconWrapClass: 'bg-violet-600 text-white',
    icon: 'diversify',
  },
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function ActionIcon({ icon }: { icon: ActionIconKind }) {
  if (icon === 'stable') {
    return (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M7 8h10M7 16h10" />
      </svg>
    );
  }

  if (icon === 'increase') {
    return (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l5-5 4 4 7-7M14 8h6v6" />
      </svg>
    );
  }

  if (icon === 'diversify') {
    return (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10M7 17h10M5 7h.01M5 12h.01M5 17h.01" />
      </svg>
    );
  }

  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6M6 6h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" />
    </svg>
  );
}

type ScoreCardProps = {
  title: string;
  value: string;
  label: string;
  labelClass: string;
  barValue: number;
  barClass: string;
  footnote: string;
  animate: boolean;
  delayMs?: number;
};

function ScoreCard({
  title,
  value,
  label,
  labelClass,
  barValue,
  barClass,
  footnote,
  animate,
  delayMs = 0,
}: ScoreCardProps) {
  return (
    <div
      className={`rounded-2xl border border-[#dbe2f3] bg-white/95 p-4 shadow-[0_8px_20px_rgba(13,29,70,0.06)] ${animate ? 'ui-stagger-up' : ''}`}
      style={animate ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-[#526079]">{title}</p>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${labelClass}`}>{label}</span>
      </div>
      <p className="text-4xl font-black leading-none tracking-tight text-[#0f1b34]">{value}</p>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e9eef8]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{ width: `${animate ? clamp(barValue) : 0}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[#687692]">{footnote}</p>
    </div>
  );
}

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
  const [animateMetrics, setAnimateMetrics] = useState(false);

  const action = ACTIONS[recommendedAction] || ACTIONS[0];

  useEffect(() => {
    setAnimateMetrics(false);
    const frame = requestAnimationFrame(() => setAnimateMetrics(true));
    return () => cancelAnimationFrame(frame);
  }, [sentimentScore, volatilityScore, riskScore, esgScore, recommendedAction, timestamp]);

  const sentimentMeta =
    sentimentScore > 50
      ? {
          label: 'Very Positive',
          chipClass: 'bg-emerald-100 text-emerald-700',
          barClass: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
        }
      : sentimentScore > 20
      ? {
          label: 'Positive',
          chipClass: 'bg-emerald-50 text-emerald-700',
          barClass: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
        }
      : sentimentScore > -20
      ? {
          label: 'Neutral',
          chipClass: 'bg-slate-100 text-slate-700',
          barClass: 'bg-gradient-to-r from-slate-400 to-slate-300',
        }
      : sentimentScore > -50
      ? {
          label: 'Negative',
          chipClass: 'bg-orange-100 text-orange-700',
          barClass: 'bg-gradient-to-r from-orange-500 to-rose-500',
        }
      : {
          label: 'Very Negative',
          chipClass: 'bg-red-100 text-red-700',
          barClass: 'bg-gradient-to-r from-red-600 to-orange-500',
        };

  const volatilityMeta =
    volatilityScore > 80
      ? { label: 'Extreme', chipClass: 'bg-red-100 text-red-700' }
      : volatilityScore > 60
      ? { label: 'High', chipClass: 'bg-orange-100 text-orange-700' }
      : volatilityScore > 40
      ? { label: 'Medium', chipClass: 'bg-yellow-100 text-yellow-700' }
      : { label: 'Low', chipClass: 'bg-emerald-100 text-emerald-700' };

  const riskMeta =
    riskScore > 70
      ? { label: 'High Risk', chipClass: 'bg-red-100 text-red-700' }
      : riskScore > 40
      ? { label: 'Medium Risk', chipClass: 'bg-yellow-100 text-yellow-700' }
      : { label: 'Low Risk', chipClass: 'bg-emerald-100 text-emerald-700' };

  const date = new Date(Number(timestamp) * 1000).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const sentimentText =
    sentimentScore > 30
      ? 'Market mood is constructive with strong buying appetite.'
      : sentimentScore > 0
      ? 'Sentiment is slightly positive with moderate confidence.'
      : sentimentScore > -30
      ? 'Sentiment is cautious and buyers are less aggressive.'
      : 'Sentiment is risk-off and market confidence is weak.';

  const volatilityText =
    volatilityScore > 80
      ? 'Price swings are intense and conditions are unstable.'
      : volatilityScore > 60
      ? 'Volatility is elevated with wider short-term movement.'
      : volatilityScore > 40
      ? 'Volatility is normal for active crypto markets.'
      : 'Volatility is compressed and market movement is calm.';

  const riskText =
    riskScore > 70
      ? 'Risk profile is high. Capital preservation should be prioritized.'
      : riskScore > 40
      ? 'Risk profile is moderate. Balanced positioning is preferred.'
      : 'Risk profile is relatively low and setup is constructive.';

  const esgText =
    esgScore > 70
      ? 'ESG profile is strong with good sustainability alignment.'
      : esgScore > 50
      ? 'ESG profile is acceptable with room for cleaner allocation.'
      : 'ESG profile is weak. Consider adding greener instruments.';

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-[#dbe2f3] bg-white shadow-[0_22px_65px_rgba(13,29,70,0.1)]">
      <div className="pointer-events-none absolute -left-20 -top-24 h-60 w-60 rounded-full bg-[#2b68ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-12 h-60 w-60 rounded-full bg-[#00b388]/10 blur-3xl" />

      <div className="relative space-y-6 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center rounded-full border border-[#d7e4ff] bg-[#f3f7ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2b68ff]">
              Chainlink Functions Insight
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0f1b34]">AI Analysis Result</h2>
            <p className="mt-1 text-sm font-medium text-[#61708b]">Updated {date}</p>
          </div>
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.iconWrapClass}`}>
            <ActionIcon icon={action.icon} />
          </div>
        </div>

        <div className={`rounded-3xl border p-5 md:p-6 ${action.panelClass}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5f6f8c]">Recommended Action</p>
              <h3 className="mt-1 text-3xl font-black leading-none tracking-tight text-[#10203f]">{action.name}</h3>
              <p className="mt-3 max-w-2xl text-sm text-[#37496b]">{action.description}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${action.badgeClass}`}>{action.badge}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ScoreCard
            title="Sentiment"
            value={`${sentimentScore > 0 ? '+' : ''}${Math.round(sentimentScore)}`}
            label={sentimentMeta.label}
            labelClass={sentimentMeta.chipClass}
            barValue={Math.abs(sentimentScore)}
            barClass={sentimentMeta.barClass}
            footnote="Market confidence score (-100 to +100)."
            animate={animateMetrics}
            delayMs={80}
          />
          <ScoreCard
            title="Volatility"
            value={`${Math.round(volatilityScore)}`}
            label={volatilityMeta.label}
            labelClass={volatilityMeta.chipClass}
            barValue={volatilityScore}
            barClass="bg-gradient-to-r from-amber-400 to-orange-500"
            footnote="Higher means stronger short-term price movement."
            animate={animateMetrics}
            delayMs={140}
          />
          <ScoreCard
            title="Risk Level"
            value={`${Math.round(riskScore)}`}
            label={riskMeta.label}
            labelClass={riskMeta.chipClass}
            barValue={riskScore}
            barClass="bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"
            footnote="Composite score from sentiment and volatility."
            animate={animateMetrics}
            delayMs={200}
          />
          <ScoreCard
            title="ESG Score"
            value={`${Math.round(esgScore)}`}
            label={esgScore > 70 ? 'Good' : esgScore > 50 ? 'Fair' : 'Weak'}
            labelClass={
              esgScore > 70
                ? 'bg-emerald-100 text-emerald-700'
                : esgScore > 50
                ? 'bg-sky-100 text-sky-700'
                : 'bg-orange-100 text-orange-700'
            }
            barValue={esgScore}
            barClass="bg-gradient-to-r from-green-500 to-emerald-400"
            footnote="Sustainability alignment indicator (0 to 100)."
            animate={animateMetrics}
            delayMs={260}
          />
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-center rounded-full border border-[#cfd9ef] bg-white px-4 py-2.5 text-sm font-semibold text-[#34486f] transition hover:border-[#b7c6e7] hover:bg-[#f8fbff]"
        >
          {showDetails ? 'Hide Analysis Details' : 'Show Analysis Details'}
        </button>

        {showDetails && (
          <div className="rounded-2xl border border-[#dbe3f3] bg-[#f9fbff] p-5 md:p-6 ui-reveal-rise">
            <h3 className="mb-4 text-lg font-black text-[#10203f]">Analysis Breakdown</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#e2e8f7] bg-white p-4">
                <p className="text-sm font-bold text-[#1d2f53]">Market Sentiment</p>
                <p className="mt-1 text-sm text-[#516480]">{sentimentText}</p>
              </div>
              <div className="rounded-xl border border-[#e2e8f7] bg-white p-4">
                <p className="text-sm font-bold text-[#1d2f53]">Volatility Analysis</p>
                <p className="mt-1 text-sm text-[#516480]">{volatilityText}</p>
              </div>
              <div className="rounded-xl border border-[#e2e8f7] bg-white p-4">
                <p className="text-sm font-bold text-[#1d2f53]">Risk Assessment</p>
                <p className="mt-1 text-sm text-[#516480]">{riskText}</p>
              </div>
              <div className="rounded-xl border border-[#e2e8f7] bg-white p-4">
                <p className="text-sm font-bold text-[#1d2f53]">ESG Considerations</p>
                <p className="mt-1 text-sm text-[#516480]">{esgText}</p>
              </div>
            </div>

            {ipfsHash && (
              <a
                href={`https://ipfs.io/ipfs/${ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center rounded-full border border-[#cfdbf7] bg-white px-4 py-2 text-sm font-semibold text-[#2b68ff] transition hover:bg-[#eff4ff]"
              >
                Open Full Report on IPFS
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
