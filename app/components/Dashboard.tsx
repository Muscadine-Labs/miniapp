"use client";
import React from 'react';
import { useAccount, useReadContracts } from 'wagmi';
import { base } from 'wagmi/chains';
import { erc20Abi, formatUnits } from 'viem';
import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
  WalletDropdownDisconnect 
} from '@coinbase/onchainkit/wallet';
import { 
  Address, 
  Avatar, 
  Name, 
  Identity 
} from '@coinbase/onchainkit/identity';
// Removed color import - using CSS classes instead
import { Earn, useMorphoVault } from '@coinbase/onchainkit/earn';
import { useVaultHistory } from '../hooks/useVaultHistory';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { formatCurrency } from '../utils/formatCurrency';
// ClaimRewardsButton removed - no longer using Morpho rewards
import '@coinbase/onchainkit/styles.css';

// Vault configurations - using verified addresses
const VAULTS = [
  {
    address: '0xf7e26Fa48A568b8b0038e104DfD8ABdf0f99074F' as `0x${string}`,
    name: 'Muscadine USDC Vault',
    symbol: 'USDC',
  },
  {
    address: '0xAeCc8113a7bD0CFAF7000EA7A31afFD4691ff3E9' as `0x${string}`,
    name: 'Muscadine cbBTC Vault',
    symbol: 'cbBTC',
  },
  {
    address: '0x21e0d366272798da3A977FEBA699FCB91959d120' as `0x${string}`,
    name: 'Muscadine WETH Vault',
    symbol: 'WETH',
  },
];

const LIQUID_TOKENS = [
  {
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    decimals: 6,
    priceKey: 'usdc' as const,
  },
  {
    symbol: 'cbBTC',
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf' as `0x${string}`,
    decimals: 8,
    priceKey: 'cbbtc' as const,
  },
  {
    symbol: 'WETH',
    address: '0x4200000000000000000000000000000000000006' as `0x${string}`,
    decimals: 18,
    priceKey: 'weth' as const,
  },
] as const;

