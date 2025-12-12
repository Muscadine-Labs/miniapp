"use client";
import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { formatUnits, parseUnits, Address, erc4626Abi } from 'viem';
import { useMorphoVaultV2 } from '../hooks/useMorphoVaultV2';

interface V2VaultEarnProps {
  vaultAddress: Address;
  recipientAddress: Address | undefined;
}

export function V2VaultEarn({ vaultAddress, recipientAddress }: V2VaultEarnProps) {
  const [amount, setAmount] = useState('');
  const [isDeposit, setIsDeposit] = useState(true);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const isOnBase = chainId === base.id;
  
  const vaultData = useMorphoVaultV2(vaultAddress, recipientAddress);
  
  // Get asset address from vault (Base chain)
  const { data: assetAddress } = useReadContract({
    address: vaultAddress,
    abi: erc4626Abi,
    functionName: 'asset',
    chainId: base.id,
  });

  // Get asset decimals
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
    chainId: base.id,
    query: {
      enabled: !!assetAddress,
    },
  });

  const decimals = assetDecimals !== undefined ? Number(assetDecimals) : 18;
  const balance = typeof vaultData.balance === 'string' 
    ? parseFloat(vaultData.balance) 
    : (vaultData.balance || 0);

  // Get asset balance for deposits
  const { data: assetBalance, refetch: refetchAssetBalance } = useReadContract({
    address: assetAddress,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ],
    functionName: 'balanceOf',
    args: recipientAddress ? [recipientAddress] : undefined,
    chainId: base.id,
    query: {
      enabled: !!assetAddress && !!recipientAddress,
    },
  });

  const assetBalanceFormatted = assetBalance !== undefined
    ? parseFloat(formatUnits(assetBalance, decimals))
    : null;

  // Check allowance for deposits
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: assetAddress,
    abi: [
      {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ],
    functionName: 'allowance',
    args: recipientAddress && vaultAddress ? [recipientAddress, vaultAddress] : undefined,
    chainId: base.id,
    query: {
      enabled: !!assetAddress && !!recipientAddress && !!vaultAddress,
    },
  });

  const needsApproval = React.useMemo(() => {
    if (!isDeposit || !amount) return false;
    if (allowance === undefined) return true;
    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) return false;
      const amountWei = parseUnits(amount, decimals);
      return amountWei > allowance;
    } catch {
      return false;
    }
  }, [isDeposit, amount, allowance, decimals]);

  // Helper to parse amount safely
  const parseAmount = (val: string): number => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Approve transaction (for deposits)
  const { writeContract: approve, data: approveHash, isPending: isApproving, error: approveError } = useWriteContract();
  const { isLoading: isApprovingConfirming, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Deposit/Withdraw transaction
  const { writeContract: depositOrWithdraw, data: txHash, isPending: isPendingTx, error: txError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refetch data when transactions complete
  useEffect(() => {
    if (isApproved) {
      // Refetch allowance after approval
      refetchAllowance();
    }
  }, [isApproved, refetchAllowance]);

  useEffect(() => {
    if (isTxSuccess) {
      // Refetch balances and allowance after deposit/withdraw
      refetchAssetBalance();
      refetchAllowance();
      // Reset amount after successful transaction
      setAmount('');
    }
  }, [isTxSuccess, refetchAssetBalance, refetchAllowance]);

  const handleApprove = async () => {
    if (!assetAddress || !amount || !recipientAddress) return;
    
    try {
      const amountWei = parseUnits(amount, decimals);
      approve({
        address: assetAddress,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
            outputs: [{ name: '', type: 'bool' }],
          },
        ],
        functionName: 'approve',
        args: [vaultAddress, amountWei],
        chainId: base.id,
      });
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleDeposit = async () => {
    if (!amount || !recipientAddress || !assetAddress) return;
    if (!isOnBase) return;
    
    // Don't proceed if approval is needed - user must approve first via the approve button
    // The UI already shows the approve button when needsApproval is true
    if (needsApproval) {
      console.warn('Approval required before deposit');
      return;
    }
    
    try {
      const amountWei = parseUnits(amount, decimals);
      depositOrWithdraw({
        address: vaultAddress,
        abi: erc4626Abi,
        functionName: 'deposit',
        args: [amountWei, recipientAddress],
        chainId: base.id,
      });
    } catch (error) {
      console.error('Deposit error:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !recipientAddress) return;
    if (!isOnBase) return;
    
    try {
      const amountWei = parseUnits(amount, decimals);
      depositOrWithdraw({
        address: vaultAddress,
        abi: erc4626Abi,
        functionName: 'withdraw',
        args: [amountWei, recipientAddress, recipientAddress],
        chainId: base.id,
      });
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  };

  const handleMax = () => {
    if (isDeposit) {
      if (assetBalanceFormatted !== null) {
        setAmount(assetBalanceFormatted.toFixed(6));
      }
    } else {
      setAmount(balance.toFixed(6));
    }
  };

  // Only disable buttons/inputs when actively submitting transactions, not when refetching data
  const isSubmitting = isPendingTx || isConfirming || isApproving || isApprovingConfirming || isSwitching;

  if (!isConnected) {
    return (
      <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
        <p className="text-sm text-slate-600 text-center">
          Connect your wallet to interact with this vault
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Balance Display */}
      <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-600">Your Balance</span>
          <span className="text-lg font-semibold text-slate-900">
            {vaultData.isLoading ? '...' : balance.toFixed(6)}
          </span>
        </div>
        {!isDeposit && assetBalanceFormatted !== null && assetBalanceFormatted > 0 && (
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Asset Balance</span>
            <span>{assetBalanceFormatted.toFixed(6)}</span>
          </div>
        )}
        {!isOnBase && (
          <div className="mt-3 flex items-center justify-between text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
            <span>Wrong network — switch to Base to continue.</span>
            <button
              onClick={() => switchChain?.({ chainId: base.id })}
              className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
              disabled={isSwitching || !switchChain}
            >
              {isSwitching ? 'Switching...' : 'Switch'}
            </button>
          </div>
        )}
      </div>

      {/* Toggle Deposit/Withdraw */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => {
            setIsDeposit(true);
            setAmount('');
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isDeposit
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => {
            setIsDeposit(false);
            setAmount('');
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            !isDeposit
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Withdraw
        </button>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            min="0"
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting || !isOnBase}
          />
          <button
            onClick={handleMax}
            className="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Max
          </button>
        </div>

        {/* Action Button */}
        {isDeposit ? (
          needsApproval && !isApproved ? (
            <button
              onClick={handleApprove}
              disabled={
                !amount || 
                parseAmount(amount) <= 0 || 
                isSubmitting || 
                (assetBalanceFormatted !== null && assetBalanceFormatted < parseAmount(amount))
              }
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApproving || isApprovingConfirming ? 'Approving...' : 'Approve'}
            </button>
          ) : (
            <button
              onClick={handleDeposit}
              disabled={
                !amount || 
                parseAmount(amount) <= 0 || 
                isSubmitting || 
                !isOnBase ||
                (assetBalanceFormatted !== null && assetBalanceFormatted < parseAmount(amount)) || 
                needsApproval
              }
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPendingTx || isConfirming ? 'Processing...' : 'Deposit'}
            </button>
          )
        ) : (
          <button
            onClick={handleWithdraw}
            disabled={
                !amount || 
                parseAmount(amount) <= 0 || 
                isSubmitting || 
                !isOnBase ||
                balance < parseAmount(amount)
            }
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPendingTx || isConfirming ? 'Processing...' : 'Withdraw'}
          </button>
        )}
      </div>

      {/* Transaction Status */}
      {txHash && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Transaction submitted! {isConfirming ? 'Confirming...' : 'Confirmed'}
          </p>
        </div>
      )}
      {(approveError || txError) && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-800 break-words">
            {(approveError ?? txError)?.message}
          </p>
        </div>
      )}
    </div>
  );
}

