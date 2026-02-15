'use client';

import { ConnectWallet } from '@/components/connect-wallet';

type HydrationLoaderProps = {
  title?: string;
  subtitle?: string;
};

type WalletRequiredStateProps = {
  title: string;
  description: string;
  hint?: string;
};

export function HydrationLoader({
  title = 'Preparing your workspace',
  subtitle = 'Syncing wallet session and portfolio context...',
}: HydrationLoaderProps) {
  return (
    <div className="flex min-h-[62vh] items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-[#dbe3f5] bg-[linear-gradient(140deg,#ffffff_0%,#f5f9ff_100%)] p-8 shadow-[0_22px_55px_rgba(14,32,70,0.14)] ui-reveal-rise">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9f1ff]">
          <div className="relative h-8 w-8 rounded-full bg-[#2b68ff]/20">
            <div className="ui-pulse-ring absolute inset-0 rounded-full border border-[#2b68ff]/30" />
            <div className="absolute inset-2 rounded-full bg-[#2b68ff]" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-black text-[#10203f]">{title}</h2>
        <p className="mt-2 text-center text-sm text-[#5a6b88]">{subtitle}</p>

        <div className="mt-6 space-y-3">
          <div className="h-3 overflow-hidden rounded-full bg-[#dfe8fa]">
            <div className="h-full w-1/2 rounded-full bg-[#2b68ff]/35 ui-shimmer" />
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#dfe8fa]">
            <div className="h-full w-2/3 rounded-full bg-[#2b68ff]/25 ui-shimmer" />
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#dfe8fa]">
            <div className="h-full w-1/3 rounded-full bg-[#2b68ff]/30 ui-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WalletRequiredState({
  title,
  description,
  hint = 'Connect your wallet to continue.',
}: WalletRequiredStateProps) {
  return (
    <div className="flex min-h-[62vh] items-center justify-center px-4 sm:px-6">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#dbe3f5] bg-[linear-gradient(145deg,#ffffff_0%,#f2f7ff_100%)] p-8 shadow-[0_24px_60px_rgba(11,27,62,0.16)] ui-reveal-rise">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#2b68ff]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-[#00b388]/10 blur-3xl" />

        <div className="relative text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2b68ff] text-white shadow-[0_12px_25px_rgba(43,104,255,0.38)]">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 .552-.448 1-1 1H7a1 1 0 01-1-1v-1a4 4 0 118 0v1zm-6 0h8m-8 0v5a2 2 0 002 2h6a2 2 0 002-2v-5" />
            </svg>
          </div>

          <p className="inline-flex items-center rounded-full border border-[#d5e4ff] bg-[#eef4ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2b68ff]">
            Wallet Authentication Required
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#10203f]">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#5d6f8b]">{description}</p>

          <div className="mt-7 flex justify-center">
            <ConnectWallet label="Connect Wallet" className="px-8 py-3.5 text-sm" />
          </div>

          <p className="mt-4 text-xs font-medium text-[#7083a3]">{hint}</p>
        </div>
      </div>
    </div>
  );
}
