"use client";
import React from 'react';
import { useAccount } from 'wagmi';
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
import { Earn, useMorphoVault } from '@coinbase/onchainkit/earn';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { formatCurrency } from '../utils/formatCurrency';
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


export default function Dashboard() {
  const { isConnected, address } = useAccount();

  // Fetch token prices
  const tokenPrices = useTokenPrices();

  // Fetch vault data from OnchainKit using useMorphoVault
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

  // Total assets deposited across all three vaults in USD
  const totalAssetsDeposited = usdcBalanceUSD + cbbtcBalanceUSD + wethBalanceUSD;

  // Helper function to get USD balance by vault address
  const getVaultBalanceUSD = (vaultAddress: string) => {
    if (vaultAddress === VAULTS[0].address) return usdcBalanceUSD;
    if (vaultAddress === VAULTS[1].address) return cbbtcBalanceUSD;
    if (vaultAddress === VAULTS[2].address) return wethBalanceUSD;
    return 0;
  };

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
        {/* Total Assets Deposited */}
        {isConnected && (
          <div className="p-4 sm:p-6 md:p-8 bg-white rounded-xl shadow-sm mb-4 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">
              Total Assets Deposited
            </h2>
            <div className="rounded-lg border border-slate-100 p-4 bg-slate-50/60">
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-2">
                Total assets deposited across all vaults
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">
                {formatCurrency(totalAssetsDeposited)}
              </p>
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
                <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500 font-medium mb-1">
                      Balance
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                      {formatCurrency(getVaultBalanceUSD(vault.address))}
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

