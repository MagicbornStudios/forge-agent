import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.REPO_STUDIO_STANDALONE === '1' ? { output: 'standalone' } : {}),
  transpilePackages: ['@forge/shared', '@forge/ui'],
  serverExternalPackages: [
    'payload',
    '@payloadcms/db-sqlite',
    '@payloadcms/next',
    'libsql',
    '@libsql/client',
    '@libsql/hrana-client',
    '@libsql/isomorphic-fetch',
    '@libsql/isomorphic-ws',
  ],
};

export default nextConfig;
