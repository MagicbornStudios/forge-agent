import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.REPO_STUDIO_STANDALONE === '1' ? { output: 'standalone' } : {}),
  transpilePackages: ['@forge/shared', '@forge/ui'],
  webpack: (config) => {
    config.output = config.output || {};
    // Optional fallback for environments that need a non-wasm hash path.
    // Disabled by default because forcing sha256 can break webpack hashing in some builds.
    if (process.env.REPO_STUDIO_FORCE_STABLE_HASH === '1') {
      config.output.hashFunction = 'sha256';
    }
    return config;
  },
  serverExternalPackages: [
    'payload',
    '@payloadcms/db-sqlite',
    '@payloadcms/next',
    'libsql',
    '@libsql/client',
    '@libsql/hrana-client',
    '@libsql/isomorphic-fetch',
    '@libsql/isomorphic-ws',
    'node-pty',
  ],
};

export default nextConfig;
