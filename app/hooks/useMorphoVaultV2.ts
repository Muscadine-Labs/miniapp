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

  // Get asset decimals (important: assets use asset decimals, not vault decimals)
  const { data: assetDecimals } = useReadContract({
    address: assetAddress,
    abi: [
      {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
      },
    ],
    functionName: 'decimals',
    query: {
      enabled: !!assetAddress,
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
  const vaultDecimals = decimals ?? 18; // Vault decimals for shares
  const assetDecimalsValue = assetDecimals ?? 18; // Asset decimals for balance display

  // Calculate balance: convertToAssets returns assets in asset decimals
  let balance: string | number = 0;
  if (assets && assetDecimalsValue) {
    // convertToAssets returns assets in asset decimals
    balance = parseFloat(formatUnits(assets, assetDecimalsValue));
  } else if (shares && shares > 0n) {
    // Fallback: if convertToAssets fails, try to convert shares using vault decimals
    // This is less accurate but better than showing 0
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

