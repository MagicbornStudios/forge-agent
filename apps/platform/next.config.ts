import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@forge/ui', '@forge/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
