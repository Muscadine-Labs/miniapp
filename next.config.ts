import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirects
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/019aa813-3d19-4b5a-0cc1-5a17566cce40',
        permanent: false, // 307 temporary redirect
      },
    ];
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
