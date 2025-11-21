"use client";
import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { sdk } from "@farcaster/miniapp-sdk";
import { wagmiConfig } from "./lib/wagmi";
import "@coinbase/onchainkit/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

export function RootProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              name: 'Muscadine DeFi',
              logo: 'https://miniapp.muscadine.io/icon.png',
              mode: 'light',
              theme: 'default',
            },
            wallet: {
              display: 'modal',
              termsUrl: 'https://miniapp.muscadine.io/terms',
              privacyUrl: 'https://miniapp.muscadine.io/privacy',
              supportedWallets: {
                rabby: true,
                trust: true,
                frame: true,
              },
            },
          }}
          miniKit={{
            enabled: true,
            autoConnect: true,
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
