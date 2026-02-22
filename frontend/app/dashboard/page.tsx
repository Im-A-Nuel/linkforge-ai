'use client';

import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { riskLevelToString } from '@/hooks/useContract';
import { useCachedProfile } from '@/hooks/useCachedProfile';
import { useEventLogs, type EventLog } from '@/hooks/useEventLogs';
import AIAnalysisSection from '@/components/AIAnalysisSection';
import { HydrationLoader, WalletRequiredState } from '@/components/ui/wallet-states';
import { useQuery } from '@tanstack/react-query';
import { config } from '@/lib/config';

const PROJECT_LOGO = '/icon/LinkForge%20AI%20logo.png';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [nowTimestamp, setNowTimestamp] = useState(0);

  // Read data from smart contract with caching
  const { profile, isLoading, isCached } = useCachedProfile(address);
  const { logs: eventLogs, isLoading: isEventLogsLoading, errorMessage: eventLogsError } = useEventLogs(address);

  const recentActivityLogs = eventLogs.slice(0, 3);

  const formatRelativeTime = (timestamp: number) => {
    if (nowTimestamp === 0) return 'just now';

    const diffSeconds = Math.max(0, Math.floor((nowTimestamp - timestamp) / 1000));
    if (diffSeconds < 60) return 'just now';

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y ago`;
  };

  const getActivityColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      green: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    };
    return colorMap[color] || colorMap.blue;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'RebalanceExecuted':
        return (
          <Image
            src={PROJECT_LOGO}
            alt="LinkForge AI"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        );
      case 'ProfileUpdated':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'ReasoningCommitted':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
    }
  };

  const toActivityContent = (log: EventLog) => {
    const actionTextByCode: Record<string, string> = {
      HOLD: 'Kept current allocation',
      SHIFT_TO_STABLE: 'Rebalanced to increase stable assets',
      INCREASE_EXPOSURE: 'Increased growth allocation gradually',
      DIVERSIFY: 'Diversified allocation across assets',
    };

    if (log.type === 'RebalanceExecuted') {
      const actionMatch = log.details.match(/Action:\s*([A-Z_]+)/);
      const actionCode = actionMatch?.[1] ?? '';

      return {
        title: 'AI Recommendation Executed',
        description: actionTextByCode[actionCode] ?? 'Portfolio rebalance executed on-chain',
      };
    }

    if (log.type === 'ProfileUpdated') {
      const riskMatch = log.details.match(/Risk:\s*([^,]+)/);
      const risk = riskMatch?.[1] ?? 'Unknown';

      return {
        title: 'Risk Assessment Complete',
        description: `Portfolio risk level: ${risk}`,
      };
    }

    if (log.type === 'ReasoningCommitted') {
      return {
        title: 'Data Synced from Oracle',
        description: 'Latest market data and AI reasoning committed on-chain',
      };
    }

    if (log.type === 'RebalanceRequested') {
      return {
        title: 'Rebalance Request Sent',
        description: 'Automation request submitted and waiting execution',
      };
    }

    return {
      title: log.type,
      description: log.details,
    };
  };

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setNowTimestamp(Date.now());

    const intervalId = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return (
      <HydrationLoader
        title="Loading dashboard"
        subtitle="Preparing live wallet context and AI insights..."
      />
    );
  }

  if (!isConnected) {
    return (
      <WalletRequiredState
        title="Dashboard Locked"
        description="Connect wallet to load your portfolio, AI analysis, and on-chain activity context."
        hint="Once connected, data will sync automatically."
      />
    );
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#121212]">
            Portfolio Dashboard
          </h1>
          <p className="mt-2 text-lg text-[#565656]">
            AI-powered insights powered by Chainlink oracles
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="rounded-lg bg-white/60 px-3 py-1.5 text-xs font-mono text-gray-700 backdrop-blur">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
              Connected
            </div>
            {isCached && (
              <div className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                Cached
              </div>
            )}
            {isLoading && (
              <div className="rounded-lg bg-[#eef4ff] px-3 py-1.5 text-xs font-semibold text-[#2b68ff]">
                Syncing profile...
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Value */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white p-6 shadow-lg transition hover:shadow-xl">
            <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Total Portfolio
            </div>
            <div className="text-4xl font-black text-[#121212]">$247,893</div>
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              <span className="rounded-md bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                +24.5%
              </span>
              <span className="text-gray-600">vs last month</span>
            </div>
          </div>

          {/* Risk Level */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white p-6 shadow-lg transition hover:shadow-xl">
            <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Risk Level
            </div>
            <div className="text-3xl font-black text-amber-600">
              {profile ? riskLevelToString(profile.riskLevel) : 'Medium'}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {profile ? (profile.automationEnabled ? 'Automation enabled' : 'Manual control') : 'Balanced allocation strategy'}
            </p>
          </div>

          {/* ESG Score */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white p-6 shadow-lg transition hover:shadow-xl">
            <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 21c3-8 9-13 15-14-1 6-6 12-14 15M6 21l9-9" />
              </svg>
            </div>
            <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">
              ESG Priority
            </div>
            <div className="text-3xl font-black text-green-600">
              {profile ? (profile.esgPriority ? 'Enabled' : 'Disabled') : 'Enabled'}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {profile ? (profile.esgPriority ? 'Sustainable investments active' : 'Standard allocation') : 'Loading...'}
            </p>
          </div>
        </div>

        {/* Portfolio Allocation */}
        <div className="rounded-3xl border border-white/50 bg-white p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#121212]">Portfolio Allocation</h2>
            <button className="rounded-full bg-[#eff3ff] px-4 py-2 text-sm font-semibold text-[#2b68ff] transition hover:bg-[#e0e7ff]">
              Rebalance
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
                  <span className="font-semibold text-[#121212]">Stable Assets</span>
                </div>
                <span className="text-lg font-bold text-[#121212]">60%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-inner" style={{ width: '60%' }} />
              </div>
              <p className="mt-1.5 text-xs text-gray-600">USDC, DAI, USDT</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600" />
                  <span className="font-semibold text-[#121212]">Growth Assets</span>
                </div>
                <span className="text-lg font-bold text-[#121212]">30%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 shadow-inner" style={{ width: '30%' }} />
              </div>
              <p className="mt-1.5 text-xs text-gray-600">ETH, BTC, LINK</p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600" />
                  <span className="font-semibold text-[#121212]">ESG Green Assets</span>
                </div>
                <span className="text-lg font-bold text-[#121212]">10%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-inner" style={{ width: '10%' }} />
              </div>
              <p className="mt-1.5 text-xs text-gray-600">Carbon Credits, Green Bonds</p>
            </div>
          </div>
        </div>

        {/* CRE Live Signal */}
        <CRELiveSignal />

        {/* AI Analysis Section */}
        <AIAnalysisSection />

        {/* Recent Activity */}
        <div className="rounded-3xl border border-white/50 bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-black text-[#121212]">Recent Activity</h2>

          <div className="space-y-4">
            {isEventLogsLoading ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" />
                <p className="mt-2 text-sm text-gray-600">Loading recent on-chain activity...</p>
              </div>
            ) : eventLogsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {eventLogsError}
              </div>
            ) : recentActivityLogs.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
                <p className="text-sm font-semibold text-gray-700">No recent activity yet</p>
                <p className="mt-1 text-xs text-gray-500">Your on-chain events will appear here after transactions.</p>
              </div>
            ) : (
              recentActivityLogs.map((log) => {
                const colors = getActivityColorClasses(log.color);
                const content = toActivityContent(log);

                return (
                  <div key={log.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.bg} ${colors.text}`}>
                      {getActivityIcon(log.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#121212]">{content.title}</p>
                      <p className="text-sm text-gray-600">{content.description}</p>
                    </div>
                    <span className="text-xs text-gray-500">{formatRelativeTime(log.timestamp)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
    </div>
  );
}


type RebalanceAction = 'HOLD' | 'SHIFT_TO_STABLE' | 'INCREASE_EXPOSURE' | 'DIVERSIFY';

interface CREData {
  action: RebalanceAction;
  riskScore: number;
  reason: string;
  signals: {
    fearGreedIndex: number;
    sentimentScore: number;
    volatilityScore: number;
    ethChange24h: number;
    btcChange24h: number;
  };
  sources: { fearGreed: string; coingecko: string };
  generatedAt: string;
  schedule: string;
}

const ACTION_LABEL: Record<RebalanceAction, string> = {
  HOLD: 'HOLD',
  SHIFT_TO_STABLE: 'SHIFT TO STABLE',
  INCREASE_EXPOSURE: 'INCREASE EXPOSURE',
  DIVERSIFY: 'DIVERSIFY',
};

const ACTION_COLOR: Record<RebalanceAction, string> = {
  HOLD: 'text-emerald-600',
  SHIFT_TO_STABLE: 'text-amber-600',
  INCREASE_EXPOSURE: 'text-[#2b68ff]',
  DIVERSIFY: 'text-cyan-600',
};

const ACTION_ACCENT: Record<RebalanceAction, string> = {
  HOLD: 'from-emerald-500 to-teal-500',
  SHIFT_TO_STABLE: 'from-amber-500 to-orange-500',
  INCREASE_EXPOSURE: 'from-[#2b68ff] to-[#6f94ff]',
  DIVERSIFY: 'from-cyan-500 to-sky-500',
};

const ACTION_PILL: Record<RebalanceAction, string> = {
  HOLD: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  SHIFT_TO_STABLE: 'border-amber-200 bg-amber-50 text-amber-700',
  INCREASE_EXPOSURE: 'border-[#c8d8ff] bg-[#edf3ff] text-[#2b68ff]',
  DIVERSIFY: 'border-cyan-200 bg-cyan-50 text-cyan-700',
};

function getRiskMeta(riskScore: number) {
  if (riskScore >= 70) {
    return {
      label: 'High risk',
      pillClass: 'border-rose-200 bg-rose-50 text-rose-700',
      progressClass: 'from-rose-500 to-rose-400',
    };
  }

  if (riskScore >= 40) {
    return {
      label: 'Moderate risk',
      pillClass: 'border-amber-200 bg-amber-50 text-amber-700',
      progressClass: 'from-amber-500 to-yellow-400',
    };
  }

  return {
    label: 'Low risk',
    pillClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    progressClass: 'from-emerald-500 to-teal-400',
  };
}

function CRELiveSignal() {
  const { data, isLoading, isError } = useQuery<CREData>({
    queryKey: ['cre-recommendation'],
    queryFn: async () => {
      const res = await fetch(`${config.backendUrl}/api/cre-recommendation`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  });

  const actionColor = data ? ACTION_COLOR[data.action] : 'text-emerald-600';
  const accentBar = data ? ACTION_ACCENT[data.action] : 'from-emerald-500 to-teal-500';
  const actionPill = data
    ? ACTION_PILL[data.action]
    : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  const riskMeta = data ? getRiskMeta(data.riskScore) : getRiskMeta(50);
  const confidenceScore = data
    ? Math.max(18, Math.min(96, 100 - data.signals.volatilityScore))
    : 60;
  const updatedAt = data ? new Date(data.generatedAt) : null;

  const metrics = data
    ? [
        {
          label: 'Fear & Greed',
          value: `${data.signals.fearGreedIndex}`,
          unit: '/100',
          sub: data.sources.fearGreed,
          color:
            data.signals.fearGreedIndex <= 25
              ? 'text-rose-500'
              : data.signals.fearGreedIndex >= 75
              ? 'text-emerald-600'
              : 'text-amber-500',
        },
        {
          label: 'Sentiment',
          value:
            data.signals.sentimentScore > 0
              ? `+${data.signals.sentimentScore}`
              : `${data.signals.sentimentScore}`,
          unit: '',
          sub: 'score',
          color: data.signals.sentimentScore >= 0 ? 'text-emerald-600' : 'text-rose-500',
        },
        {
          label: 'Volatility',
          value: `${data.signals.volatilityScore}`,
          unit: '/100',
          sub: 'score',
          color:
            data.signals.volatilityScore > 60
              ? 'text-rose-500'
              : data.signals.volatilityScore > 30
              ? 'text-amber-500'
              : 'text-emerald-600',
        },
        {
          label: 'ETH 24H',
          value: `${data.signals.ethChange24h >= 0 ? '+' : ''}${data.signals.ethChange24h.toFixed(2)}`,
          unit: '%',
          sub: data.sources.coingecko,
          color: data.signals.ethChange24h >= 0 ? 'text-emerald-600' : 'text-rose-500',
        },
        {
          label: 'BTC 24H',
          value: `${data.signals.btcChange24h >= 0 ? '+' : ''}${data.signals.btcChange24h.toFixed(2)}`,
          unit: '%',
          sub: data.sources.coingecko,
          color: data.signals.btcChange24h >= 0 ? 'text-emerald-600' : 'text-rose-500',
        },
      ]
    : [];

  return (
    <div className="ui-reveal-rise relative overflow-hidden rounded-[30px] border border-[#d6e3ff] bg-gradient-to-br from-[#f8fbff] via-white to-[#edf3ff] shadow-[0_16px_54px_rgba(43,104,255,0.12)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-2 h-56 w-56 rounded-full bg-[#2b68ff]/12 blur-3xl" />
        <div className="absolute -right-12 bottom-0 h-52 w-52 rounded-full bg-[#00b8ff]/12 blur-3xl" />
      </div>

      <div className={`relative h-1 w-full bg-gradient-to-r ${accentBar}`} />

      <div className="relative border-b border-[#dce6f7] px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[15px] font-black leading-none tracking-tight text-[#121212]">
              CRE Live Signal
            </p>
            <p className="mt-1 text-xs font-medium text-[#586985]">
              Chainlink Runtime Environment - auto-refresh every 5 min
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-[#d8e4ff] bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#385eb3] sm:block">
              Oracle stream active
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold tracking-wide text-emerald-700">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="relative flex items-center gap-3 px-6 py-11 text-sm text-[#607090] sm:px-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#d7e4ff] border-t-[#2b68ff]" />
          Fetching market signals...
        </div>
      )}

      {isError && (
        <div className="relative px-6 py-8 sm:px-8">
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Backend unavailable. Start backend server to see CRE signals.
          </p>
        </div>
      )}

      {data && (
        <>
          <div className="relative px-6 pb-5 pt-7 sm:px-8">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div
                  className={`mb-4 inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.11em] ${actionPill}`}
                >
                  {ACTION_LABEL[data.action]}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#607291]">
                  Live Market Signal
                </p>
                <p
                  className={`mt-2 max-w-[14ch] text-5xl font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl ${actionColor}`}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {ACTION_LABEL[data.action]}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#4d5e7d] sm:text-base">
                  {data.reason}
                </p>
              </div>

              <div className="w-full max-w-xs rounded-2xl border border-[#d8e4ff] bg-white/90 p-4 shadow-[0_10px_28px_rgba(47,87,170,0.14)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#607291]">
                      Risk score
                    </p>
                    <p className="mt-1 text-5xl font-black leading-none text-[#121212]">
                      {data.riskScore}
                      <span className="ml-1 text-lg font-semibold text-[#7b89a5]">/100</span>
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${riskMeta.pillClass}`}
                  >
                    {riskMeta.label}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[#6a7895]">
                    <span>Model confidence</span>
                    <span>{confidenceScore}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#d9e4fa]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${riskMeta.progressClass}`}
                      style={{ width: `${confidenceScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative border-y border-[#dce6f7] bg-white/60 px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-[#dce7fb] bg-white/80 px-4 py-3 text-center shadow-[0_6px_18px_rgba(43,104,255,0.08)] backdrop-blur"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f7f9d]">
                    {m.label}
                  </p>
                  <p className={`mt-2 text-[22px] font-black leading-none ${m.color}`}>
                    {m.value}
                    {m.unit && (
                      <span className="ml-0.5 text-[12px] font-semibold text-[#7f8daa]">
                        {m.unit}
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#8b95ab]">
                    {m.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col gap-2 px-6 py-4 text-[11px] font-semibold text-[#6e7d98] sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="font-mono uppercase tracking-[0.12em]">Schedule: {data.schedule}</p>
            <p>
              Updated{' '}
              {updatedAt
                ? `${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}`
                : '--'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
