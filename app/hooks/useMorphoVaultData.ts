"use client";
import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';

// Morpho Blue API (current, stable schema)
const MORPHO_GRAPHQL_URL = 'https://blue-api.morpho.org/graphql';

export type VaultData = {
  address: string;
  name: string;
  symbol: string;
  apy?: number;
};

const GET_VAULT_BY_ADDRESS = gql`
  query GetVaultByAddress($address: String!, $chainId: Int!) {
    vaultByAddress(address: $address, chainId: $chainId) {
      address
      name
      symbol
      state {
        netApy
      }
      asset {
        symbol
      }
    }
  }
`;

// V2 vault query - uses vaultV2ByAddress for each address
const GET_VAULT_V2_QUERY = gql`
  query GetVaultV2($address: String!, $chainId: Int!) {
    vaultV2ByAddress(address: $address, chainId: $chainId) {
      address
      name
      symbol
      asset {
        id
        address
        decimals
      }
    }
  }
`;

export function useMorphoVaultData(vaultAddress: string) {
  return useQuery({
    queryKey: ['morphoVault', vaultAddress],
    queryFn: async () => {
      try {
        const data = await request<{
          vaultByAddress: {
            address: string;
            name: string;
            symbol: string;
            state?: { netApy?: number };
          } | null;
        }>(MORPHO_GRAPHQL_URL, GET_VAULT_BY_ADDRESS, {
          address: vaultAddress.toLowerCase(),
          chainId: BASE_CHAIN_ID,
        });

        if (data.vaultByAddress) {
          const vault = data.vaultByAddress;
          return {
            address: vault.address.toLowerCase(),
            name: vault.name,
            symbol: vault.symbol,
            apy: vault.state?.netApy,
          } as VaultData;
        }

        throw new Error('Vault not found');
      } catch (error) {
        console.error('Error fetching vault data:', error);
        // Return fallback data if GraphQL fails
        return {
          address: vaultAddress,
          name: 'Vault',
          symbol: 'VAULT',
        } as VaultData;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

// V2 Prime vault addresses (Base network, chainId: 8453)
const V2_PRIME_VAULTS = [
  '0x89712980Cb434eF5aE4AB29349419eb976B0b496',
  '0xd6dcad2f7da91fbb27bda471540d9770c97a5a43',
  '0x99dcd0d75822ba398f13b2a8852b07c7e137ec70',
].map(addr => addr.toLowerCase());

const BASE_CHAIN_ID = 8453; // Base network

function isV2Vault(address: string): boolean {
  return V2_PRIME_VAULTS.includes(address.toLowerCase());
}

export function useMorphoVaultsData(vaultAddresses: string[]) {
  return useQuery({
    queryKey: ['morphoVaults', vaultAddresses],
    queryFn: async () => {
      const addresses = vaultAddresses.map((addr) => addr.toLowerCase());
      const results: VaultData[] = [];
      
      // Separate V1 and V2 vaults
      const v1Addresses = addresses.filter(addr => !isV2Vault(addr));
      const v2Addresses = addresses.filter(addr => isV2Vault(addr));

      // Fetch V1 vaults using the current Blue API schema
      if (v1Addresses.length > 0) {
        try {
          const v1Promises = v1Addresses.map(async (address) => {
            try {
              const data = await request<{
                vaultByAddress: {
                  address: string;
                  name: string;
                  symbol: string;
                  state?: { netApy?: number };
                } | null;
              }>(
                MORPHO_GRAPHQL_URL,
                GET_VAULT_BY_ADDRESS,
                {
                  address,
                  chainId: BASE_CHAIN_ID,
                }
              );

              if (data.vaultByAddress) {
                return {
                  address: data.vaultByAddress.address.toLowerCase(),
                  name: data.vaultByAddress.name,
                  symbol: data.vaultByAddress.symbol,
                  apy: data.vaultByAddress.state?.netApy,
                } as VaultData;
              }
            } catch (error) {
              console.warn(`Failed to fetch V1 vault ${address}:`, error);
            }
            return null;
          });

          const v1Results = await Promise.all(v1Promises);
          v1Results.forEach((result) => {
            if (result) {
              results.push(result);
            }
          });
        } catch (error) {
          console.warn('V1 vaults GraphQL query failed:', error);
        }
      }

      // Fetch V2 vaults using vaultV2ByAddress
      if (v2Addresses.length > 0) {
        const v2Promises = v2Addresses.map(async (address) => {
          try {
            const data = await request<{ 
              vaultV2ByAddress: { 
                address: string; 
                name: string; 
                symbol: string; 
                asset?: { id: string; address: string; decimals: number } 
              } 
            }>(
              MORPHO_GRAPHQL_URL,
              GET_VAULT_V2_QUERY,
              { 
                address: address,
                chainId: BASE_CHAIN_ID 
              }
            );
            if (data.vaultV2ByAddress) {
              return {
                address: data.vaultV2ByAddress.address.toLowerCase(),
                name: data.vaultV2ByAddress.name,
                symbol: data.vaultV2ByAddress.symbol,
                apy: undefined, // V2 vaults may not have APY in the same format
              } as VaultData;
            }
          } catch (error) {
            console.warn(`Failed to fetch V2 vault ${address}:`, error);
          }
          return null;
        });

        const v2Results = await Promise.all(v2Promises);
        v2Results.forEach((result) => {
          if (result) {
            results.push(result);
          }
        });
      }

      // If we got some results, return them
      if (results.length > 0) {
        return results;
      }

      // Return fallback data if all queries fail
      console.warn('Using fallback vault data - GraphQL queries failed');
      return addresses.map((address) => ({
        address,
        name: 'Vault',
        symbol: 'VAULT',
      })) as VaultData[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    retry: 2, // Retry twice before using fallback
  });
}