export default function Dashboard() {
  const { isConnected, address } = useAccount();

  // Fetch token prices
  const tokenPrices = useTokenPrices();

  const walletContracts = React.useMemo(() => {
    if (!address) return [];
    return LIQUID_TOKENS.map((token) => ({
      abi: erc20Abi,
      address: token.address,
      functionName: 'balanceOf' as const,
      args: [address],
      chainId: base.id,
    }));
  }, [address]);

  const { data: walletBalancesData } = useReadContracts({
    contracts: walletContracts,
    query: {
      enabled: walletContracts.length > 0,
      refetchInterval: 15000,
    },
  });

  // Token prices available for calculations

  // Fetch vault data from OnchainKit
  const usdcVault = useMorphoVault({
    vaultAddress: VAULTS[0].address,
    recipientAddress: address
  });

  const cbbtcVault = useMorphoVault({
    vaultAddress: VAULTS[1].address,
    recipientAddress: address
  });

  const wethVault = useMorphoVault({
    vaultAddress: VAULTS[2].address,
    recipientAddress: address
  });

  // Helper to safely convert balance to number
  const getBalanceNumber = (balance: string | number | undefined) => {
    if (balance === undefined) return 0;
    return typeof balance === 'string' ? parseFloat(balance) : balance;
  };

  // Helper to convert token balance to USD value
  const getUSDValue = (tokenBalance: string | number | undefined, tokenSymbol: string) => {
    const balance = getBalanceNumber(tokenBalance);
    if (balance === 0) return 0;

    switch (tokenSymbol) {
      case 'USDC':
        return balance * tokenPrices.usdc;
      case 'cbBTC':
        return balance * tokenPrices.cbbtc;
      case 'WETH':
        return balance * tokenPrices.weth;
      default:
        return 0;
    }
  };

  // Convert vault balances to USD
  const usdcBalanceUSD = getUSDValue(usdcVault.balance, 'USDC');
  const cbbtcBalanceUSD = getUSDValue(cbbtcVault.balance, 'cbBTC');
  const wethBalanceUSD = getUSDValue(wethVault.balance, 'WETH');

  // USD balances calculated for each vault

  const liquidBalanceUSD = React.useMemo(() => {
    if (!walletBalancesData?.length) return 0;
    return walletBalancesData.reduce((sum, entry, index) => {
      const token = LIQUID_TOKENS[index];
      if (!token || !entry?.result) return sum;
      const tokenAmount = Number(formatUnits(entry.result as bigint, token.decimals));
      const tokenPrice = tokenPrices[token.priceKey] || 0;
      return sum + tokenAmount * tokenPrice;
    }, 0);
  }, [walletBalancesData, tokenPrices]);

  // Fetch historical deposit/withdraw data for each vault (using USD values)
  const usdcHistory = useVaultHistory(
    VAULTS[0].address,
    address,
    usdcBalanceUSD,
    usdcVault.asset.decimals || 6,
    tokenPrices.usdc
  );

  const cbbtcHistory = useVaultHistory(
    VAULTS[1].address,
    address,
    cbbtcBalanceUSD,
    cbbtcVault.asset.decimals || 8,
    tokenPrices.cbbtc
  );

  const wethHistory = useVaultHistory(
    VAULTS[2].address,
    address,
    wethBalanceUSD,
    wethVault.asset.decimals || 18,
    tokenPrices.weth
  );

  // Helper function to get vault history by address
  const getVaultHistory = (vaultAddress: string) => {
    if (vaultAddress === VAULTS[0].address) return usdcHistory;
    if (vaultAddress === VAULTS[1].address) return cbbtcHistory;
    if (vaultAddress === VAULTS[2].address) return wethHistory;
    return null;
  };

  // Helper function to get USD balance by vault address
  const getVaultBalanceUSD = (vaultAddress: string) => {
    if (vaultAddress === VAULTS[0].address) return usdcBalanceUSD;
    if (vaultAddress === VAULTS[1].address) return cbbtcBalanceUSD;
    if (vaultAddress === VAULTS[2].address) return wethBalanceUSD;
    return 0;
  };

  // Calculate portfolio totals using real historical data
  // Initial Deposited: net deposits (deposits - withdrawals) across all vaults in USD
  const initialDeposited = 
    usdcHistory.netDeposits + 
    cbbtcHistory.netDeposits + 
    wethHistory.netDeposits;

  // Current Balance: total value across all vaults in USD
  const currentBalance = 
    usdcBalanceUSD + 
    cbbtcBalanceUSD + 
    wethBalanceUSD;
  
  // Total Interest Earned: actual interest earned to date
  const totalInterestEarned = 
    usdcHistory.interestEarned + 
    cbbtcHistory.interestEarned + 
    wethHistory.interestEarned;

  // Portfolio totals calculated from vault history

  const totalAssets = currentBalance + liquidBalanceUSD;
  const totalDeposited = initialDeposited;
  const totalEarned = totalInterestEarned;


  return (
    <div className="min-h-screen bg-slate-50 py-4 px-3 sm:py-8 sm:px-4">
      {/* Header/Banner */}
      <header className="max-w-7xl mx-auto mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 p-4 sm:p-6 bg-white rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 m-0">
            <a 
              href="https://muscadine.box" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-900 no-underline hover:underline"
            >
              Muscadine
            </a>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            DeFi Lending on Base
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Wallet>
            <ConnectWallet>
              <Avatar className="h-6 w-6" />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address className="text-gray-500" />
              </Identity>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Claim Rewards Button removed - no longer using Morpho rewards */}

        {/* Portfolio Overview */}
        {isConnected && (
          <div className="p-4 sm:p-6 md:p-8 bg-white rounded-xl shadow-sm mb-4 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">
              Portfolio Overview
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-100 p-4 bg-slate-50/60">
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-2">
                  Total Assets
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">
                  {formatCurrency(totalAssets)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Liquid + Morpho vault positions
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4 bg-slate-50/60">
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-2">
                  Total Deposited
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">
                  {formatCurrency(totalDeposited)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  All deposits into Morpho vaults
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4 bg-slate-50/60">
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-2">
                  Total Earned
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-500 break-words">
                  {formatCurrency(totalEarned)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Interest generated from Morpho
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vault Cards using OnchainKit Earn */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {VAULTS.map((vault) => (
            <div
              key={vault.address}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-5 overflow-visible"
            >
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-3.5">
                  {vault.name}
                </h3>
                
                {/* Custom stats section */}
                <div className="grid grid-cols-2 gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">
                      Balance
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                      {formatCurrency(getVaultBalanceUSD(vault.address))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">
                      Interest Earned
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-emerald-500 break-words">
                      {(() => {
                        const vaultHistory = getVaultHistory(vault.address);
                        return formatCurrency(vaultHistory?.interestEarned || 0);
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* OnchainKit Earn Component */}
              <div className="-mx-3 -mb-3 sm:-mx-4 sm:-mb-4 p-0 overflow-visible">
                <Earn
                  vaultAddress={vault.address}
                  isSponsored={true}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

