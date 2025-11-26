"use client";
import { useEffect, useRef, useState } from 'react';

const API_URL = '/api/prices';
const POLL_INTERVAL = 60_000;

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
  const controllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPrices = async () => {
      const controller = new AbortController();
      controllerRef.current = controller;

      setPrices((prev) => (prev.isLoading ? prev : { ...prev, isLoading: true }));

      try {
        const response = await fetch(API_URL, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch token prices: ${response.status}`);
        }

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        setPrices({
          usdc: data.usdc ?? 1,
          cbbtc: data.cbbtc ?? 0,
          weth: data.weth ?? 0,
          isLoading: false,
        });
      } catch (error) {
        const aborted = controller.signal.aborted || !isMounted;
        if (!aborted) {
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
      } finally {
        controllerRef.current = null;
        if (isMounted) {
          timeoutRef.current = setTimeout(fetchPrices, POLL_INTERVAL);
        }
      }
    };

    fetchPrices();

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, []);

  return prices;
}

