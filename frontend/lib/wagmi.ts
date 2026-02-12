import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { baseSepolia, sepolia } from 'wagmi/chains';

export const chains = [baseSepolia, sepolia] as const;

const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
  'a7f8b4476f024aa0b8b8c7adf7f9c5f1';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        rabbyWallet,
        braveWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: 'LinkForge AI',
    projectId,
  }
);

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
});
