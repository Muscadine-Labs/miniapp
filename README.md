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
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local

# Edit .env.local and add your API keys:
#   - NEXT_PUBLIC_ONCHAINKIT_API_KEY (required)
#   - COINGECKO_API_KEY (optional, recommended for production)
#   - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (optional)
#   - NEXT_PUBLIC_URL (optional, defaults to https://miniapp.muscadine.io)

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

**Production URL**: [https://miniapp.muscadine.io](https://miniapp.muscadine.io)

### Environment Variables

See `.env.example` for all available environment variables. Required variables:

- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - **Required**: Get from [Coinbase OnchainKit Portal](https://portal.cdp.coinbase.com/products/onchainkit)

Optional variables:
- `COINGECKO_API_KEY` - Server-side key for `/api/prices` endpoint (recommended for production)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Enables WalletConnect v2 support
- `NEXT_PUBLIC_URL` - Custom deployment URL (defaults to `https://miniapp.muscadine.io`)

## Features

- **Real-time vault balances** - Live updates from Morpho Protocol vaults
- **Deposit/withdraw** - Seamless transactions via OnchainKit integration
- **Interest calculations** - Accurate earnings tracking using ERC-4626 standards
- **Token prices** - Server-side price fetching via CoinGecko API proxy
- **Farcaster authentication** - Secure wallet connection and user verification
- **Base MiniApp manifest** - Fully configured manifest at `/.well-known/farcaster.json`
- **Multi-wallet support** - Coinbase Wallet, injected wallets, and WalletConnect v2

## Development

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Production Environment Variables

Set these in your deployment platform (Vercel, etc.):

- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - **Required**: Your Coinbase OnchainKit API key
- `COINGECKO_API_KEY` - **Recommended**: Server-side key for `/api/prices` endpoint (higher rate limits)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Optional: Enables WalletConnect v2 support
- `NEXT_PUBLIC_URL` - Optional: Your production URL (defaults to `https://miniapp.muscadine.io`)

**Production URL**: [https://miniapp.muscadine.io](https://miniapp.muscadine.io)

### MiniApp Manifest

The MiniApp manifest is automatically served at `/.well-known/farcaster.json` and includes:
- Account association (domain verification)
- Frame configuration for Base App
- Base Builder settings
- Open Graph metadata for social sharing

The manifest is configured in `minikit.config.ts` and revalidates every hour.

## Project Structure

```
app/
├── api/                    # API routes (auth, prices, webhook)
│   ├── auth/              # Farcaster authentication endpoint
│   ├── prices/            # Server-side token price proxy
│   └── webhook/           # Base MiniApp webhook handler
├── components/            # React components (Dashboard, HomePage, ErrorBoundary)
├── hooks/                 # Custom hooks (useTokenPrices, useVaultHistory)
├── lib/                   # Utilities (wagmi config)
├── utils/                 # Helper functions (formatCurrency)
├── .well-known/           # MiniApp manifest route
│   └── farcaster.json/    # Base/Farcaster manifest endpoint
└── dashboard/             # Dashboard page route
test/                      # All test files (consolidated)
├── __mocks__/             # Test mocks (farcaster-sdk)
public/                    # Static assets and images
```

## How It Works

Muscadine Box is a **Farcaster Mini App** that enables users to earn yield on their crypto through Morpho Protocol vaults on Base network. The platform:

- **Connects** users via Farcaster authentication and wallet integration
- **Displays** real-time vault balances and APYs from Morpho Protocol
- **Facilitates** deposits/withdrawals through OnchainKit Earn components
- **Calculates** interest earned using ERC-4626 standards and historical transaction logs
- **Fetches** live token prices via server-side CoinGecko API proxy (`/api/prices`)
- **Provides** secure, non-custodial access to DeFi yields
- **Serves** Base MiniApp manifest at `/.well-known/farcaster.json` for discovery and embedding

### Architecture

- **Frontend**: Next.js 15 with React Server Components and Client Components
- **Blockchain**: Wagmi + Viem for Ethereum interactions on Base network
- **Wallet**: OnchainKit for wallet connection and transaction handling
- **Prices**: Server-side API route (`/api/prices`) proxies CoinGecko with caching
- **Vault History**: Custom hook (`useVaultHistory`) fetches deposit/withdraw events from chain
- **Testing**: Vitest with all tests consolidated in `/test` folder 

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
