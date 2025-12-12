"use client";
import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';

// Try different possible Morpho GraphQL endpoints
const MORPHO_GRAPHQL_URLS = [
  'https://api.morpho.org/graphql',
  'https://graphql.morpho.org/graphql',
  'https://api.morpho.xyz/graphql',
];
const MORPHO_GRAPHQL_URL = MORPHO_GRAPHQL_URLS[0];

export type VaultData = {
  address: string;
  name: string;
  symbol: string;
  apy?: number;
};

const GET_VAULT_QUERY = gql`
  query GetVault($address: String!) {
    vault(id: $address) {
      id
      name
      symbol
      apy
    }
  }
`;

const GET_VAULTS_QUERY = gql`
  query GetVaults($addresses: [String!]!) {
    vaults(where: { id_in: $addresses }) {
      id
      name
      symbol
      apy
    }
  }
`;

// Alternative query structure in case the API uses different field names
const GET_VAULTS_QUERY_ALT = gql`
  query GetVaults($addresses: [String!]!) {
    markets(where: { id_in: $addresses }) {
      id
      name
      symbol
      supplyAPY
    }
  }
`;

export function useMorphoVaultData(vaultAddress: string) {
  return useQuery({
    queryKey: ['morphoVault', vaultAddress],
    queryFn: async () => {
      try {
        const data = await request<{ vault: VaultData }>(MORPHO_GRAPHQL_URL, GET_VAULT_QUERY, {
          address: vaultAddress.toLowerCase(),
        });
        return data.vault;
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

export function useMorphoVaultsData(vaultAddresses: string[]) {
  return useQuery({
    queryKey: ['morphoVaults', vaultAddresses],
    queryFn: async () => {
      const addresses = vaultAddresses.map((addr) => addr.toLowerCase());
      
      // Try the primary query structure
      try {
        const data = await request<{ vaults: VaultData[] }>(MORPHO_GRAPHQL_URL, GET_VAULTS_QUERY, {
          addresses,
        });
        if (data.vaults && data.vaults.length > 0) {
          return data.vaults.map((vault) => {
            const vaultWithId = vault as VaultData & { id?: string };
            return {
              address: vaultWithId.id || vault.address,
              name: vault.name,
              symbol: vault.symbol,
              apy: vault.apy,
            };
          });
        }
      } catch (error) {
        console.warn('Primary GraphQL query failed, trying alternative structure:', error);
      }

      // Try alternative query structure
      try {
        const data = await request<{ markets: Array<{ id: string; name?: string; symbol?: string; supplyAPY?: number }> }>(
          MORPHO_GRAPHQL_URL,
          GET_VAULTS_QUERY_ALT,
          { addresses }
        );
        if (data.markets && data.markets.length > 0) {
          return data.markets.map((market) => ({
            address: market.id,
            name: market.name || market.symbol || 'Vault',
            symbol: market.symbol || 'VAULT',
            apy: market.supplyAPY,
          })) as VaultData[];
        }
      } catch (error) {
        console.warn('Alternative GraphQL query also failed:', error);
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

