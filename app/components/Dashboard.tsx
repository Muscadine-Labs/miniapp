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
// Removed color import - using CSS classes instead
import { Earn, useMorphoVault } from '@coinbase/onchainkit/earn';
import { useVaultHistory } from '../hooks/useVaultHistory';
import { useTokenPrices } from '../hooks/useTokenPrices';
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

export default function Dashboard() {
  const { isConnected, address } = useAccount();

  // Fetch token prices
  const tokenPrices = useTokenPrices();

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

  // Calculate projected annual return for each vault (without fees)
  const getVaultProjectedYield = (vault: typeof usdcVault, balanceUSD: number) => {
    const apy = vault.totalApy || 0;
    return balanceUSD * (apy / 100);
  };
  
  // Projected Annual Return: based on current balances and APYs
  const projectedAnnualReturn = 
    getVaultProjectedYield(usdcVault, usdcBalanceUSD) + 
    getVaultProjectedYield(cbbtcVault, cbbtcBalanceUSD) + 
    getVaultProjectedYield(wethVault, wethBalanceUSD);
  
  // Expected Monthly Interest
  const expectedMonthlyInterest = projectedAnnualReturn / 12;


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem 1rem'
    }}>
      {/* Header/Banner */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#0f172a',
            margin: 0
          }}>
            <a 
              href="https://muscadine.box" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#0f172a',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Muscadine
            </a>
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: '0.25rem 0 0'
          }}>
            DeFi Lending on Base
          </p>
        </div>
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
      </header>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Claim Rewards Button removed - no longer using Morpho rewards */}

        {/* Portfolio Overview */}
        {isConnected && (
          <div style={{
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#0f172a',
              marginBottom: '1.5rem'
            }}>
              Portfolio Overview
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem'
            }}>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Total Deposited
                </div>
                <div style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#0f172a'
                }}>
                  {formatCurrency(currentBalance)}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Initial Deposited
                </div>
                <div style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#0f172a'
                }}>
                  {formatCurrency(initialDeposited)}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Total Return
                </div>
                <div style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#10b981'
                }}>
                  {formatCurrency(currentBalance)}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Total Interest Earned
                </div>
                <div style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#10b981'
                }}>
                  {formatCurrency(totalInterestEarned)}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#64748b',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Expected Monthly Interest
                </div>
                <div style={{
                  fontSize: '1.875rem',
                  fontWeight: '700',
                  color: '#6366f1'
                }}>
                  {formatCurrency(expectedMonthlyInterest)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vault Cards using OnchainKit Earn */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.25rem'
        }}>
          {VAULTS.map((vault) => (
            <div
              key={vault.address}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                padding: '1.25rem',
                overflow: 'visible'
              }}
            >
              <div style={{
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 0.875rem'
                }}>
                  {vault.name}
                </h3>
                
                {/* Custom stats section */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  padding: '0.625rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: '500',
                      marginBottom: '0.25rem'
                    }}>
                      Balance
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#0f172a'
                    }}>
                      {formatCurrency(getVaultBalanceUSD(vault.address))}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: '500',
                      marginBottom: '0.25rem'
                    }}>
                      Interest Earned
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#10b981'
                    }}>
                      {(() => {
                        const vaultHistory = getVaultHistory(vault.address);
                        return formatCurrency(vaultHistory?.interestEarned || 0);
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* OnchainKit Earn Component */}
              <div style={{
                margin: '-0.25rem -0.75rem -0.75rem -0.75rem',
                padding: '0',
                overflow: 'visible'
              }}>
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

