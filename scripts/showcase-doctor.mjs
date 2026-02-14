#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { SHOWCASE_CATALOG_DATA } from '../packages/shared/src/shared/components/docs/showcase/catalog-data.mjs';
import visibility from '../packages/shared/src/shared/components/docs/showcase/_showcase-visibility.json' with { type: 'json' };

const repoRoot = process.cwd();
const codeMapPath = path.join(
  repoRoot,
  'packages/shared/src/shared/components/docs/showcase/_showcase-code-map.json',
);
const docsShowcaseDir = path.join(repoRoot, 'apps/docs/content/docs/components/showcase');

function collectCatalogEntries() {
  return SHOWCASE_CATALOG_DATA.sections.flatMap((section) =>
    section.entries.map((entry) => ({ ...entry, sectionId: section.id })),
  );
}

function loadCodeMap() {
  if (!fs.existsSync(codeMapPath)) return {};
  return JSON.parse(fs.readFileSync(codeMapPath, 'utf8'));
}

function validateCodeMap(entries) {
  const failures = [];
  const codeMap = loadCodeMap();
  for (const entry of entries) {
    const demoId = entry.demoId ?? entry.id;
    const mapEntry = codeMap[demoId];
    if (!mapEntry) {
      failures.push(`code-map: ${demoId} missing from _showcase-code-map.json`);
      continue;
    }
    const paths = Array.isArray(mapEntry) ? mapEntry : [mapEntry];
    for (const p of paths) {
      const fullPath = path.join(repoRoot, p.replace(/\//g, path.sep));
      if (!fs.existsSync(fullPath)) {
        failures.push(`code-map: ${demoId} references missing file: ${p}`);
      }
    }
  }
  return failures;
}

function readMdxDemoIds(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  return [...content.matchAll(/<ComponentDemo\s+id=["']([^"']+)["']\s*\/>/g)].map((match) => match[1]);
}

function main() {
  const failures = [];
  const entries = collectCatalogEntries();
  const entryIds = entries.map((entry) => entry.id);
  const entryIdSet = new Set(entryIds);

  failures.push(...validateCodeMap(entries));

  const internalOnlyIds = Array.isArray(visibility.internalOnly) ? visibility.internalOnly : [];
  for (const internalId of internalOnlyIds) {
    if (!entryIdSet.has(internalId)) {
      failures.push(`visibility: internalOnly id "${internalId}" does not exist in showcase catalog`);
    }
  }

  for (const section of SHOWCASE_CATALOG_DATA.sections) {
    const docsPath = path.join(docsShowcaseDir, `${section.id}.mdx`);
    const docsIds = readMdxDemoIds(docsPath);
    const expectedIds = section.entries
      .filter((entry) => !internalOnlyIds.includes(entry.id))
      .map((entry) => entry.id);

    for (const id of expectedIds) {
      if (!docsIds.includes(id)) {
        failures.push(`docs pages: ${section.id}.mdx missing ComponentDemo id="${id}"`);
      }
    }

    for (const id of docsIds) {
      if (internalOnlyIds.includes(id)) {
        failures.push(`docs pages: ${section.id}.mdx contains internal-only id "${id}"`);
      }
    }
  }

  if (failures.length > 0) {
    process.stderr.write('[showcase-doctor] FAIL\n');
    for (const failure of failures) {
      process.stderr.write(`- ${failure}\n`);
    }
    process.exit(1);
  }

  process.stdout.write('[showcase-doctor] PASS\n');
}

main();
