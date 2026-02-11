#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const APP_CONFIG = {
  studio: {
    label: '@forge/studio',
    appDir: path.join(repoRoot, 'apps', 'studio'),
    globalsPath: path.join(repoRoot, 'apps', 'studio', 'app', 'globals.css'),
    useHoistPlugin: true,
  },
  platform: {
    label: '@forge/platform',
    appDir: path.join(repoRoot, 'apps', 'platform'),
    globalsPath: path.join(repoRoot, 'apps', 'platform', 'src', 'styles', 'globals.css'),
    useHoistPlugin: false,
  },
};

const TARGET_ALIASES = {
  marketing: 'platform',
};

const PROBES = [
  { id: 'core.flex', label: 'Core utility .flex', needle: '.flex {' },
  { id: 'core.hidden', label: 'Core utility .hidden', needle: '.hidden {' },
  { id: 'docs.px4', label: 'Docs utility .px-4', needle: '.px-4' },
  { id: 'docs.h14', label: 'Docs utility .h-14', needle: '.h-14' },
  { id: 'docs.mdHidden', label: 'Docs utility .md:hidden', needle: '.md\\:hidden' },
  { id: 'docs.lgPx10', label: 'Docs utility .lg:px-10', needle: '.lg\\:px-10' },
  { id: 'docs.maxW4xl', label: 'Docs utility .max-w-4xl', needle: '.max-w-4xl' },
  {
    id: 'docs.mdPlSidebar',
    label: 'Docs utility .md:pl-[var(--sidebar-width)]',
    needle: '.md\\:pl-\\[var\\(--sidebar-width\\)\\]',
  },
  { id: 'docs.text15', label: 'Docs marker .text-[15px]', needle: '.text-\\[15px\\]' },
];

function usage() {
  console.log('Usage: node scripts/css-doctor.mjs [studio] [platform]');
  console.log('Examples:');
  console.log('  node scripts/css-doctor.mjs');
  console.log('  node scripts/css-doctor.mjs studio');
}

function parseTargets(argv) {
  const raw = argv.map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (raw.includes('--help') || raw.includes('-h')) {
    usage();
    process.exit(0);
  }
  const normalized = raw.map((target) => TARGET_ALIASES[target] ?? target);
  if (normalized.length === 0) {
    return ['studio', 'platform'];
  }
  const targets = [...new Set(normalized)];
  const invalid = targets.filter((target) => !(target in APP_CONFIG));
  if (invalid.length > 0) {
    console.error(`Unknown app target(s): ${invalid.join(', ')}`);
    usage();
    process.exit(1);
  }
  return targets;
}

function findLegacyTailwindDirectives(source) {
  const pattern = /@tailwind\s+(base|components|utilities)\s*;/g;
  return [...source.matchAll(pattern)].map((match) => match[0]);
}

function findImportOrderViolations(source) {
  const lines = source.split(/\r?\n/);
  let inBlockComment = false;
  let seenNonImportRule = false;
  const violations = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (inBlockComment) {
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      continue;
    }

    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) {
        inBlockComment = true;
      }
      continue;
    }

    if (trimmed.startsWith('//')) {
      continue;
    }

    if (trimmed.startsWith('@import')) {
      if (seenNonImportRule) {
        violations.push({ line: i + 1, text: trimmed });
      }
      continue;
    }

    if (trimmed.startsWith('@charset')) {
      continue;
    }

    seenNonImportRule = true;
  }

  return violations;
}

async function compileCss(config) {
  const appRequire = createRequire(path.join(config.appDir, 'package.json'));
  const postcss = appRequire('postcss');
  const tailwind = appRequire('@tailwindcss/postcss');

  const plugins = [tailwind()];
  if (config.useHoistPlugin) {
    const hoistImportUrl = appRequire('./scripts/postcss-hoist-import-url.cjs');
    plugins.push(hoistImportUrl());
  }

  const source = await fs.readFile(config.globalsPath, 'utf8');
  const result = await postcss(plugins).process(source, { from: config.globalsPath });
  return { source, compiled: result.css };
}

function formatResult(ok) {
  return ok ? 'PASS' : 'FAIL';
}

async function runForApp(target) {
  const config = APP_CONFIG[target];
  const relativeGlobalsPath = path.relative(repoRoot, config.globalsPath).replace(/\\/g, '/');
  console.log(`\n[css-doctor] ${config.label} (${relativeGlobalsPath})`);

  let source;
  let compiled;
  try {
    ({ source, compiled } = await compileCss(config));
  } catch (error) {
    console.log(`  ${formatResult(false)} compile: ${String(error)}`);
    return false;
  }

  let ok = true;

  const legacyDirectives = findLegacyTailwindDirectives(source);
  const legacyCheckOk = legacyDirectives.length === 0;
  console.log(`  ${formatResult(legacyCheckOk)} static: no legacy @tailwind directives`);
  if (!legacyCheckOk) {
    ok = false;
    for (const directive of legacyDirectives) {
      console.log(`    - found: ${directive}`);
    }
  }

  const importOrderViolations = findImportOrderViolations(source);
  const importOrderOk = importOrderViolations.length === 0;
  console.log(`  ${formatResult(importOrderOk)} static: @import rules grouped at top`);
  if (!importOrderOk) {
    ok = false;
    for (const violation of importOrderViolations) {
      console.log(`    - line ${violation.line}: ${violation.text}`);
    }
  }

  console.log('  Probe checks:');
  for (const probe of PROBES) {
    const probeOk = compiled.includes(probe.needle);
    if (!probeOk) {
      ok = false;
    }
    console.log(`    ${formatResult(probeOk)} ${probe.id} - ${probe.label}`);
  }

  return ok;
}

async function main() {
  const targets = parseTargets(process.argv.slice(2));
  let allOk = true;

  for (const target of targets) {
    // eslint-disable-next-line no-await-in-loop
    const targetOk = await runForApp(target);
    allOk = allOk && targetOk;
  }

  console.log(`\n[css-doctor] Result: ${allOk ? 'PASS' : 'FAIL'}`);
  if (!allOk) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('[css-doctor] Unhandled error:', error);
  process.exit(1);
});
