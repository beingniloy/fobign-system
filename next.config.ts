import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

export default function createNextConfig(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
  }

  const nextConfig: NextConfig = {
    reactStrictMode: true,
    typescript: {
      ignoreBuildErrors: false,
    },
    turbopack: {},
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**',
        },
      ],
    },
    transpilePackages: ['motion'],
    async redirects() {
      return [
        {
          source: '/admin/:path*',
          destination: '/:path*',
          permanent: false,
        },
        {
          source: '/app/:path*',
          destination: '/:path*',
          permanent: false,
        },
      ];
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/api/:path*',
        },
      ];
    },
    webpack: (config, { dev }) => {
      if (dev && process.env.DISABLE_HMR === 'true') {
        config.watchOptions = {
          ignored: /.*/,
        };
      }
      return config;
    },
  };

  return nextConfig;
}

