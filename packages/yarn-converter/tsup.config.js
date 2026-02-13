const { defineConfig } = require('tsup');

module.exports = defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['@forge/types'],
  target: 'es2019',
});
