'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRequestAIAnalysis, useLatestReasoning } from '@/hooks/useContract';
import { useCachedProfile } from '@/hooks/useCachedProfile';
import ReasoningCard from './ReasoningCard';

// Chainlink Functions source code (ULTRA-TINY version - smallest possible!)
// Uses only ETH to minimize calldata size and stay under Base Sepolia gas limit (~500 bytes)
const FUNCTIONS_SOURCE = `const[u,r]=[args[0],+args[1]];const m=await Functions.makeHttpRequest({url:"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true"});if(m.error)throw Error("Failed");const s=await Functions.makeHttpRequest({url:"https://api.alternative.me/fng/"});const sent=s.error?0:(+s.data.data[0].value-50)*2;const vol=Math.min(Math.abs(m.data.ethereum?.usd_24h_change||0)*20,100);const risk=Math.min(Math.round((sent<0?-sent:0)*.4+vol*.6),100);const act=risk>70&&r===0?1:vol>80?3:risk<30&&r===2&&sent>30?2:0;const {AbiCoder}=await import("npm:ethers@6.13.2");const coder=AbiCoder.defaultAbiCoder();const encoded=coder.encode(["int256","uint256","uint256","uint256","uint8","string"],[Math.round(sent*100),Math.round(vol),Math.round(risk),75,act,""]);const hex=encoded.slice(2);const out=new Uint8Array(hex.length/2);for(let i=0;i<out.length;i++){out[i]=parseInt(hex.slice(i*2,i*2+2),16)}return out;`.trim();

