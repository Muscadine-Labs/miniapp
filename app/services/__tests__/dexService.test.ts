import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import axios from 'axios';
import DEXService from '../dexService';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as unknown as {
  get: Mock;
};

// Setup axios.get as a mock
mockedAxios.get = vi.fn();

describe('DEXService', () => {
  let dexService: DEXService;

  beforeEach(() => {
    dexService = DEXService.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DEXService.getInstance();
      const instance2 = DEXService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Token Management', () => {
    it('should return supported tokens', () => {
      const tokens = dexService.getSupportedTokens();
      expect(tokens).toContain('ETH');
      expect(tokens).toContain('WETH');
      expect(tokens).toContain('USDC');
      expect(tokens).toContain('cbBTC');
    });

    it('should return token address for supported token', () => {
      const ethAddress = dexService.getTokenAddress('ETH');
      expect(ethAddress).toBe('0x0000000000000000000000000000000000000000');
      
      const usdcAddress = dexService.getTokenAddress('USDC');
      expect(usdcAddress).toBe('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
    });

    it('should return undefined for unsupported token', () => {
      const address = dexService.getTokenAddress('UNSUPPORTED');
      expect(address).toBeUndefined();
    });
  });

  describe('getQuote', () => {
    const mockQuoteResponse = {
      status: 200,
      data: {
        toAmount: '1000000', // 1 USDC (6 decimals)
        estimatedGas: '150000'
      }
    };

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue(mockQuoteResponse);
    });

    it('should get quote successfully', async () => {
      const quote = await dexService.getQuote('WETH', 'USDC', '1', '0x123', 3);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.1inch.dev/swap/v7.0//8453/quote',
        {
          params: {
            fromTokenAddress: '0x4200000000000000000000000000000000000006',
            toTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            amount: '1000000000000000000', // 1 WETH (18 decimals)
            slippage: 3,
            includeTokensInfo: true,
            includeProtocols: true
          }
        }
      );

      expect(quote).toEqual({
        fromToken: 'WETH',
        toToken: 'USDC',
        fromAmount: '1',
        toAmount: '1', // formatted from 1000000 (6 decimals)
        estimatedGas: '150000',
        slippagePercentage: '3'
      });
    });

    it('should handle ETH to USDC quote', async () => {
      await dexService.getQuote('ETH', 'USDC', '1', '0x123', 5);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/quote'),
        {
          params: expect.objectContaining({
            fromTokenAddress: '0x0000000000000000000000000000000000000000',
            toTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            amount: '1000000000000000000', // 1 ETH (18 decimals)
            slippage: 5
          })
        }
      );
    });

    it('should handle cbBTC to WETH quote', async () => {
      await dexService.getQuote('cbBTC', 'WETH', '0.01', '0x123', 2);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/quote'),
        {
          params: expect.objectContaining({
            fromTokenAddress: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
            toTokenAddress: '0x4200000000000000000000000000000000000006',
            amount: '1000000', // 0.01 cbBTC (8 decimals)
            slippage: 2
          })
        }
      );
    });

    it('should return null on API error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const quote = await dexService.getQuote('WETH', 'USDC', '1', '0x123', 3);

      expect(quote).toBeNull();
    });

    it('should return null on invalid response', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { invalid: 'response' }
      });

      const quote = await dexService.getQuote('WETH', 'USDC', '1', '0x123', 3);

      expect(quote).toBeNull();
    });

    it('should return null on non-200 status', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 400,
        statusText: 'Bad Request'
      });

      const quote = await dexService.getQuote('WETH', 'USDC', '1', '0x123', 3);

      expect(quote).toBeNull();
    });

    it('should use custom token addresses when provided', async () => {
      await dexService.getQuote('0xCustomToken', 'USDC', '1', '0x123', 3);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/quote'),
        {
          params: expect.objectContaining({
            fromTokenAddress: '0xCustomToken',
            toTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
          })
        }
      );
    });
  });

  describe('getSwapTransaction', () => {
    const mockSwapResponse = {
      status: 200,
      data: {
        tx: {
          to: '0xContractAddress',
          data: '0xSwapData',
          value: '0',
          gas: '200000',
          gasPrice: '1000000000'
        }
      }
    };

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue(mockSwapResponse);
    });

    it('should get swap transaction successfully', async () => {
      const transaction = await dexService.getSwapTransaction('WETH', 'USDC', '1', '0x123', 3);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.1inch.dev/swap/v7.0//8453/swap',
        {
          params: {
            fromTokenAddress: '0x4200000000000000000000000000000000000006',
            toTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            amount: '1000000000000000000',
            fromAddress: '0x123',
            slippage: 3,
            includeTokensInfo: true,
            includeProtocols: true
          }
        }
      );

      expect(transaction).toEqual({
        to: '0xContractAddress',
        data: '0xSwapData',
        value: '0',
        gas: '200000',
        gasPrice: '1000000000'
      });
    });

    it('should return null on API error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const transaction = await dexService.getSwapTransaction('WETH', 'USDC', '1', '0x123', 3);

      expect(transaction).toBeNull();
    });

    it('should return null on invalid response', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: { invalid: 'response' }
      });

      const transaction = await dexService.getSwapTransaction('WETH', 'USDC', '1', '0x123', 3);

      expect(transaction).toBeNull();
    });

    it('should handle missing optional fields', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: {
          tx: {
            to: '0xContractAddress',
            data: '0xSwapData',
            gas: '200000'
            // Missing value and gasPrice
          }
        }
      });

      const transaction = await dexService.getSwapTransaction('WETH', 'USDC', '1', '0x123', 3);

      expect(transaction).toEqual({
        to: '0xContractAddress',
        data: '0xSwapData',
        value: '0', // Default value
        gas: '200000',
        gasPrice: undefined
      });
    });
  });

  describe('swapWETHToUSDC', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: {
          toAmount: '1000000',
          estimatedGas: '150000'
        }
      });
    });

    it('should return both quote and transaction', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          status: 200,
          data: {
            toAmount: '1000000',
            estimatedGas: '150000'
          }
        })
        .mockResolvedValueOnce({
          status: 200,
          data: {
            tx: {
              to: '0xContractAddress',
              data: '0xSwapData',
              value: '0',
              gas: '200000'
            }
          }
        });

      const result = await dexService.swapWETHToUSDC('1', '0x123');

      expect(result.quote).toBeDefined();
      expect(result.transaction).toBeDefined();
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('swapTokens', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: {
          toAmount: '1000000',
          estimatedGas: '150000'
        }
      });
    });

    it('should return both quote and transaction with custom slippage', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          status: 200,
          data: {
            toAmount: '1000000',
            estimatedGas: '150000'
          }
        })
        .mockResolvedValueOnce({
          status: 200,
          data: {
            tx: {
              to: '0xContractAddress',
              data: '0xSwapData',
              value: '0',
              gas: '200000'
            }
          }
        });

      const result = await dexService.swapTokens('ETH', 'cbBTC', '1', '0x123', 5);

      expect(result.quote).toBeDefined();
      expect(result.transaction).toBeDefined();
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      
      // Check that custom slippage was used
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/quote'),
        {
          params: expect.objectContaining({
            slippage: 5
          })
        }
      );
    });

    it('should use default slippage when not provided', async () => {
      await dexService.swapTokens('ETH', 'cbBTC', '1', '0x123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/quote'),
        {
          params: expect.objectContaining({
            slippage: 3 // Default slippage
          })
        }
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      const quote = await dexService.getQuote('WETH', 'USDC', '1', '0x123', 3);
      const transaction = await dexService.getSwapTransaction('WETH', 'USDC', '1', '0x123', 3);

      expect(quote).toBeNull();
      expect(transaction).toBeNull();
    });

    it('should handle malformed responses gracefully', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: null
      });

      const quote = await dexService.getQuote('WETH', 'USDC', '1', '0x123', 3);
      const transaction = await dexService.getSwapTransaction('WETH', 'USDC', '1', '0x123', 3);

      expect(quote).toBeNull();
      expect(transaction).toBeNull();
    });
  });
});
