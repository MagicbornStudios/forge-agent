const { defineConfig } = require('tsup');
const pkg = require('./package.json');

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

module.exports = defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
    compilerOptions: {
      moduleResolution: 'node',
      skipLibCheck: true,
      allowSyntheticDefaultImports: true,
      jsx: 'react-jsx',
    },
  },
  sourcemap: true,
  clean: true,
  external,
  target: 'es2019',
});
