'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

type ConnectWalletProps = {
  className?: string;
  label?: string;
};

export function ConnectWallet({
  className = '',
  label = 'Connect',
}: ConnectWalletProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className={`rounded-full bg-[#2b68ff] px-7 py-3 text-base font-semibold text-white shadow-[0_10px_24px_rgba(43,104,255,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f57de] hover:shadow-[0_14px_28px_rgba(43,104,255,0.42)] ${className}`}
            >
              {label}
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className={`rounded-full bg-[#f97316] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ea580c] ${className}`}
            >
              Wrong network
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openAccountModal}
            className={`rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#1e293b] shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_22px_rgba(0,0,0,0.18)] ${className}`}
          >
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
