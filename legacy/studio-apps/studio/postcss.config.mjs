import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    [path.join(__dirname, 'scripts', 'postcss-hoist-import-url.cjs')]: {},
  },
};

export default config;
