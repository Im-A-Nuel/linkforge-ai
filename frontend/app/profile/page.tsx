'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserProfile, useSetProfile, stringToRiskLevel, riskLevelToString } from '@/hooks/useContract';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [esgPriority, setEsgPriority] = useState(true);
  const [automationEnabled, setAutomationEnabled] = useState(false);

  // Read profile from contract
  const { data: profile, refetch } = useUserProfile(address);

  // Write profile to contract
  const { setProfile, isPending, isConfirming, isSuccess, hash, error } = useSetProfile();

  // Load profile data from contract when available
  useEffect(() => {
    if (profile) {
      setRiskLevel(riskLevelToString(Number(profile[0])).toLowerCase() as 'low' | 'medium' | 'high');
      setEsgPriority(profile[1]);
      setAutomationEnabled(profile[2]);
    }
  }, [profile]);

  if (!isConnected) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-3">Profile Settings</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to manage your profile and investment preferences.
          </p>
          <Link href="/" className="inline-block rounded-full bg-[#2b68ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f57de]">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      const riskLevelEnum = stringToRiskLevel(riskLevel);
      setProfile(riskLevelEnum, esgPriority, automationEnabled);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  // Refetch profile after successful transaction
  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  return (
    <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#121212]">
            Profile Settings
          </h1>
          <p className="mt-2 text-lg text-[#565656]">
            Configure your investment preferences and automation settings
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="rounded-lg bg-white/60 px-3 py-1.5 text-xs font-mono text-gray-700 backdrop-blur">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <div className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
              Connected
            </div>
          </div>
        </div>

        {/* Wallet Address Card */}
        <div className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-[#121212]">Wallet Address</h2>
          </div>
          <div className="rounded-2xl bg-gray-50 px-4 py-3 font-mono text-sm text-gray-700 break-all">
            {address}
          </div>
        </div>

        {/* Risk Level Card */}
        <div className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#121212]">Risk Tolerance</h2>
              <p className="text-sm text-gray-600">Select your preferred investment risk level</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(['low', 'medium', 'high'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                className={`group relative overflow-hidden rounded-2xl border-2 p-5 transition-all ${
                  riskLevel === level
                    ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`text-lg font-bold capitalize mb-1 ${
                  riskLevel === level ? 'text-amber-700' : 'text-[#121212]'
                }`}>
                  {level}
                </div>
                <div className="text-xs text-gray-600">
                  {level === 'low' && 'Conservative'}
                  {level === 'medium' && 'Balanced'}
                  {level === 'high' && 'Aggressive'}
                </div>
                {riskLevel === level && (
                  <div className="absolute right-2 top-2 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ESG Priority Card */}
        <div className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#121212]">ESG Priority</h2>
              <p className="text-sm text-gray-600">Enable sustainable and environmentally-friendly investments</p>
            </div>
          </div>
          <button
            onClick={() => setEsgPriority(!esgPriority)}
            className={`w-full rounded-2xl border-2 p-6 transition-all ${
              esgPriority
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${esgPriority ? 'text-green-700' : 'text-gray-700'}`}>
                {esgPriority ? 'Enabled' : 'Disabled'}
              </span>
              <div
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  esgPriority ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    esgPriority ? 'translate-x-9' : 'translate-x-1'
                  }`}
                ></div>
              </div>
            </div>
          </button>
        </div>

        {/* Chainlink Automation Card */}
        <div className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#121212]">Chainlink Automation</h2>
              <p className="text-sm text-gray-600">Enable automated rebalancing based on AI recommendations</p>
            </div>
          </div>
          <button
            onClick={() => setAutomationEnabled(!automationEnabled)}
            className={`w-full rounded-2xl border-2 p-6 transition-all ${
              automationEnabled
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${automationEnabled ? 'text-blue-700' : 'text-gray-700'}`}>
                {automationEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <div
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  automationEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    automationEnabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                ></div>
              </div>
            </div>
          </button>
        </div>

        {/* Save Button */}
        <div className="space-y-4">
          <button
            onClick={handleSaveProfile}
            disabled={isPending || isConfirming}
            className="w-full rounded-full bg-gradient-to-r from-[#2b68ff] to-[#1f57de] px-8 py-4 text-lg font-bold text-white shadow-xl transition hover:shadow-2xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isPending && 'Waiting for approval...'}
            {isConfirming && 'Confirming transaction...'}
            {!isPending && !isConfirming && 'Save Profile Settings'}
          </button>

          {/* Transaction Status */}
          {hash && (
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Transaction submitted:</span>{' '}
                <a
                  href={`https://sepolia.basescan.org/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  View on BaseScan ↗
                </a>
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-700">
                ✅ Profile saved successfully to blockchain!
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                ❌ Error: {error.message}
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
