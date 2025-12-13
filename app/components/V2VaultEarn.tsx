"use client";
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useChainId, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { base } from 'wagmi/chains';
import { formatUnits, Address, erc4626Abi } from 'viem';
import { useMorphoVaultV2 } from '../hooks/useMorphoVaultV2';
import { useVaultTransactions, type TransactionProgressStep } from '../hooks/useVaultTransactions';
import { useTransactionModal } from '../contexts/TransactionModalContext';
import { useQueryClient } from '@tanstack/react-query';

interface V2VaultEarnProps {
  vaultAddress: Address;
  recipientAddress: Address | undefined;
}

export function V2VaultEarn({ vaultAddress, recipientAddress }: V2VaultEarnProps) {
  const [amount, setAmount] = useState('');
  const [isDeposit, setIsDeposit] = useState(true);
  const [txProgress, setTxProgress] = useState<TransactionProgressStep | null>(null);
  const [currentTxHash, setCurrentTxHash] = useState<string | null>(null);
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const isOnBase = chainId === base.id;
  const queryClient = useQueryClient();
  const { openTransactionModal, updateTransactionStatus } = useTransactionModal();
  
  const vaultData = useMorphoVaultV2(vaultAddress, recipientAddress);
  const { executeVaultAction, isLoading: isTxLoading, error: txError } = useVaultTransactions(vaultAddress);
  
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

  // Watch for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: currentTxHash as `0x${string}` | undefined,
    query: {
      enabled: !!currentTxHash,
    },
  });

  // Refetch data when transactions complete
  useEffect(() => {
    if (isTxSuccess && currentTxHash) {
      // Refetch balances after successful transaction
      refetchAssetBalance();
      queryClient.invalidateQueries();
      // Reset amount after successful transaction
      setAmount('');
      setCurrentTxHash(null);
      setTxProgress(null);
      updateTransactionStatus('success', undefined, currentTxHash);
    }
  }, [isTxSuccess, currentTxHash, refetchAssetBalance, queryClient, updateTransactionStatus]);

  // Helper to parse amount safely
  const parseAmount = (val: string): number => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleDeposit = async () => {
    if (!amount || !recipientAddress || !assetAddress) return;
    if (!isOnBase) return;
    
    try {
      // Open transaction modal for better UX
      openTransactionModal('deposit', vaultAddress, 'Vault', 'TOKEN', amount);
      updateTransactionStatus('confirming');
      
      // Progress callback for transaction steps
      const onProgress = (step: TransactionProgressStep) => {
        setTxProgress(step);
        if (step.type === 'confirming' && step.txHash) {
          setCurrentTxHash(step.txHash);
          updateTransactionStatus('confirming', undefined, step.txHash);
        } else if (step.type === 'signing') {
          updateTransactionStatus('signing');
        } else if (step.type === 'approving') {
          updateTransactionStatus('approving');
        }
      };

      const txHash = await executeVaultAction('deposit', vaultAddress, amount, onProgress);
      setCurrentTxHash(txHash);
      updateTransactionStatus('confirming', undefined, txHash);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      updateTransactionStatus('error', errorMessage);
      setTxProgress(null);
      console.error('Deposit error:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !recipientAddress) return;
    if (!isOnBase) return;
    
    try {
      // Open transaction modal for better UX
      openTransactionModal('withdraw', vaultAddress, 'Vault', 'TOKEN', amount);
      updateTransactionStatus('confirming');
      
      // Progress callback for transaction steps
      const onProgress = (step: TransactionProgressStep) => {
        setTxProgress(step);
        if (step.type === 'confirming' && step.txHash) {
          setCurrentTxHash(step.txHash);
          updateTransactionStatus('confirming', undefined, step.txHash);
        } else if (step.type === 'signing') {
          updateTransactionStatus('signing');
        } else if (step.type === 'approving') {
          updateTransactionStatus('approving');
        }
      };

      const txHash = await executeVaultAction('withdraw', vaultAddress, amount, onProgress);
      setCurrentTxHash(txHash);
      updateTransactionStatus('confirming', undefined, txHash);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      updateTransactionStatus('error', errorMessage);
      setTxProgress(null);
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

  // Determine loading/submitting state
  const isSubmitting = isTxLoading || isConfirming || isSwitching;
  
  // Get status message from progress
  const getStatusMessage = () => {
    if (!txProgress) return null;
    
    if (txProgress.type === 'signing') {
      return `Signing transaction... (${txProgress.stepIndex + 1}/${txProgress.totalSteps})`;
    }
    if (txProgress.type === 'approving') {
      return `Approving... (${txProgress.stepIndex + 1}/${txProgress.totalSteps})`;
    }
    if (txProgress.type === 'confirming') {
      return isConfirming ? 'Confirming transaction...' : 'Transaction confirmed!';
    }
    return null;
  };

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
          <button
            onClick={handleDeposit}
            disabled={
              !amount || 
              parseAmount(amount) <= 0 || 
              isSubmitting || 
              !isOnBase ||
              (assetBalanceFormatted !== null && assetBalanceFormatted < parseAmount(amount))
            }
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (getStatusMessage() || 'Processing...') : 'Deposit'}
          </button>
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
            {isSubmitting ? (getStatusMessage() || 'Processing...') : 'Withdraw'}
          </button>
        )}
      </div>

      {/* Transaction Status */}
      {currentTxHash && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Transaction submitted! {isConfirming ? 'Confirming...' : 'Confirmed'}
          </p>
          {currentTxHash && (
            <a
              href={`https://basescan.org/tx/${currentTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-700 underline mt-1 block"
            >
              View on BaseScan
            </a>
          )}
        </div>
      )}
      {txError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-sm text-rose-800 break-words">
            {txError}
          </p>
        </div>
      )}
      {txProgress && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {getStatusMessage()}
          </p>
          {txProgress.type === 'approving' && txProgress.txHash && (
            <a
              href={`https://basescan.org/tx/${txProgress.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline mt-1 block"
            >
              View approval on BaseScan
            </a>
          )}
        </div>
      )}
    </div>
  );
}
