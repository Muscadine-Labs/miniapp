import { renderHook, waitFor } from '@testing-library/react';
import { useTokenPrices } from '../app/hooks/useTokenPrices';
import { vi } from 'vitest';

describe('useTokenPrices', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch as typeof fetch;
    vi.restoreAllMocks();
  });

  it('returns loading initially and then parsed prices', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ usdc: 1, cbbtc: 70000, weth: 3000 }),
    } as unknown as Response);

    const { result } = renderHook(() => useTokenPrices());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.usdc).toBe(1);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.cbbtc).toBe(70000);
      expect(result.current.weth).toBe(3000);
    });

    // no timers to advance when using real timers
  });

  it('handles fetch error gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error')) as ReturnType<typeof vi.fn>;
    const { result } = renderHook(() => useTokenPrices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.cbbtc).toBe(0);
      expect(result.current.weth).toBe(0);
    });

    // no timers to advance when using real timers
  });

  it('stops timer on unmount', async () => {
    const clearSpy = vi.spyOn(global, 'clearTimeout');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ usdc: 1, cbbtc: 70000, weth: 3000 }),
    } as unknown as Response);

    const { unmount, result } = renderHook(() => useTokenPrices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});

