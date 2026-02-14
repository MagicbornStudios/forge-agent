#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const docsComponentsDir = path.join(repoRoot, 'apps/docs/content/docs/components');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${content.trim()}\n`, 'utf8');
}

function writeJson(filePath, value) {
  writeText(filePath, JSON.stringify(value, null, 2));
}

function generateRootComponentsIndex() {
  writeText(
    path.join(docsComponentsDir, 'index.mdx'),
    `---
title: Component Showcase
description: Forge component catalog - showcase demos with Preview/Code BlockView.
icon: Component
---

# Component Showcase

This catalog is generated from the source tree and kept in sync with docs tooling.

## Catalog sections

- [Showcase](./showcase): shared examples with Preview/Code BlockView (atoms, molecules, organisms)
`,
  );

  writeJson(path.join(docsComponentsDir, 'meta.json'), {
    title: 'Component Reference',
    pages: ['index', 'showcase'],
  });
}

function main() {
  generateRootComponentsIndex();
  process.stdout.write('[generate-platform-component-docs] generated components index\n');
}

main();
