#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { SHOWCASE_CATALOG_DATA } from '../packages/shared/src/shared/components/docs/showcase/catalog-data.mjs';
import visibility from '../packages/shared/src/shared/components/docs/showcase/_showcase-visibility.json' with { type: 'json' };

const repoRoot = process.cwd();
const docsShowcaseDir = path.join(repoRoot, 'apps/docs/content/docs/components/showcase');
const internalOnlySet = new Set(Array.isArray(visibility.internalOnly) ? visibility.internalOnly : []);

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

function toAnchor(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function renderSectionEntries(entries) {
  if (entries.length === 0) {
    return 'No entries are published for this section.';
  }

  return entries
    .map((entry) => `## ${entry.title} [#${toAnchor(entry.title)}]

${entry.summary}

<ComponentDemo id="${entry.id}" />`)
    .join('\n\n');
}

function sectionHeader(section) {
  return `> Entries: **${section.entries.length}**`;
}

function generateDocsPages() {
  ensureDir(docsShowcaseDir);
  for (const section of SHOWCASE_CATALOG_DATA.sections) {
    const visibleEntries = section.entries.filter((entry) => !internalOnlySet.has(entry.id));
    const body = `---
title: ${section.title}
description: ${section.description}
---

import { ComponentDemo } from '@/components/docs/ComponentDemo';

${sectionHeader({ ...section, entries: visibleEntries })}

${renderSectionEntries(visibleEntries)}
`;
    writeText(path.join(docsShowcaseDir, `${section.id}.mdx`), body);
  }

  writeJson(path.join(docsShowcaseDir, 'meta.json'), {
    title: 'Showcase',
    pages: SHOWCASE_CATALOG_DATA.sections.map((section) => section.id),
  });
}

function main() {
  generateDocsPages();
  process.stdout.write(
    `[generate-shared-showcase-docs] generated sections=${SHOWCASE_CATALOG_DATA.sections.length}\n`,
  );
}

main();
