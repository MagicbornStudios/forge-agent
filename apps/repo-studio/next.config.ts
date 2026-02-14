import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@forge/shared', '@forge/ui'],
};

export default nextConfig;
