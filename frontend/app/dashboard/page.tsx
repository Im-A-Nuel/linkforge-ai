'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useUserProfile, useAssetPrice, useLatestReasoning, formatPrice, riskLevelToString } from '@/hooks/useContract';

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  // Read data from smart contract
  const { data: profile } = useUserProfile(address);
  const { data: ethPrice } = useAssetPrice('ETH');
  const { data: btcPrice } = useAssetPrice('BTC');
  const { data: latestReasoning } = useLatestReasoning(address);

  if (!isConnected) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-3">Welcome to LinkForge AI</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access the dashboard and manage your portfolio.
          </p>
          <Link href="/" className="inline-block rounded-full bg-[#2b68ff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f57de]">
            Go to Home
          </Link>
        </div>
      </div>
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
              {profile ? riskLevelToString(Number(profile[0])) : 'Medium'}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {profile ? (profile[2] ? 'Automation enabled' : 'Manual control') : 'Balanced allocation strategy'}
            </p>
          </div>

          {/* ESG Score */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white p-6 shadow-lg transition hover:shadow-xl">
            <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mb-1 text-sm font-semibold uppercase tracking-wider text-gray-500">
              ESG Priority
            </div>
            <div className="text-3xl font-black text-green-600">
              {profile ? (profile[1] ? 'Enabled' : 'Disabled') : 'Enabled'}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {profile ? (profile[1] ? 'Sustainable investments active' : 'Standard allocation') : 'Loading...'}
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

        {/* Recent Activity */}
        <div className="rounded-3xl border border-white/50 bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-black text-[#121212]">Recent Activity</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#121212]">AI Recommendation Executed</p>
                <p className="text-sm text-gray-600">Rebalanced to increase stable assets</p>
              </div>
              <span className="text-xs text-gray-500">2h ago</span>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#121212]">Risk Assessment Complete</p>
                <p className="text-sm text-gray-600">Portfolio risk level: Medium</p>
              </div>
              <span className="text-xs text-gray-500">5h ago</span>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#121212]">Data Synced from Oracle</p>
                <p className="text-sm text-gray-600">Latest market data updated via Chainlink</p>
              </div>
              <span className="text-xs text-gray-500">1d ago</span>
            </div>
          </div>
        </div>
    </div>
  );
}
