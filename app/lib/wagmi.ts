"use client";
import { createConfig, fallback, http } from "wagmi";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { base } from "wagmi/chains";

// Create connectors without walletConnect to avoid SSR issues
// WalletConnect requires Node.js modules that cause build failures during SSR
// Users can still connect with Coinbase Wallet and injected wallets
const connectors = [
  coinbaseWallet({
    appName: "Muscadine",
    preference: "all",
    chainId: base.id,
  }),
  injected({
    shimDisconnect: true,
  }),
  // Note: walletConnect is excluded to prevent SSR build issues
  // If WalletConnect support is needed, it should be added dynamically on the client side
] as const;

export const wagmiConfig = createConfig({
  chains: [base],
  connectors,
  ssr: false,
  transports: {
    [base.id]: fallback([
      // Primary: Alchemy (more reliable)
      http("https://base-mainnet.g.alchemy.com/v2/demo", {
        retryCount: 3,
        retryDelay: 1000,
      }),
      // Fallback: Base public RPC
      http("https://mainnet.base.org", {
        retryCount: 2,
        retryDelay: 2000,
      }),
      // Backup: Ankr RPC
      http("https://rpc.ankr.com/base", {
        retryCount: 2,
        retryDelay: 2000,
      }),
    ]),
  },
});

