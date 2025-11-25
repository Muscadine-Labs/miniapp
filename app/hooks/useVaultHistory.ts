"use client";
import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { Address, formatUnits, parseAbiItem } from 'viem';

export type VaultHistory = {
  totalDeposited: number;
  totalWithdrawn: number;
  netDeposits: number;
  interestEarned: number;
  isLoading: boolean;
};

export function useVaultHistory(
  vaultAddress: Address,
  userAddress: Address | undefined,
  currentBalance: number,
  decimals: number,
  tokenPriceUSD: number = 1
): VaultHistory {
  const publicClient = usePublicClient();
  const [history, setHistory] = useState<VaultHistory>({
    totalDeposited: 0,
    totalWithdrawn: 0,
    netDeposits: 0,
    interestEarned: 0,
    isLoading: true,
  });

  useEffect(() => {
    if (!publicClient || !userAddress || !vaultAddress) {
      setHistory({
        totalDeposited: 0,
        totalWithdrawn: 0,
        netDeposits: 0,
        interestEarned: 0,
        isLoading: false,
      });
      return;
    }

    async function fetchHistory() {
      try {

        // Deposit event: event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)
        const depositLogs = await publicClient!.getLogs({
          address: vaultAddress,
          event: parseAbiItem('event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)'),
          args: {
            owner: userAddress,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        });

        // Withdraw event: event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)
        const withdrawLogs = await publicClient!.getLogs({
          address: vaultAddress,
          event: parseAbiItem('event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)'),
          args: {
            owner: userAddress,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        });


        // Calculate total deposited (in USD)
        const totalDeposited = depositLogs.reduce((sum, log) => {
          const assets = log.args.assets as bigint;
          const tokenAmount = Number(formatUnits(assets, decimals));
          const usdAmount = tokenAmount * tokenPriceUSD;
          return sum + usdAmount;
        }, 0);

        // Calculate total withdrawn (in USD)
        const totalWithdrawn = withdrawLogs.reduce((sum, log) => {
          const assets = log.args.assets as bigint;
          const tokenAmount = Number(formatUnits(assets, decimals));
          const usdAmount = tokenAmount * tokenPriceUSD;
          return sum + usdAmount;
        }, 0);

        // Net deposits = deposits - withdrawals
        const netDeposits = totalDeposited - totalWithdrawn;

        // Interest earned = current balance - net deposits
        const interestEarned = Math.max(0, currentBalance - netDeposits);

        setHistory({
          totalDeposited,
          totalWithdrawn,
          netDeposits,
          interestEarned,
          isLoading: false,
        });
      } catch (error) {
        // Error fetching vault history - fail silently in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching vault history:', error);
        }
        setHistory({
          totalDeposited: 0,
          totalWithdrawn: 0,
          netDeposits: 0,
          interestEarned: 0,
          isLoading: false,
        });
      }
    }

    fetchHistory();
  }, [publicClient, vaultAddress, userAddress, currentBalance, decimals, tokenPriceUSD]);

  return history;
}

