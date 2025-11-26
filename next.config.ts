import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip linting during build (run separately with npm run lint)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Redirects removed - manifest should be served locally per Base guidelines
  // The manifest is served via app/.well-known/farcaster.json/route.ts
  async redirects() {
    return [];
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Removed X-Frame-Options: DENY to allow MiniApp embedding
          // MiniApps need to be embeddable in iframes for Coinbase Wallet
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@coinbase/onchainkit', '@tanstack/react-query'],
  },
  
  // Image optimization
  images: {
    domains: ['api.coingecko.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Webpack configuration
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_ONCHAINKIT_API_KEY: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY,
  },
};

export default nextConfig;
