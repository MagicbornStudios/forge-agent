import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';

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

const withMDX = createMDX();
export default withMDX(nextConfig);
