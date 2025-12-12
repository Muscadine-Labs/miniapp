"use client";
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { Address } from 'viem';

// ERC-4626 standard ABI for vault operations
const ERC4626_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'asset',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'totalAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'convertToAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

export type MorphoVaultV2Data = {
  balance: string | number;
  isLoading: boolean;
  error: Error | null;
  decimals: number;
  assetAddress: Address | null;
};

/**
 * Custom hook for Morpho V2 vaults that reads directly from ERC-4626 contract
 * This is a fallback when OnchainKit's useMorphoVault doesn't support V2
 */
export function useMorphoVaultV2(
  vaultAddress: Address | undefined,
  recipientAddress: Address | undefined
): MorphoVaultV2Data {
  // Get user's share balance
  const { data: shares, isLoading: isLoadingShares, error: sharesError } = useReadContract({
    address: vaultAddress,
    abi: ERC4626_ABI,
    functionName: 'balanceOf',
    args: recipientAddress ? [recipientAddress] : undefined,
    query: {
      enabled: !!vaultAddress && !!recipientAddress,
    },
  });

  // Get vault decimals
  const { data: decimals, isLoading: isLoadingDecimals } = useReadContract({
    address: vaultAddress,
    abi: ERC4626_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!vaultAddress,
    },
  });

  // Get asset address
  const { data: assetAddress } = useReadContract({
    address: vaultAddress,
    abi: ERC4626_ABI,
    functionName: 'asset',
    query: {
      enabled: !!vaultAddress,
    },
  });

  // Convert shares to assets
  const { data: assets, isLoading: isLoadingAssets, error: assetsError } = useReadContract({
    address: vaultAddress,
    abi: ERC4626_ABI,
    functionName: 'convertToAssets',
    args: shares ? [shares] : undefined,
    query: {
      enabled: !!vaultAddress && !!shares && shares > 0n,
    },
  });

  const isLoading = isLoadingShares || isLoadingDecimals || isLoadingAssets;
  const error = sharesError || assetsError || null;
  const vaultDecimals = decimals ?? 18; // Default to 18 if not available

  // Calculate balance: if we have assets directly, use that; otherwise use shares converted
  let balance: string | number = 0;
  if (assets && vaultDecimals) {
    balance = parseFloat(formatUnits(assets, vaultDecimals));
  } else if (shares && vaultDecimals) {
    // Fallback: use shares if convertToAssets fails (shouldn't happen for ERC-4626, but just in case)
    balance = parseFloat(formatUnits(shares, vaultDecimals));
  }

  return {
    balance,
    isLoading,
    error: error as Error | null,
    decimals: vaultDecimals,
    assetAddress: assetAddress as Address | null,
  };
}