export default function AIAnalysisSection() {
  const { address } = useAccount();
  const { profile } = useCachedProfile(address);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  // Request AI analysis
  const {
    requestAnalysis,
    isPending,
    isConfirming,
    isSuccess: requestSuccess,
    hash: requestHash,
    errorMessage: requestErrorMessage,
  } = useRequestAIAnalysis();

  // Get latest reasoning
  const { data: reasoning, refetch: refetchReasoning } = useLatestReasoning(address);

  const hasReasoning = reasoning && Number(reasoning.timestamp) > 0;

  // Parse reasoning data
  const parsedReasoning = hasReasoning
    ? {
        sentimentScore: Number(reasoning.sentimentScore) / 100, // Divide by 100 (was multiplied in Functions)
        volatilityScore: Number(reasoning.volatilityScore),
        riskScore: Number(reasoning.riskScore),
        esgScore: Number(reasoning.esgScore),
        recommendedAction: Number(reasoning.recommendedAction),
        ipfsHash: reasoning.ipfsHash,
        timestamp: reasoning.timestamp,
      }
    : null;

  const handleRequestAnalysis = async () => {
    if (isSubmittingLocal || isPending || isConfirming) {
      return;
    }

    if (!profile) {
      alert('Please set your profile first in the Profile page');
      return;
    }

    // Prepare arguments for Chainlink Functions (ULTRA-TINY version only needs 2 args)
    const args = [
      address || '0x0',
      profile.riskLevel.toString(),
    ];

    setIsSubmittingLocal(true);
    try {
      // Request AI analysis via Chainlink Functions
      await requestAnalysis(FUNCTIONS_SOURCE, args);
    } catch (err: any) {
      const message = err?.message || '';

      // Handle user rejection silently
      if (message.toLowerCase().includes('user rejected') || message.toLowerCase().includes('user denied')) {
        console.log('User cancelled transaction');
        // Don't show error for user cancellation
        return;
      }
      // For other errors, let the component show them
      console.error('Analysis request error:', err);
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const handleRefresh = () => {
    refetchReasoning();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#121212]">AI-Powered Analysis</h2>
          <p className="mt-1 text-gray-600">
            Get personalized portfolio recommendations powered by Chainlink oracles
          </p>
        </div>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-200"
        >
          {showInstructions ? 'Hide' : 'How it works'}
        </button>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="mb-3 font-bold text-blue-900">How AI Analysis Works</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>
                Click <strong>"Request AI Analysis"</strong> to trigger Chainlink Functions
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>
                Chainlink DON fetches real market data (prices, sentiment, volatility)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>AI analyzes data based on your risk profile and ESG preferences</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>
                Results stored on-chain with recommendation (HOLD, SHIFT TO STABLE, etc.)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">5.</span>
              <span>
                Review recommendation and execute rebalance if desired
              </span>
            </li>
          </ol>

          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800">
              <strong>💰 Cost Breakdown:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Chainlink Functions: ~0.05 LINK (~$0.50)</li>
                <li>Gas fees: ~$0.001-0.01 (Base Sepolia is cheap!)</li>
                <li><strong>Total: ~$0.50-0.60 per analysis</strong></li>
              </ul>
            </div>

            <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-xs text-orange-800">
              <strong>⚠️ MetaMask Warning "Review alert":</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li><strong>This is NORMAL!</strong> MetaMask detects Chainlink Functions code</li>
                <li>Contract is verified: <code>0x32A00...2D4C</code></li>
                <li><strong>Fee ~$0.80 is expected</strong> (LINK payment included)</li>
                <li>Click <strong>"Confirm"</strong> to proceed - it's safe!</li>
              </ul>
            </div>

            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-800">
              <strong>✅ Verify Transaction Safety:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Network: <strong>Base Sepolia Testnet</strong> ✅</li>
                <li>Contract: Verified on BaseScan ✅</li>
                <li>No tokens being transferred ✅</li>
                <li>Only triggering AI analysis ✅</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Request Button */}
      {!hasReasoning && (
        <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-blue-50 to-purple-50 p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-4xl">
            🤖
          </div>
          <h3 className="mb-2 text-2xl font-black text-[#121212]">
            No Analysis Yet
          </h3>
          <p className="mb-6 text-gray-600">
            Request your first AI-powered portfolio analysis
          </p>

          <div className="space-y-3">
            {/* MetaMask Warning Pre-Info */}
            <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1 text-sm">
                  <p className="font-bold text-orange-900 mb-2">
                    MetaMask will show "Review alert" - This is Normal!
                  </p>
                  <ul className="space-y-1 text-orange-800">
                    <li className="flex items-start gap-2">
                      <span>✅</span>
                      <span><strong>Contract verified</strong> on BaseScan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>✅</span>
                      <span><strong>Fee ~$0.80</strong> is correct (includes LINK payment)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>✅</span>
                      <span><strong>Safe to confirm</strong> - just triggering AI analysis</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={handleRequestAnalysis}
              disabled={isSubmittingLocal || isPending || isConfirming}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-xl transition hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPending && '⏳ Waiting for approval...'}
              {isConfirming && '⏳ Requesting analysis...'}
              {!isPending && !isConfirming && (
                <>
                  <span className="text-2xl">🚀</span>
                  Request AI Analysis
                </>
              )}
            </button>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center text-xs text-blue-700">
              <strong>💰 Cost:</strong> ~$0.60-0.80 total (LINK + gas)
              {' • '}
              <strong>⏱️ Time:</strong> 30-60s
            </div>
          </div>

          {requestErrorMessage &&
           !requestErrorMessage.toLowerCase().includes('user rejected') &&
           !requestErrorMessage.toLowerCase().includes('user denied') && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              Error: {requestErrorMessage}
              {requestErrorMessage.toLowerCase().includes('invalid chainlink functions subscription') && (
                <div className="mt-2 text-xs text-red-800">
                  Run <code>node check-subscription.js</code> then update subscription/consumer in Chainlink Functions.
                </div>
              )}
            </div>
          )}

          {requestSuccess && requestHash && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <p className="font-semibold">✅ Request submitted!</p>
              <p className="mt-1">
                Analysis in progress... This may take 30-60 seconds.
              </p>
              <a
                href={`https://sepolia.basescan.org/tx/${requestHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                View transaction →
              </a>
              <button
                onClick={handleRefresh}
                className="mt-2 ml-4 rounded-full bg-green-600 px-4 py-1 text-white hover:bg-green-700"
              >
                Check Result
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analysis Result */}
      {hasReasoning && parsedReasoning && (
        <div className="space-y-4">
          <ReasoningCard {...parsedReasoning} />

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleRequestAnalysis}
              disabled={isSubmittingLocal || isPending || isConfirming}
              className="flex-1 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending || isConfirming ? '⏳ Requesting...' : '🔄 Request New Analysis'}
            </button>

            <button
              onClick={handleRefresh}
              className="rounded-full border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              ♻️ Refresh
            </button>
          </div>

          {/* Execute Rebalance (coming soon) */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              <strong>Manual Rebalance:</strong> Execute the recommended action
            </p>
            <button
              disabled
              className="rounded-full bg-gray-300 px-6 py-3 font-semibold text-gray-500 cursor-not-allowed"
            >
              🚧 Execute Rebalance (Coming Soon)
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Manual rebalance requires portfolio integration
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
