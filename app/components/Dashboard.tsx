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
import { formatCurrency } from '../utils/formatCurrency';
import { useMorphoVaultsData, type VaultData } from '../hooks/useMorphoVaultData';
import { useMorphoVaultV2 } from '../hooks/useMorphoVaultV2';
import '@coinbase/onchainkit/styles.css';

// V2 Prime vaults
const V2_PRIME_VAULTS = [
  '0x89712980Cb434eF5aE4AB29349419eb976B0b496' as `0x${string}`,
  '0xd6dcad2f7da91fbb27bda471540d9770c97a5a43' as `0x${string}`,
  '0x99dcd0d75822ba398f13b2a8852b07c7e137ec70' as `0x${string}`,
];

// V1 Vaults
const V1_VAULTS = [
  '0xf7e26Fa48A568b8b0038e104DfD8ABdf0f99074F' as `0x${string}`,
  '0xAeCc8113a7bD0CFAF7000EA7A31afFD4691ff3E9' as `0x${string}`,
  '0x21e0d366272798da3A977FEBA699FCB91959d120' as `0x${string}`,
];


export default function Dashboard() {
  const { isConnected, address } = useAccount();

  // Get all vault addresses
  const allVaultAddresses = [...V2_PRIME_VAULTS, ...V1_VAULTS];

  // Fetch vault metadata from Morpho GraphQL
  const { data: vaultsData = [], isLoading: isLoadingVaultData } = useMorphoVaultsData(allVaultAddresses);

  // Create a map of address to vault data for quick lookup
  const vaultDataMap = React.useMemo(() => {
    const map = new Map<string, VaultData>();
    vaultsData.forEach((vault) => {
      map.set(vault.address.toLowerCase(), vault);
    });
    return map;
  }, [vaultsData]);

  // Fetch vault balances - Use custom V2 hook for V2 vaults since OnchainKit's useMorphoVault
  // may not be compatible with Morpho V2 vaults. The Earn component should still work for UI.
  const v2Prime1 = useMorphoVaultV2(V2_PRIME_VAULTS[0], address);
  const v2Prime2 = useMorphoVaultV2(V2_PRIME_VAULTS[1], address);
  const v2Prime3 = useMorphoVaultV2(V2_PRIME_VAULTS[2], address);

  // V1 vaults use OnchainKit hook (fully supported)
  const v1Vault1 = useMorphoVault({
    vaultAddress: V1_VAULTS[0],
    recipientAddress: address
  });
  const v1Vault2 = useMorphoVault({
    vaultAddress: V1_VAULTS[1],
    recipientAddress: address
  });
  const v1Vault3 = useMorphoVault({
    vaultAddress: V1_VAULTS[2],
    recipientAddress: address
  });

  // Calculate total assets deposited across all vaults
  const allVaults = [v2Prime1, v2Prime2, v2Prime3, v1Vault1, v1Vault2, v1Vault3];
  const totalAssetsDeposited = allVaults.reduce((sum, vault) => {
    const balance = typeof vault.balance === 'string' ? parseFloat(vault.balance) : (vault.balance || 0);
    return sum + balance;
    }, 0);

  // Helper to get vault data from GraphQL
  const getVaultData = (vaultAddress: string): VaultData | undefined => {
    return vaultDataMap.get(vaultAddress.toLowerCase());
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

        {/* V2 Prime Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">
            V2 Prime
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {V2_PRIME_VAULTS.map((vaultAddress) => {
              const vaultData = getVaultData(vaultAddress);
              const vaultName = vaultData?.name || vaultData?.symbol || 'Vault';
              const vaultSymbol = vaultData?.symbol;
              const apy = vaultData?.apy;
              return (
                <div
                  key={vaultAddress}
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-5 overflow-visible"
                >
                  {!isLoadingVaultData && (
                    <div className="mb-3 sm:mb-3.5">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                        {vaultName}
                      </h3>
                      {vaultSymbol && vaultSymbol !== vaultName && (
                        <p className="text-xs text-slate-500 mt-1">{vaultSymbol}</p>
                      )}
                      {apy !== undefined && apy !== null && (
                        <p className="text-sm font-medium text-emerald-600 mt-1">
                          {apy.toFixed(2)}% APY
                        </p>
                      )}
                    </div>
                  )}
                  <Earn
                    vaultAddress={vaultAddress}
                    isSponsored={true}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* V1 Vault Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">
            V1 Vault
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {V1_VAULTS.map((vaultAddress) => {
              const vaultData = getVaultData(vaultAddress);
              const vaultName = vaultData?.name || vaultData?.symbol || 'Vault';
              const vaultSymbol = vaultData?.symbol;
              const apy = vaultData?.apy;
              return (
                <div
                  key={vaultAddress}
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-5 overflow-visible"
                >
                  {!isLoadingVaultData && (
                    <div className="mb-3 sm:mb-3.5">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                        {vaultName}
                      </h3>
                      {vaultSymbol && vaultSymbol !== vaultName && (
                        <p className="text-xs text-slate-500 mt-1">{vaultSymbol}</p>
                      )}
                      {apy !== undefined && apy !== null && (
                        <p className="text-sm font-medium text-emerald-600 mt-1">
                          {apy.toFixed(2)}% APY
                        </p>
                      )}
                    </div>
                  )}
                  <Earn
                    vaultAddress={vaultAddress}
                    isSponsored={true}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

