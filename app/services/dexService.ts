import { createPublicClient, http, parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import axios from 'axios';

// 1inch Integration for token swapping
export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  slippagePercentage: string;
}

export interface SwapTransaction {
  to: string;
  data: string;
  value: string;
  gas: string;
  gasPrice?: string;
}

class DEXService {
  private static instance: DEXService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private publicClient: any;
  
  // Token addresses on Base
  private readonly tokenAddresses: Record<string, string> = {
    ETH: '0x0000000000000000000000000000000000000000',
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    cbBTC: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    MORPHO: '0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842',
    cbXRP: '0xcb585250f852C6c6bf90434AB21A00f02833a4af',
    AERO: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    MOONWELL: '0xA88594D404727625A9437C3f886C7643872296AE'
  };

  constructor() {
    this.publicClient = createPublicClient({
      chain: base,
      transport: http()
    });
  }

  static getInstance(): DEXService {
    if (!DEXService.instance) {
      DEXService.instance = new DEXService();
    }
    return DEXService.instance;
  }

  // Get 1inch quote for swap
  async getQuote(
    fromAsset: string,
    toAsset: string,
    amount: string,
    recipient: string,
    slippage: number = 3
  ): Promise<SwapQuote | null> {
    try {
      const baseUrl = 'https://api.1inch.dev/swap/v7.0/';
      const chainId = 8453; // Explicitly set Base chain ID (8453)
      
      const fromTokenAddress = this.tokenAddresses[fromAsset] || fromAsset;
      const toTokenAddress = this.tokenAddresses[toAsset] || toAsset;
      
      // Format amount for 1inch API with proper decimals for each token
      let fromDecimals = 18; // Default for ETH
      let toDecimals = 18; // Default
      
      if (fromAsset === 'ETH' || fromAsset === 'WETH') fromDecimals = 18;
      else if (fromAsset === 'USDC') fromDecimals = 6;
      else if (fromAsset === 'cbBTC') fromDecimals = 8;
      else fromDecimals = 18; // Default for other tokens
      
      if (toAsset === 'ETH' || toAsset === 'WETH') toDecimals = 18;
      else if (toAsset === 'USDC') toDecimals = 6;
      else if (toAsset === 'cbBTC') toDecimals = 8;
      else toDecimals = 18; // Default for other tokens
      
      const formattedAmount = parseUnits(amount, fromDecimals).toString();

      console.log('Getting quote from params:', {
        fromTokenAddress,
        toTokenAddress,
        formattedAmount,
        slippage,
        chainId
      });

      // Get swap quote from 1inch
      const response = await axios.get(`${baseUrl}/${chainId}/quote`, {
        params: {
          fromTokenAddress: fromTokenAddress,
          toTokenAddress: toTokenAddress,
          amount: formattedAmount,
          slippage: slippage,
          includeTokensInfo: true,
          includeProtocols: true
        }
      });

      if (response.status !== 200) {
        console.error('1inch API error:', response.statusText);
        return null;
      }

      const data = response.data;
      console.log('1inch quote API response:', { data });
      
      // Validate essential response fields
      if (!data || !data.toAmount) {
        console.error('Invalid quote response format:', data);
        return null;
      }
      
      return {
        fromToken: fromAsset,
        toToken: toAsset,
        fromAmount: amount,
        toAmount: formatUnits(data.toAmount, toDecimals),
        estimatedGas: data.estimatedGas,
        slippagePercentage: slippage.toString()
      };
    } catch (error) {
      console.error('Error getting 1inch quote:', error);
      return null;
    }
  }

  // Execute swap using 1inch
  async getSwapTransaction(
    fromAsset: string,
    toAsset: string,
    amount: string,
    fromAddress: string,
    slippage: number = 3
  ): Promise<SwapTransaction | null> {
    try {
      const baseUrl = 'https://api.1inch.dev/swap/v7.0/';
      const chainId = 8453; // Explicitly set Base chain ID (8453)
      
      const fromTokenAddress = this.tokenAddresses[fromAsset] || fromAsset;
      const toTokenAddress = this.tokenAddresses[toAsset] || toAsset;
      
      // Format amount for 1inch API with proper decimals for each token
      let decimals = 18; // Default for ETH
      if (fromAsset === 'ETH' || fromAsset === 'WETH') decimals = 18;
      else if (fromAsset === 'USDC') decimals = 6;
      else if (fromAsset === 'cbBTC') decimals = 8;
      else decimals = 18; // Default for other tokens
      
      const formattedAmount = parseUnits(amount, decimals).toString();

      console.log('Getting swap transaction from params:', {
        fromTokenAddress,
        toTokenAddress,
        formattedAmount,
        fromAddress,
        slippage,
        chainId
      });

      // Get swap transaction data from 1inch
      const response = await axios.get(`${baseUrl}/${chainId}/swap`, {
        params: {
          fromTokenAddress: fromTokenAddress,
          toTokenAddress: toTokenAddress,
          amount: formattedAmount,
          fromAddress: fromAddress,
          slippage: slippage,
          includeTokensInfo: true,
          includeProtocols: true
        }
      });

      if (response.status !== 200) {
        console.error('1inch swap transaction error:', response.statusText);
        return null;
      }

      const data = response.data;
      console.log('1inch API response:', { data, fullResponse: response.data });
      
      // Validate that the transaction response contains the required fields
      if (!data || !data.tx || !data.tx.to || !data.tx.data) {
        console.error('Invalid 1inch API response format:', data);
        return null;
      }
      
      return {
        to: data.tx.to,
        data: data.tx.data,
        value: data.tx.value || '0',
        gas: data.tx.gas,
        gasPrice: data.tx.gasPrice
      };
    } catch (error) {
      console.error('Error getting swap transaction:', error);
      return null;
    }
  }

  // WETH to USDC specific swap
  async swapWETHToUSDC(
    amount: string,
    recipient: string
  ): Promise<{
    quote: SwapQuote | null;
    transaction: SwapTransaction | null;
  }> {
    const quote = await this.getQuote('WETH', 'USDC', amount, recipient);
    const transaction = await this.getSwapTransaction('WETH', 'USDC', amount, recipient);

    return {
      quote,
      transaction
    };
  }

  // Generic swap function
  async swapTokens(
    fromToken: string,
    toToken: string,
    amount: string,
    recipient: string,
    slippage: number = 3
  ): Promise<{
    quote: SwapQuote | null;
    transaction: SwapTransaction | null;
  }> {
    const quote = await this.getQuote(fromToken, toToken, amount, recipient, slippage);
    const transaction = await this.getSwapTransaction(fromToken, toToken, amount, recipient, slippage);

    return {
      quote,
      transaction
    };
  }

  // Get supported tokens list
  getSupportedTokens(): string[] {
    return Object.keys(this.tokenAddresses);
  }

  // Get token address
  getTokenAddress(tokenSymbol: string): string | undefined {
    return this.tokenAddresses[tokenSymbol];
  }
}

export default DEXService;
