"use client";
import { createConfig, fallback, http, createStorage } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { base } from "wagmi/chains";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  coinbaseWallet({
    appName: "Muscadine DeFi",
    preference: "all",
    chainId: base.id,
  }),
  injected({
    shimDisconnect: true,
  }),
  ...(walletConnectProjectId
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          metadata: {
            name: "Muscadine DeFi",
            description: "Lend and earn on Base",
            url: "https://miniapp.muscadine.io",
            icons: ["https://miniapp.muscadine.io/icon.png"],
          },
          showQrModal: true,
        }),
      ]
    : []),
] as const;

// Create storage for persisting wallet connection state
// Uses localStorage to persist connection across page refreshes
const storage = createStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'wagmi',
});

export const wagmiConfig = createConfig({
  chains: [base],
  connectors,
  ssr: true,
  storage,
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

