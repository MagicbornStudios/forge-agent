import type { NextConfig } from 'next';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HASH_PATCH_MARKER = Symbol.for('forge.repo-studio.hash-update-undefined-patch');
const globalForHashPatch = globalThis as Record<string | symbol, unknown>;

if (!globalForHashPatch[HASH_PATCH_MARKER]) {
  const originalCreateHash = crypto.createHash.bind(crypto);
  crypto.createHash = ((algorithm: string, options?: crypto.HashOptions) => {
    const hash = originalCreateHash(algorithm, options);
    const originalUpdate = hash.update.bind(hash) as (data: any, inputEncoding?: any) => crypto.Hash;
    hash.update = ((data: any, inputEncoding?: any) => {
      const normalizedData = data == null ? '' : data;
      return originalUpdate(normalizedData, inputEncoding);
    }) as any;
    return hash;
  }) as typeof crypto.createHash;
  globalForHashPatch[HASH_PATCH_MARKER] = true;
}

const APP_ROOT = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  ...(process.env.REPO_STUDIO_STANDALONE === '1' ? { output: 'standalone' } : {}),
  outputFileTracingRoot: path.resolve(APP_ROOT, '../..'),
  transpilePackages: ['@forge/shared', '@forge/ui'],
  webpack: (config, { webpack }) => {
    config.output = config.output || {};
    config.optimization = config.optimization || {};
    config.output.hashFunction = 'sha256';
    config.optimization.realContentHash = false;

    const sanitizeUndefinedSources = (
      compilation: any,
      assets: Record<string, { source?: () => string | Buffer }> | null | undefined,
    ) => {
      if (assets == null || typeof assets !== 'object') return;
      for (const [name, asset] of Object.entries(assets)) {
        let source: string | Buffer | undefined;
        try {
          source = asset.source?.();
        } catch {
          continue;
        }
        if (typeof source === 'undefined') {
          compilation.updateAsset(name, new webpack.sources.RawSource(''));
        }
      }
    };

    class SanitizeUndefinedAssetSourcePlugin {
      apply(compiler: { hooks: { thisCompilation: { tap: (name: string, fn: (compilation: any) => void) => void } } }) {
        compiler.hooks.thisCompilation.tap('SanitizeUndefinedAssetSourcePlugin', (compilation: any) => {
          compilation.hooks.processAssets.tap(
            {
              name: 'SanitizeUndefinedAssetSourcePlugin',
              stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
            },
            (assets: Record<string, { source?: () => string | Buffer }>) => sanitizeUndefinedSources(compilation, assets),
          );
        });
      }
    }

    config.plugins = config.plugins || [];
    config.plugins.push(new SanitizeUndefinedAssetSourcePlugin());
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
