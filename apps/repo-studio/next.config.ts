import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.REPO_STUDIO_STANDALONE === '1' ? { output: 'standalone' } : {}),
  transpilePackages: ['@forge/shared', '@forge/ui'],
  webpack: (config) => {
    config.output = config.output || {};
    // Force deterministic non-wasm hash path to avoid intermittent WasmHash crashes on Node 24.
    config.output.hashFunction = 'sha256';
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
