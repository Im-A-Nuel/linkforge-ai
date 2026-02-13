import { createConfig, http } from 'wagmi';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { baseSepolia } from 'wagmi/chains';

export const chains = [baseSepolia] as const;

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: 'LinkForge AI',
    }),
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: false,
});
