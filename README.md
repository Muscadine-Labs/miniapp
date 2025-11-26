# Muscadine Box

DeFi lending platform on Base. Farcaster Mini App.

**Live**: [miniapp.muscadine.io](https://miniapp.muscadine.io)

## Stack

- Next.js 15.3.4 + TypeScript
- OnchainKit 1.1.2
- Wagmi 2.19.5 + Viem 2.31.6
- Farcaster MiniKit 0.2.0

## Vaults

**USDC** `0xf7e26Fa48A568b8b0038e104DfD8ABdf0f99074F` - 8.5% APY  
**cbBTC** `0xAeCc8113a7bD0CFAF7000EA7A31afFD4691ff3E9` - 6.2% APY  
**WETH** `0x21e0d366272798da3A977FEBA699FCB91959d120` - 7.8% APY

All ERC-4626 on Morpho Protocol v1 (Base).

## Setup

```bash
npm install
cp .env.example .env.local
# Required env vars:
#   NEXT_PUBLIC_ONCHAINKIT_API_KEY=<from https://portal.cdp.coinbase.com/products/onchainkit>
# Optional env vars:
#   COINGECKO_API_KEY=<CoinGecko pro/server key for price proxy>
#   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<WalletConnect Cloud project id>
#   NEXT_PUBLIC_URL=<custom deployment url, defaults to https://miniapp.muscadine.io>
npm run dev
```

The app will be available at `http://localhost:3000`

**Production URL**: [https://miniapp.muscadine.io](https://miniapp.muscadine.io)

## Features

- Real-time vault balances
- Deposit/withdraw via OnchainKit
- Interest calculations (ERC-4626)
- Token prices (CoinGecko)
- Farcaster auth

## Deploy

```bash
npm run build
npm start
```

### Environment Variables

For production deployment, set these environment variables:

- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - Required: Your Coinbase OnchainKit API key
- `COINGECKO_API_KEY` - Optional: Server-side key used by `/api/prices` to proxy CoinGecko (recommended for higher limits)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Optional: Enables WalletConnect v2 in Wagmi/OnchainKit
- `NEXT_PUBLIC_URL` - Optional: Your production URL (defaults to `https://miniapp.muscadine.io`)

**Production URL**: [https://miniapp.muscadine.io](https://miniapp.muscadine.io)

## Project Structure

```
app/
├── api/                    # API routes (auth, webhook, farcaster)
├── components/             # React components (Dashboard, ClaimRewards)
├── hooks/                  # Custom hooks (useTokenPrices, useVaultData)
├── lib/                    # Utilities (wagmi config, ABI)
├── services/               # External services (DEX integration)
└── utils/                  # Helper functions
docs/                       # Documentation and deployment guides
test/                       # Test mocks and utilities
public/                     # Static assets and images
```

## How It Works

Muscadine Box is a **Farcaster Mini App** that enables users to earn yield on their crypto through Morpho Protocol vaults on Base network. The platform:

- **Connects** users via Farcaster authentication
- **Displays** real-time vault balances and APYs
- **Facilitates** deposits/withdrawals through OnchainKit integration
- **Calculates** interest earned using ERC-4626 standards
- **Fetches** live token prices from CoinGecko API
- **Provides** secure, non-custodial access to DeFi yields
- **Takes** 1% performance fee off of yield 

## Future Plans

**Target: Fully operational by end of year 2025**
- Migrate to v2 Vaults to be able to curate risk for all defi protocols to sustance best yield and risk. This will allow flexibility for vault to be available for years to come. 

### V1 Vaults (Q4 2024 - Q1 2025)
- Complete functional vault implementation
- Enhanced security audits and testing
- Streamlined user onboarding flow

### Platform Improvements
- **Better Statistics**: Advanced analytics dashboard with detailed interest tracking, historical performance, and yield optimization insights
- **Beginner-Friendly**: Simplified UI/UX, educational content, and guided tutorials for DeFi newcomers
- **Enhanced Security**: Multi-layer security protocols, and risk management tools

### Long-term Vision
Transform Muscadine Box into the go-to platform for secure, accessible DeFi and savings on Base network.

## License

MIT
