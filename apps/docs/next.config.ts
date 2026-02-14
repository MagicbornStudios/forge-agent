import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';

const nextConfig: NextConfig = {
  transpilePackages: ['@forge/ui', '@forge/shared'],
};

const withMDX = createMDX();
export default withMDX(nextConfig);
