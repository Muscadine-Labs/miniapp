import { NextResponse } from 'next/server';

type PriceResponse = {
  usdc: number;
  cbbtc: number;
  weth: number;
};

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd';

const CACHE_TTL_MS = 60_000;
let cachedPrices: { data: PriceResponse; timestamp: number } | null = null;

export async function GET() {
  if (
    cachedPrices &&
    Date.now() - cachedPrices.timestamp < CACHE_TTL_MS
  ) {
    return NextResponse.json(cachedPrices.data);
  }

  try {
    const response = await fetch(COINGECKO_URL, {
      headers: {
        Accept: 'application/json',
        'x-cg-demo-api-key':
          process.env.COINGECKO_API_KEY || 'CG-DemoAPIKey',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`CoinGecko responded with ${response.status}`);
    }

    const data = await response.json();
    const prices: PriceResponse = {
      usdc: 1,
      cbbtc: data?.bitcoin?.usd ?? 0,
      weth: data?.ethereum?.usd ?? 0,
    };

    cachedPrices = { data: prices, timestamp: Date.now() };
    return NextResponse.json(prices);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch token prices:', error);
    }

    return NextResponse.json(
      { error: 'PRICE_FETCH_FAILED', usdc: 1, cbbtc: 0, weth: 0 },
      { status: 502 }
    );
  }
}


