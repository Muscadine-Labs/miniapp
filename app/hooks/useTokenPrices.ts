"use client";
import { useEffect, useState } from 'react';

export type TokenPrices = {
  usdc: number;
  cbbtc: number;
  weth: number;
  isLoading: boolean;
};

export function useTokenPrices(): TokenPrices {
  const [prices, setPrices] = useState<TokenPrices>({
    usdc: 1, // USDC is pegged to $1.00
    cbbtc: 0,
    weth: 0,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchPrices() {
      try {
        // Fetch prices from CoinGecko API (free, no API key needed)
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
        );
        const data = await response.json();

        setPrices({
          usdc: 1, // USDC = $1
          cbbtc: data.bitcoin?.usd || 0,
          weth: data.ethereum?.usd || 0,
          isLoading: false,
        });
      } catch (error) {
        // Error fetching token prices - fail silently in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching token prices:', error);
        }
        setPrices({
          usdc: 1,
          cbbtc: 0,
          weth: 0,
          isLoading: false,
        });
      }
    }

    fetchPrices();
    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return prices;
}

