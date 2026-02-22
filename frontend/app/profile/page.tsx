'use client';

import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { useSetProfile, stringToRiskLevel, riskLevelToString } from '@/hooks/useContract';
import { useCachedProfile } from '@/hooks/useCachedProfile';
import { HydrationLoader, WalletRequiredState } from '@/components/ui/wallet-states';
import { useToast } from '@/components/ui/toast';

const PROJECT_LOGO = '/icon/LinkForge%20AI%20logo.png';

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { pushToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [esgPriority, setEsgPriority] = useState(true);
  const [automationEnabled, setAutomationEnabled] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Read profile from contract with caching
  const { profile, forceRefresh } = useCachedProfile(address);

  // Write profile to contract
  const { setProfile, isPending, isConfirming, isSuccess, hash, error } = useSetProfile();

  // Load profile data from contract when available
  useEffect(() => {
    if (profile) {
      setRiskLevel(riskLevelToString(profile.riskLevel).toLowerCase() as 'low' | 'medium' | 'high');
      setEsgPriority(profile.esgPriority);
      setAutomationEnabled(profile.automationEnabled);
    }
  }, [profile]);

  // Force refresh after successful transaction with delay
  useEffect(() => {
    if (isSuccess) {
      pushToast({
        type: 'success',
        title: 'Profile updated',
        message: 'Your portfolio preferences are saved on-chain.',
      });

      // Wait 3 seconds for blockchain to update, then force refresh
      const timer = setTimeout(() => {
        forceRefresh();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, forceRefresh, pushToast]);

  useEffect(() => {
    if (!error) return;

    pushToast({
      type: 'error',
      title: 'Failed to save profile',
      message: error.message,
      duration: 5600,
    });
  }, [error, pushToast]);

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return (
      <HydrationLoader
        title="Loading profile settings"
        subtitle="Checking wallet and reading latest preference state..."
      />
    );
  }

  if (!isConnected) {
    return (
      <WalletRequiredState
        title="Profile Access Locked"
        description="Connect wallet to manage risk level, ESG priority, and automation preferences."
        hint="These settings are tied to your wallet address."
      />
    );
  }

  const handleSaveProfile = async () => {
    try {
      const riskLevelEnum = stringToRiskLevel(riskLevel);
      setProfile(riskLevelEnum, esgPriority, automationEnabled);
      pushToast({
        type: 'info',
        title: 'Transaction requested',
        message: 'Approve the wallet prompt to save profile settings.',
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      pushToast({
        type: 'error',
        title: 'Could not start transaction',
        message: err instanceof Error ? err.message : 'Unexpected error',
      });
    }
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 21c3-8 9-13 15-14-1 6-6 12-14 15M6 21l9-9" />
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
            <div className="flex h-12 w-12 items-center justify-center">
              <Image
                src={PROJECT_LOGO}
                alt="LinkForge AI"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover shadow-[0_10px_24px_rgba(43,104,255,0.28)]"
              />
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
                  View on BaseScan
                </a>
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-green-700">
                Profile saved successfully to blockchain.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-red-700">
                Error: {error.message}
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
