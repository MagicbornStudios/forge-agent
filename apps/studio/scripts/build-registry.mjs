/**
 * Scans registry/default/example/*.tsx and writes registry/__index__.tsx
 * so ComponentPreview can lazy-load example components by name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const studioRoot = path.resolve(__dirname, '..');
const examplesDir = path.join(studioRoot, 'registry', 'default', 'example');
const outPath = path.join(studioRoot, 'registry', '__index__.tsx');

if (!fs.existsSync(examplesDir)) {
  fs.mkdirSync(examplesDir, { recursive: true });
}

const files = fs.readdirSync(examplesDir).filter((f) => f.endsWith('.tsx'));
const entries = files.map((f) => {
  const name = f.replace(/\.tsx$/, '');
  return { name };
});

function toExportName(name) {
  return name
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function toLazyVar(name) {
  return 'Lazy_' + name.replace(/-/g, '_');
}

const lazyLines = entries.map(
  (e) =>
    `const ${toLazyVar(e.name)} = React.lazy(() => import('./default/example/${e.name}').then((m) => ({ default: m.${toExportName(e.name)} ?? m.default })));`
);
const indexEntries = entries.map((e) => `  '${e.name}': { component: ${toLazyVar(e.name)} },`);

const out = [
  "import React from 'react';",
  "",
  ...lazyLines,
  "",
  "export const Index = {",
  ...indexEntries,
  "} as const;",
  "",
  "export type RegistryName = keyof typeof Index;",
].join('\n');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out);
console.log('Wrote ' + outPath + ' with ' + entries.length + ' example(s): ' + entries.map((e) => e.name).join(', '));
