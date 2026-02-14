#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { SHOWCASE_CATALOG_DATA } from '../packages/shared/src/shared/components/docs/showcase/catalog-data.mjs';
import visibility from '../packages/shared/src/shared/components/docs/showcase/_showcase-visibility.json' with { type: 'json' };

const repoRoot = process.cwd();
const sharedDemoRegistryPath = path.join(
  repoRoot,
  'packages/shared/src/shared/components/docs/showcase/demos/index.tsx',
);
const registryGeneratedPath = path.join(
  repoRoot,
  'packages/shared/src/shared/components/docs/showcase/demos/registry.generated.tsx',
);
const codeMapPath = path.join(
  repoRoot,
  'packages/shared/src/shared/components/docs/showcase/_showcase-code-map.json',
);
const studioShowcaseDir = path.join(repoRoot, 'docs/components/showcase');
const platformShowcaseDir = path.join(repoRoot, 'apps/platform/content/docs/components/showcase');

function collectCatalogEntries() {
  return SHOWCASE_CATALOG_DATA.sections.flatMap((section) =>
    section.entries.map((entry) => ({ ...entry, sectionId: section.id })),
  );
}

function extractRegistryIds() {
  const content = fs.existsSync(registryGeneratedPath)
    ? fs.readFileSync(registryGeneratedPath, 'utf8')
    : fs.readFileSync(sharedDemoRegistryPath, 'utf8');
  const ids = new Set();
  for (const match of content.matchAll(/['"]([a-z0-9-]+)['"]\s*:/gi)) {
    ids.add(match[1]);
  }
  return ids;
}

function loadCodeMap() {
  if (!fs.existsSync(codeMapPath)) return {};
  return JSON.parse(fs.readFileSync(codeMapPath, 'utf8'));
}

function validateRegistryAndCodeMap(entries) {
  const failures = [];
  const codeMap = loadCodeMap();
  for (const entry of entries) {
    const demoId = entry.demoId ?? entry.id;
    const mapEntry = codeMap[demoId];
    if (!mapEntry) {
      failures.push(`code-map: ${demoId} missing from _showcase-code-map.json`);
    } else {
      const paths = Array.isArray(mapEntry) ? mapEntry : [mapEntry];
      for (const p of paths) {
        const fullPath = path.join(repoRoot, p.replace(/\//g, path.sep));
        if (!fs.existsSync(fullPath)) {
          failures.push(`code-map: ${demoId} references missing file: ${p}`);
        }
      }
    }
  }
  return failures;
}

function readMdxDemoIds(filePath, componentTag, propName) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  const expression = new RegExp(`<${componentTag}\\s+${propName}=["']([^"']+)["']\\s*/>`, 'g');
  const ids = [];
  for (const match of content.matchAll(expression)) {
    ids.push(match[1]);
  }
  return ids;
}

function main() {
  const failures = [];
  const entries = collectCatalogEntries();
  const entryIds = entries.map((entry) => entry.id);
  const entryIdSet = new Set(entryIds);

  failures.push(...validateRegistryAndCodeMap(entries));

  for (const entry of entries) {
    const files = entry.code?.files ?? [];
    if (files.length === 0) {
      failures.push(`catalog: ${entry.id} has no code files (run pnpm docs:showcase:generate)`);
      continue;
    }
  }

  const internalOnlyIds = Array.isArray(visibility.internalOnly) ? visibility.internalOnly : [];
  for (const internalId of internalOnlyIds) {
    if (!entryIdSet.has(internalId)) {
      failures.push(`visibility: internalOnly id "${internalId}" does not exist in showcase catalog`);
    }
  }

  const demoRegistryIds = extractRegistryIds();
  for (const entryId of entryIds) {
    if (!demoRegistryIds.has(entryId)) {
      failures.push(`demos: missing renderer for showcase id "${entryId}"`);
    }
  }

  for (const section of SHOWCASE_CATALOG_DATA.sections) {
    const studioPath = path.join(studioShowcaseDir, `${section.id}.mdx`);
    const platformPath = path.join(platformShowcaseDir, `${section.id}.mdx`);
    const studioIds = readMdxDemoIds(studioPath, 'ComponentPreview', 'name');
    const platformIds = readMdxDemoIds(platformPath, 'ComponentDemo', 'id');
    const expectedStudioIds = section.entries.map((entry) => entry.id);
    const expectedPlatformIds = section.entries
      .filter((entry) => !internalOnlyIds.includes(entry.id))
      .map((entry) => entry.id);

    for (const id of expectedStudioIds) {
      if (!studioIds.includes(id)) {
        failures.push(`studio pages: ${section.id}.mdx missing ComponentPreview name="${id}"`);
      }
    }

    for (const id of expectedPlatformIds) {
      if (!platformIds.includes(id)) {
        failures.push(`platform pages: ${section.id}.mdx missing ComponentDemo id="${id}"`);
      }
    }

    for (const id of platformIds) {
      if (internalOnlyIds.includes(id)) {
        failures.push(`platform pages: ${section.id}.mdx contains internal-only id "${id}"`);
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
