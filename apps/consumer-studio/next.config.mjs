import crypto from 'node:crypto';

const HASH_PATCH_MARKER = Symbol.for('forge.consumer-studio.hash-update-undefined-patch');
const globalForHashPatch = globalThis;

if (!globalForHashPatch[HASH_PATCH_MARKER]) {
  const originalCreateHash = crypto.createHash.bind(crypto);
  crypto.createHash = ((algorithm, options) => {
    const hash = originalCreateHash(algorithm, options);
    const originalUpdate = hash.update.bind(hash);
    hash.update = (data, inputEncoding) => {
      const normalizedData = data == null ? '' : data;
      return originalUpdate(normalizedData, inputEncoding);
    };
    return hash;
  });
  globalForHashPatch[HASH_PATCH_MARKER] = true;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@forge/shared', '@forge/ui', '@forge/dev-kit'],
  webpack: (config, { webpack }) => {
    config.output = config.output || {};
    config.optimization = config.optimization || {};
    config.output.hashFunction = 'sha256';
    config.optimization.realContentHash = false;

    const sanitizeUndefinedSources = (compilation, assets) => {
      if (assets == null || typeof assets !== 'object') return;
      for (const [name, asset] of Object.entries(assets)) {
        let source;
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
      apply(compiler) {
        compiler.hooks.thisCompilation.tap('SanitizeUndefinedAssetSourcePlugin', (compilation) => {
          compilation.hooks.processAssets.tap(
            {
              name: 'SanitizeUndefinedAssetSourcePlugin',
              stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
            },
            (assets) => sanitizeUndefinedSources(compilation, assets),
          );
        });
      }
    }

    config.plugins = config.plugins || [];
    config.plugins.push(new SanitizeUndefinedAssetSourcePlugin());
    return config;
  },
};

export default nextConfig;
