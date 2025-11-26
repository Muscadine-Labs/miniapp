import { renderHook, waitFor } from '@testing-library/react';
import type { Address } from 'viem';
import { useVaultHistory } from '../app/hooks/useVaultHistory';
import { usePublicClient } from 'wagmi';
import { vi } from 'vitest';

vi.mock('wagmi', () => ({
  usePublicClient: vi.fn(),
}));

type MockLog = { args: { assets: bigint } };

describe('useVaultHistory', () => {

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('computes totals, net deposits, and interest correctly', async () => {
    const depositLogs: MockLog[] = [
      { args: { assets: 1000000n } }, // 1.0 tokens
      { args: { assets: 500000n } },  // 0.5 tokens
    ];
    const withdrawLogs: MockLog[] = [
      { args: { assets: 200000n } },  // 0.2 tokens
    ];

    (usePublicClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getLogs: vi
        .fn()
        // first call deposits
        .mockResolvedValueOnce(depositLogs)
        // second call withdrawals
        .mockResolvedValueOnce(withdrawLogs),
    });

    const vault: Address = '0xdead' as Address;
    const user: Address = '0x1234' as Address;
    const decimals = 6; // assets are in micro units above
    const price = 10;   // $10 per token
    // currentBalance in USD, e.g., 1.5 tokens * $10 = $15
    const currentBalanceUSD = 15;

    const { result } = renderHook(() =>
      useVaultHistory(vault, user, currentBalanceUSD, decimals, price)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Deposits: 1.0 + 0.5 = 1.5 tokens => $15
    expect(result.current.totalDeposited).toBeCloseTo(15, 6);
    // Withdrawals: 0.2 tokens => $2
    expect(result.current.totalWithdrawn).toBeCloseTo(2, 6);
    // Net deposits: 15 - 2 = $13
    expect(result.current.netDeposits).toBeCloseTo(13, 6);
    // Interest: currentBalanceUSD(15) - netDeposits(13) = $2
    expect(result.current.interestEarned).toBeCloseTo(2, 6);
  });

  it('returns zeros when no public client or user', async () => {
    (usePublicClient as ReturnType<typeof vi.fn>).mockReturnValue(null);

    const { result } = renderHook(() =>
      useVaultHistory('0xdead' as Address, undefined, 0, 6, 1)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current).toMatchObject({
      totalDeposited: 0,
      totalWithdrawn: 0,
      netDeposits: 0,
      interestEarned: 0,
    });
  });
});

