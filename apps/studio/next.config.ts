import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import crypto from 'node:crypto';

const HASH_PATCH_MARKER = Symbol.for('forge.studio.hash-update-undefined-patch');
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

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@forge/shared",
    "@forge/domain-forge",
    "@forge/domain-character",
    "@forge/assistant-runtime",
    "@forge/types",
    "@forge/ui",
    "@forge/agent-engine",
    "@twick/studio",
    "@twick/timeline",
    "@twick/live-player",
    "@twick/video-editor",
    "@twick/canvas",
  ],
  experimental: {
    reactCompiler: false,
  },
  webpack: (config, { webpack }) => {
    // Avoid Webpack WasmHash crashes during build (hashing undefined buffers).
    config.output.hashFunction = 'sha256';
    config.optimization = config.optimization ?? {};
    // In this workspace, realContentHash intermittently receives undefined source buffers.
    // Disable it to keep build hashing deterministic and prevent BulkUpdateDecorator crashes.
    config.optimization.realContentHash = false;

    const sanitizeUndefinedSources = (compilation: any, assets: Record<string, { source?: () => string | Buffer }> | null | undefined) => {
      if (assets == null || typeof assets !== 'object') return;
      for (const [name, asset] of Object.entries(assets)) {
        let source: string | Buffer | undefined;
        try {
          source = asset.source?.();
        } catch (error) {
          compilation.warnings.push(
            new Error(`[build] Failed to read asset source for ${name}: ${String(error)}`),
          );
          continue;
        }
        if (typeof source === 'undefined') {
          compilation.updateAsset(name, new webpack.sources.RawSource(''));
          compilation.warnings.push(
            new Error(`[build] Asset ${name} had undefined source; replaced with empty string.`),
          );
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

    config.plugins = config.plugins ?? [];
    config.plugins.push(new SanitizeUndefinedAssetSourcePlugin());

    return config;
  },
};

export default withPayload(nextConfig);
