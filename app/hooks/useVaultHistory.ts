"use client";
import { useEffect, useMemo, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { Address, formatUnits, parseAbiItem } from 'viem';

export type VaultHistory = {
  totalDeposited: number;
  totalWithdrawn: number;
  netDeposits: number;
  interestEarned: number;
  isLoading: boolean;
};

type RawVaultHistory = {
  totalDepositedTokens: number;
  totalWithdrawnTokens: number;
};

const historyCache = new Map<string, RawVaultHistory>();

const getCacheKey = (vaultAddress: Address, userAddress: Address) =>
  `${vaultAddress.toLowerCase()}:${userAddress.toLowerCase()}`;

export function useVaultHistory(
  vaultAddress: Address,
  userAddress: Address | undefined,
  currentBalance: number,
  decimals: number,
  tokenPriceUSD: number = 1
): VaultHistory {
  const publicClient = usePublicClient();

  const [rawHistory, setRawHistory] = useState<RawVaultHistory>(() => ({
    totalDepositedTokens: 0,
    totalWithdrawnTokens: 0,
  }));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!publicClient || !userAddress || !vaultAddress) {
      setRawHistory({
        totalDepositedTokens: 0,
        totalWithdrawnTokens: 0,
      });
      setIsLoading(false);
      return;
    }
    const client = publicClient;

    const cacheKey = getCacheKey(vaultAddress, userAddress);
    const cached = historyCache.get(cacheKey);
    if (cached) {
      setRawHistory(cached);
      setIsLoading(false);
    }

    let cancelled = false;

    async function fetchHistory() {
      setIsLoading(true);
      try {
        const logsParams = {
          address: vaultAddress,
          args: {
            owner: userAddress,
          },
          fromBlock: 0n,
          toBlock: 'latest' as const,
        };

        const [depositLogs, withdrawLogs] = await Promise.all([
          client.getLogs({
            ...logsParams,
            event: parseAbiItem('event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)'),
          }),
          client.getLogs({
            ...logsParams,
            event: parseAbiItem('event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)'),
          }),
        ]);

        const totals = depositLogs.reduce(
          (sum, log) => {
            const assets = log.args.assets as bigint;
            return sum + Number(formatUnits(assets, decimals));
          },
          0
        );

        const withdrawals = withdrawLogs.reduce(
          (sum, log) => {
            const assets = log.args.assets as bigint;
            return sum + Number(formatUnits(assets, decimals));
          },
          0
        );

        if (cancelled) {
          return;
        }

        const nextRaw: RawVaultHistory = {
          totalDepositedTokens: totals,
          totalWithdrawnTokens: withdrawals,
        };

        historyCache.set(cacheKey, nextRaw);
        setRawHistory(nextRaw);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching vault history:', error);
        }
        if (!cancelled) {
          setRawHistory({
            totalDepositedTokens: 0,
            totalWithdrawnTokens: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [publicClient, vaultAddress, userAddress, decimals]);

  const derivedHistory = useMemo(() => {
    const totalDeposited = rawHistory.totalDepositedTokens * tokenPriceUSD;
    const totalWithdrawn = rawHistory.totalWithdrawnTokens * tokenPriceUSD;
    const netDeposits = totalDeposited - totalWithdrawn;
    const interestEarned = Math.max(0, currentBalance - netDeposits);

    return {
      totalDeposited,
      totalWithdrawn,
      netDeposits,
      interestEarned,
    };
  }, [rawHistory, tokenPriceUSD, currentBalance]);

  return {
    ...derivedHistory,
    isLoading,
  };
}

