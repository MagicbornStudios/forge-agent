import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/tui/index.mjs'],
  format: ['esm'],
  outDir: 'dist/tui',
  clean: true,
  bundle: false,
  dts: false,
  sourcemap: false,
  target: 'node20',
});
