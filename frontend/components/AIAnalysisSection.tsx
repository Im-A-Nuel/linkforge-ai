'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRequestAIAnalysis, useLatestReasoning } from '@/hooks/useContract';
import { useCachedProfile } from '@/hooks/useCachedProfile';
import { CHAINLINK_FUNCTIONS_SOURCE } from '@/lib/functionsSource';
import ReasoningCard from './ReasoningCard';
import { useToast } from '@/components/ui/toast';

export default function AIAnalysisSection() {
  const { address } = useAccount();
  const { profile } = useCachedProfile(address);
  const { pushToast } = useToast();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRevealingResult, setIsRevealingResult] = useState(false);
  const previousHasReasoning = useRef(false);
  const lastSuccessHash = useRef<string | undefined>(undefined);
  const lastErrorToast = useRef<string | null>(null);

  const {
    requestAnalysis,
    isPending,
    isConfirming,
    isSuccess: requestSuccess,
    hash: requestHash,
    errorMessage: requestErrorMessage,
  } = useRequestAIAnalysis();

  const { data: reasoning, refetch: refetchReasoning } = useLatestReasoning(address);

  const hasReasoning = reasoning && Number(reasoning.timestamp) > 0;

  const parsedReasoning = hasReasoning
    ? {
        sentimentScore: Number(reasoning.sentimentScore) / 100,
        volatilityScore: Number(reasoning.volatilityScore),
        riskScore: Number(reasoning.riskScore),
        esgScore: Number(reasoning.esgScore),
        recommendedAction: Number(reasoning.recommendedAction),
        ipfsHash: reasoning.ipfsHash,
        timestamp: reasoning.timestamp,
      }
    : null;

  useEffect(() => {
    if (hasReasoning && !previousHasReasoning.current) {
      setIsRevealingResult(true);
      pushToast({
        type: 'success',
        title: 'Analysis result is ready',
        message: 'Fresh AI recommendation has been committed on-chain.',
      });

      const timer = setTimeout(() => setIsRevealingResult(false), 900);
      previousHasReasoning.current = true;

      return () => clearTimeout(timer);
    }

    previousHasReasoning.current = !!hasReasoning;
  }, [hasReasoning, pushToast]);

  useEffect(() => {
    if (requestSuccess && requestHash && requestHash !== lastSuccessHash.current) {
      pushToast({
        type: 'success',
        title: 'Request submitted',
        message: 'Waiting for Chainlink DON response. Usually takes 30-60 seconds.',
      });
      lastSuccessHash.current = requestHash;
    }
  }, [requestSuccess, requestHash, pushToast]);

  useEffect(() => {
    if (!requestErrorMessage) return;

    const lower = requestErrorMessage.toLowerCase();
    if (lower.includes('user rejected') || lower.includes('user denied')) return;
    if (requestErrorMessage === lastErrorToast.current) return;

    pushToast({
      type: 'error',
      title: 'Analysis request failed',
      message: requestErrorMessage,
      duration: 5600,
    });
    lastErrorToast.current = requestErrorMessage;
  }, [requestErrorMessage, pushToast]);

  const handleRequestAnalysis = async () => {
    if (isSubmittingLocal || isPending || isConfirming) {
      return;
    }

    if (!profile) {
      pushToast({
        type: 'warning',
        title: 'Profile belum disetel',
        message: 'Atur risk level, ESG, dan automation dulu di halaman Profile sebelum request analysis.',
        duration: 5200,
      });
      return;
    }

    const args = [address || '0x0', profile.riskLevel.toString(), profile.esgPriority ? 'true' : 'false'];

    setIsSubmittingLocal(true);
    try {
      await requestAnalysis(CHAINLINK_FUNCTIONS_SOURCE, args);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.toLowerCase().includes('user rejected') || message.toLowerCase().includes('user denied')) {
        pushToast({
          type: 'info',
          title: 'Transaction cancelled',
          message: 'No worries. You can retry whenever you are ready.',
        });
        return;
      }
      console.error('Analysis request error:', err);
      pushToast({
        type: 'error',
        title: 'Request failed to send',
        message: message || 'Unexpected error while sending transaction.',
      });
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await refetchReasoning();
      const data = result.data as typeof reasoning;
      if (data && data.timestamp && Number(data.timestamp) > 0) {
        // Analysis found
        console.log('Analysis found!');
        pushToast({
          type: 'success',
          title: 'Result available',
          message: 'Latest AI analysis has been loaded.',
        });
      } else {
        // No analysis yet
        pushToast({
          type: 'info',
          title: 'Still processing',
          message: 'No result yet. Wait around 30-60 seconds and refresh again.',
        });
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      pushToast({
        type: 'error',
        title: 'Refresh failed',
        message: 'Could not fetch latest result. Please try again.',
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="relative overflow-hidden rounded-3xl border border-[#dbe3f5] bg-[linear-gradient(135deg,#ffffff_0%,#f7faff_100%)] p-6 md:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#2b68ff]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-[#00b388]/10 blur-3xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center rounded-full border border-[#d5e4ff] bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2b68ff]">
              Portfolio Intelligence
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#121212]">AI-Powered Analysis</h2>
            <p className="mt-1 text-[#5b6a85]">Personalized recommendations generated from Chainlink-powered data signals.</p>
          </div>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="rounded-full border border-[#d5e0f6] bg-white px-4 py-2 text-sm font-semibold text-[#2b68ff] shadow-sm transition hover:border-[#bdd1ff] hover:bg-[#eff4ff]"
          >
            {showInstructions ? 'Hide' : 'How it works'}
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className="rounded-2xl border border-[#ccdcff] bg-[linear-gradient(150deg,#edf4ff_0%,#f8fcff_100%)] p-5 shadow-[0_10px_24px_rgba(43,104,255,0.08)]">
          <h3 className="mb-3 font-bold text-[#173272]">How AI Analysis Works</h3>
          <ol className="space-y-2 text-sm text-[#244586]">
            <li>1. Click Request AI Analysis to trigger Chainlink Functions.</li>
            <li>2. Chainlink DON fetches market data and sentiment.</li>
            <li>3. AI computes volatility, risk, and recommended action.</li>
            <li>4. Results are committed on-chain and available in dashboard.</li>
          </ol>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-900">
              <p className="font-semibold">Cost estimate</p>
              <p className="mt-1">~0.05 LINK execution cost plus network gas.</p>
            </div>
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-900">
              <p className="font-semibold">MetaMask review alert</p>
              <p className="mt-1">Expected for Chainlink Functions calls. Contract is verified on BaseScan.</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-900">
              <p className="font-semibold">Safety check</p>
              <p className="mt-1">No token transfer in this action. It only requests analysis.</p>
            </div>
          </div>
        </div>
      )}

      {!hasReasoning && (
        <div className="rounded-3xl border border-[#dbe3f5] bg-white p-8 shadow-[0_20px_55px_rgba(15,34,72,0.1)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eff3ff] text-[#2b68ff]">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3a2.25 2.25 0 00-2.25 2.25V7.5A2.25 2.25 0 009.75 9.75h4.5A2.25 2.25 0 0016.5 7.5V5.25A2.25 2.25 0 0014.25 3h-4.5zM4.5 12A2.25 2.25 0 016.75 9.75h10.5A2.25 2.25 0 0119.5 12v4.25a2.25 2.25 0 01-2.25 2.25h-10.5A2.25 2.25 0 014.5 16.25V12zM9 13.5h.008v.008H9V13.5zm6 0h.008v.008H15V13.5z" />
            </svg>
          </div>

          <div className="text-center">
            <h3 className="mb-2 text-2xl font-black text-[#121212]">No Analysis Yet</h3>
            <p className="mb-6 text-gray-600">Request your first AI-powered portfolio analysis.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-[linear-gradient(140deg,#fffdf5_0%,#fff5d9_100%)] p-5 text-sm text-amber-900">
              <p className="mb-2 font-semibold">Review notice</p>
              <ul className="space-y-1">
                <li>Verified contract on BaseScan.</li>
                <li>Estimated total cost around $0.60-$0.80 including LINK and gas.</li>
                <li>Safe to confirm if transaction details match this contract.</li>
              </ul>
            </div>

            <button
              onClick={handleRequestAnalysis}
              disabled={isSubmittingLocal || isPending || isConfirming}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#2b68ff] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-[#1f57de] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending && 'Waiting for approval...'}
              {isConfirming && 'Requesting analysis...'}
              {!isPending && !isConfirming && 'Request AI Analysis'}
            </button>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center text-xs text-blue-800">
                <strong>Estimated cost:</strong> ~$0.60-$0.80
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center text-xs text-blue-800">
                <strong>Expected time:</strong> 30-60 seconds
              </div>
            </div>
          </div>

          {requestErrorMessage &&
            !requestErrorMessage.toLowerCase().includes('user rejected') &&
            !requestErrorMessage.toLowerCase().includes('user denied') && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                Error: {requestErrorMessage}
                {requestErrorMessage.toLowerCase().includes('invalid chainlink functions subscription') && (
                  <div className="mt-2 text-xs text-red-800">
                    Run <code>node check-subscription.js</code> then update subscription and consumer in Chainlink Functions.
                  </div>
                )}
              </div>
            )}

          {requestSuccess && requestHash && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <p className="font-semibold">Request submitted successfully.</p>
              <p className="mt-1">Analysis in progress. This may take 30-60 seconds.</p>
              <a
                href={`https://sepolia.basescan.org/tx/${requestHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                View transaction
              </a>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-4 mt-2 rounded-full bg-green-600 px-4 py-1 text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefreshing ? 'Checking...' : 'Check result'}
              </button>
            </div>
          )}
        </div>
      )}

      {hasReasoning && parsedReasoning && (
        <div className={`space-y-5 ${isRevealingResult ? 'ui-reveal-rise' : ''}`}>
          <ReasoningCard {...parsedReasoning} />

          <div
            className={`grid gap-3 md:grid-cols-[1fr_auto] ${
              isRevealingResult ? 'ui-stagger-up' : ''
            }`}
            style={isRevealingResult ? { animationDelay: '80ms' } : undefined}
          >
            <button
              onClick={handleRequestAnalysis}
              disabled={isSubmittingLocal || isPending || isConfirming}
              className="rounded-full bg-[linear-gradient(135deg,#2b68ff_0%,#1f57de_100%)] px-7 py-3.5 font-semibold text-white shadow-[0_14px_26px_rgba(43,104,255,0.35)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_28px_rgba(43,104,255,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Requesting...' : 'Request New Analysis'}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-full border-2 border-[#d4deef] bg-white px-6 py-3 font-semibold text-[#46587a] transition hover:border-[#c1d0ea] hover:bg-[#f7faff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div
            className={`rounded-3xl border border-[#dbe2f3] bg-[linear-gradient(160deg,#f8faff_0%,#f1f5fc_100%)] p-6 text-center ${
              isRevealingResult ? 'ui-stagger-up' : ''
            }`}
            style={isRevealingResult ? { animationDelay: '150ms' } : undefined}
          >
            <p className="mb-3 text-sm text-[#5d6d88]">
              <strong>Manual Rebalance:</strong> Execute the recommended action
            </p>
            <button
              disabled
              className="cursor-not-allowed rounded-full bg-[#c8d2e5] px-6 py-3 font-semibold text-[#5f6f8a]"
            >
              Execute Rebalance (Coming Soon)
            </button>
            <p className="mt-2 text-xs text-[#7283a1]">Manual rebalance requires portfolio integration.</p>
          </div>
        </div>
      )}
    </div>
  );
}
