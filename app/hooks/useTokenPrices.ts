"use client";
import { useQuery } from '@tanstack/react-query';

const API_URL = '/api/prices';

export type TokenPrices = {
  usdc: number;
  cbbtc: number;
  weth: number;
  isLoading: boolean;
};

export function useTokenPrices(): TokenPrices {
  const { data, isLoading } = useQuery({
    queryKey: ['tokenPrices'],
    queryFn: async () => {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch token prices: ${response.status}`);
      }
      return response.json() as Promise<{ usdc: number; cbbtc: number; weth: number }>;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refetch every minute
    retry: 2,
  });

  return {
    usdc: data?.usdc ?? 1,
    cbbtc: data?.cbbtc ?? 0,
    weth: data?.weth ?? 0,
    isLoading,
  };
}

