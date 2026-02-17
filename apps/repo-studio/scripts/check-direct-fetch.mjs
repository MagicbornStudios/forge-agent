#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const TARGET_DIRS = ['src/components', 'src/components/hooks'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const FETCH_PATTERN = /\bfetch\s*\(/;
const INLINE_ALLOW_PATTERN = /direct-fetch-ok/i;

function isStrictMode() {
  return process.argv.includes('--strict') || process.env.REPOSTUDIO_FETCH_GUARD_STRICT === '1';
}

async function walkFiles(startDir, output) {
  let entries = [];
  try {
    entries = await fs.readdir(startDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.')) {
      continue;
    }
    const fullPath = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      await walkFiles(fullPath, output);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (SOURCE_EXTENSIONS.has(ext)) {
      output.push(fullPath);
    }
  }
}

async function collectFiles(rootDir) {
  const files = [];
  for (const relativeDir of TARGET_DIRS) {
    const absoluteDir = path.join(rootDir, relativeDir);
    // eslint-disable-next-line no-await-in-loop
    await walkFiles(absoluteDir, files);
  }
  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

async function findViolations(rootDir) {
  const files = await collectFiles(rootDir);
  const violations = [];
  for (const filePath of files) {
    let content = '';
    try {
      // eslint-disable-next-line no-await-in-loop
      content = await fs.readFile(filePath, 'utf8');
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (!FETCH_PATTERN.test(line)) continue;
      if (INLINE_ALLOW_PATTERN.test(line)) continue;
      violations.push({
        filePath: path.relative(rootDir, filePath).replace(/\\/g, '/'),
        line: index + 1,
        code: line.trim(),
      });
    }
  }
  return violations;
}

async function main() {
  const rootDir = process.cwd();
  const violations = await findViolations(rootDir);
  if (violations.length === 0) {
    console.log('[repo-studio] direct-fetch check: no violations found.');
    return;
  }

  console.log('[repo-studio] direct-fetch check: found direct fetch usage in component-layer files.');
  for (const violation of violations) {
    console.log(` - ${violation.filePath}:${violation.line} :: ${violation.code}`);
  }
  console.log('[repo-studio] migrate calls into typed services under src/lib/api/services/*.');
  console.log('[repo-studio] add "direct-fetch-ok" comment only for intentional exceptions.');

  if (isStrictMode()) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[repo-studio] direct-fetch check failed:', error);
  process.exitCode = 1;
});

