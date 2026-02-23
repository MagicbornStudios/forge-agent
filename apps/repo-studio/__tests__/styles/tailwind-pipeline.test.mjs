import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import postcss from 'postcss';
import postcssrc from 'postcss-load-config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..', '..');
const globalsCssPath = path.join(appRoot, 'app', 'globals.css');

test('repo studio tailwind pipeline compiles globals.css without raw directives', async () => {
  const rawCss = await fs.readFile(globalsCssPath, 'utf8');
  const loaded = await postcssrc({}, appRoot);
  const result = await postcss(loaded.plugins).process(rawCss, {
    from: globalsCssPath,
    map: false,
    ...(loaded.options || {}),
  });

  assert.equal(/@apply\b/.test(result.css), false);
  assert.equal(/@theme\b/.test(result.css), false);
  assert.match(result.css, /\.flex\s*\{/);
});
