#!/usr/bin/env node
/**
 * Copy external planning/reference folders into this repo for agent review.
 * Used during the loop-model and game-simulation-workspace phases to reference
 * DungeonBreak-docs (GRD, .concept, scratch, AGENTS) without touching .planning.
 *
 * Destination: .tmp/dungeonbreak-docs-reference/ (gitignored; not part of our planning).
 * Source: DUNGEONBREAK_DOCS_SOURCE or default path below.
 *
 * Usage: node scripts/copy-external-reference.mjs
 *   or:  DUNGEONBREAK_DOCS_SOURCE=/path/to/DungeonBreak-docs node scripts/copy-external-reference.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const DEFAULT_SOURCE =
  process.platform === 'win32'
    ? 'C:\\Users\\benja\\Documents\\DungeonBreak-docs'
    : process.env.HOME + '/Documents/DungeonBreak-docs';

const SOURCE_ROOT = process.env.DUNGEONBREAK_DOCS_SOURCE || DEFAULT_SOURCE;
const DEST = path.join(repoRoot, '.tmp', 'dungeonbreak-docs-reference');

const ITEMS = [
  { src: 'scratch', dest: 'scratch', dir: true },
  { src: 'AGENTS.md', dest: 'AGENTS.md', dir: false },
  { src: '.planning', dest: 'planning', dir: true },
  { src: '.concept', dest: 'concept', dir: true },
];

async function copyRecursive(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const stat = await fs.stat(src).catch(() => null);
  if (!stat) return;
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const e of entries) {
      await copyRecursive(path.join(src, e.name), path.join(dest, e.name));
    }
  } else {
    await fs.copyFile(src, dest);
  }
}

async function main() {
  console.log('Copy external reference: %s -> %s', SOURCE_ROOT, DEST);

  const exists = await fs.stat(SOURCE_ROOT).catch(() => null);
  if (!exists || !exists.isDirectory()) {
    console.error('Source not found or not a directory: %s', SOURCE_ROOT);
    console.error('Set DUNGEONBREAK_DOCS_SOURCE to the DungeonBreak-docs root.');
    process.exit(1);
  }

  await fs.mkdir(DEST, { recursive: true });

  for (const { src, dest, dir } of ITEMS) {
    const srcPath = path.join(SOURCE_ROOT, src);
    const destPath = path.join(DEST, dest);
    try {
      const stat = await fs.stat(srcPath);
      if (dir && !stat.isDirectory()) {
        console.warn('Skip %s (not a directory)', src);
        continue;
      }
      if (!dir && stat.isDirectory()) {
        console.warn('Skip %s (expected file)', src);
        continue;
      }
      await copyRecursive(srcPath, destPath);
      console.log('  %s -> %s', src, dest);
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.warn('  Skip %s (missing)', src);
      } else {
        throw e;
      }
    }
  }

  const readme = `# DungeonBreak-docs reference (copy)

This folder is a **reference copy** of an external repo (DungeonBreak-docs).
It was created by \`scripts/copy-external-reference.mjs\` for use during the
loop-model and game-simulation-workspace phases. It is **not** part of
forge-agent's .planning or any tracked planning state. Do not edit these
files here; edit in the source repo.

Contents:
- \`scratch/\` – scratch area from source
- \`AGENTS.md\` – source repo agent rules
- \`planning/\` – copy of source .planning (e.g. GRD-escape-the-dungeon.md)
- \`concept/\` – .concept folder from source

Source: ${SOURCE_ROOT}
Generated: ${new Date().toISOString()}
`;
  await fs.writeFile(path.join(DEST, 'README.md'), readme, 'utf8');
  console.log('  README.md written.');
  console.log('Done. Reference at .tmp/dungeonbreak-docs-reference/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
