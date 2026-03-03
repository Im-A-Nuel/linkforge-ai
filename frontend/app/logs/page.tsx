'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEventLogs } from '@/hooks/useEventLogs';
import { HydrationLoader, WalletRequiredState } from '@/components/ui/wallet-states';
import { useToast } from '@/components/ui/toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useT } from '@/lib/i18n';

export default function Logs() {
  const { address, isConnected } = useAccount();
  const { pushToast } = useToast();
  const { language } = useLanguage();
  const t = useT(language);
  const [mounted, setMounted] = useState(false);
  const { logs, isLoading, errorMessage } = useEventLogs(address);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!errorMessage) return;

    pushToast({
      type: 'error',
      title: t.logs.toastFetchFailTitle,
      message: errorMessage,
      duration: 5600,
    });
  }, [errorMessage, pushToast, t.logs.toastFetchFailTitle]);

  const eventTypes = [
    {
      name: 'ProfileUpdated',
      description: t.logs.profileUpdatedDesc,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'RebalanceRequested',
      description: t.logs.rebalanceRequestedDesc,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: 'from-amber-500 to-amber-600',
    },
    {
      name: 'ReasoningCommitted',
      description: t.logs.reasoningCommittedDesc,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3a2.25 2.25 0 00-2.25 2.25V7.5A2.25 2.25 0 009.75 9.75h4.5A2.25 2.25 0 0016.5 7.5V5.25A2.25 2.25 0 0014.25 3h-4.5zM4.5 12A2.25 2.25 0 016.75 9.75h10.5A2.25 2.25 0 0119.5 12v4.25a2.25 2.25 0 01-2.25 2.25h-10.5A2.25 2.25 0 014.5 16.25V12zM9 13.5h.008v.008H9V13.5zm6 0h.008v.008H15V13.5z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'RebalanceExecuted',
      description: t.logs.rebalanceExecutedDesc,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      green: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    };
    return colorMap[color] || colorMap.blue;
  };

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return (
      <HydrationLoader
        title={t.logs.loadingTitle}
        subtitle={t.logs.loadingSubtitle}
      />
    );
  }

  if (!isConnected) {
    return (
      <WalletRequiredState
        title={t.logs.lockedTitle}
        description={t.logs.lockedDesc}
        hint={t.logs.lockedHint}
      />
    );
  }

  return (
    <div className="w-full space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#121212]">
            {t.logs.title}
          </h1>
          <p className="mt-2 text-lg text-[#565656]">
            {t.logs.subtitle}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="rounded-lg bg-white/60 px-3 py-1.5 text-xs font-mono text-gray-700 backdrop-blur">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
              {t.common.connected}
            </div>
          </div>
        </div>

        <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)]">
          {/* Recent Events */}
          <div className="min-w-0">
            <div className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
              <h2 className="mb-5 text-2xl font-black text-[#121212]">{t.logs.recentEvents}</h2>

              {errorMessage && (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {errorMessage}
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-3 text-sm text-gray-600">{t.logs.loadingEvents}</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-3 text-sm font-semibold text-gray-700">{t.logs.noEvents}</p>
                  <p className="text-xs text-gray-500 mt-1">{t.logs.noEventsDesc}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => {
                    const colors = getColorClasses(log.color);
                    const getIcon = (type: string) => {
                      switch (type) {
                        case 'ProfileUpdated':
                          return (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          );
                        case 'ReasoningCommitted':
                          return (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3a2.25 2.25 0 00-2.25 2.25V7.5A2.25 2.25 0 009.75 9.75h4.5A2.25 2.25 0 0016.5 7.5V5.25A2.25 2.25 0 0014.25 3h-4.5zM4.5 12A2.25 2.25 0 016.75 9.75h10.5A2.25 2.25 0 0119.5 12v4.25a2.25 2.25 0 01-2.25 2.25h-10.5A2.25 2.25 0 014.5 16.25V12zM9 13.5h.008v.008H9V13.5zm6 0h.008v.008H15V13.5z" />
                            </svg>
                          );
                        case 'RebalanceExecuted':
                          return (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

                    return (
                      <div
                        key={log.id}
                        className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 transition hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colors.bg} ${colors.text}`}>
                            {getIcon(log.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="font-bold text-[#121212]">{log.type}</span>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="mb-2 text-sm text-gray-600">{log.details}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-gray-500">{t.logs.txLabel}</span>
                              <a
                                href={`https://sepolia.basescan.org/tx/${log.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-blue-600 hover:underline transition truncate"
                              >
                                {log.transactionHash.slice(0, 10)}...{log.transactionHash.slice(-8)}
                              </a>
                              <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 rounded-2xl bg-blue-50 p-3 text-center">
                <p className="text-sm text-blue-700">
                  {t.logs.delayNote}
                </p>
              </div>
            </div>
          </div>

          {/* Event Types */}
          <div className="min-w-0 space-y-5">
            <div className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
              <h2 className="mb-5 text-2xl font-black text-[#121212]">{t.logs.eventTypes}</h2>

              <div className="space-y-3">
                {eventTypes.map((event) => (
                  <div
                    key={event.name}
                    className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-3 transition hover:shadow-md"
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${event.color} text-white`}>
                        {event.icon}
                      </div>
                      <span className="font-bold text-sm text-[#121212]">{event.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Log Integrity Card */}
            <div className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
              <h3 className="text-lg font-black text-[#121212] mb-2">{t.logs.logIntegrity}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {t.logs.logIntegrityDesc}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#2b68ff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f57de]"
              >
                <span>{t.logs.backToDashboard}</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
    </div>
  );
}
