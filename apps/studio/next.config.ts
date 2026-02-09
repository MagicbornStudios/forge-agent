import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@forge/shared",
    "@forge/domain-forge",
    "@forge/domain-character",
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

const withMDX = createMDX();
export default withPayload(withMDX(nextConfig));
