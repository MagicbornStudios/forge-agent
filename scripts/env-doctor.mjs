#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import {
  getAppConfig,
  getManifestEntries,
  getSelectedApps,
  isEntryRequiredForMode,
  isValueSet,
  parseArgs,
  readEnvFile,
  repoRoot,
  resolveRepoPath,
} from './env/lib.mjs';

const VALID_MODES = new Set(['local', 'preview', 'production']);

function getVercelCommand() {
  return process.platform === 'win32' ? 'vercel.cmd' : 'vercel';
}

/**
 * @param {'studio'|'platform'} app
 * @param {'preview'|'production'} env
 */
async function pullVercelEnv(app, env) {
  const config = getAppConfig(app);
  const vercelCommand = getVercelCommand();
  const tempDir = resolveRepoPath(path.join('.tmp', 'env-doctor', app));
  await fs.mkdir(tempDir, { recursive: true });
  const outFile = path.join(tempDir, `${env}.env`);

  const check = spawnSync(vercelCommand, ['--version'], {
    stdio: 'ignore',
  });
  if (check.status !== 0) {
    return { available: false, warning: 'vercel CLI is not installed or not on PATH.' };
  }

  const pull = spawnSync(
    vercelCommand,
    ['env', 'pull', outFile, '--environment', env, '--yes'],
    {
      cwd: resolveRepoPath(config.dir),
      encoding: 'utf8',
    },
  );

  if (pull.status !== 0) {
    const stderr = (pull.stderr ?? '').trim();
    const stdout = (pull.stdout ?? '').trim();
    const details = stderr || stdout || 'unknown vercel env pull failure';
    return { available: false, warning: `vercel env pull (${env}) failed: ${details}` };
  }

  const pulled = await readEnvFile(outFile);
  return { available: true, values: pulled.values };
}

/**
 * @param {string | undefined} status
 */
function colorize(status) {
  if (!status) return 'unavailable';
  return status;
}

/**
 * @param {string} value
 */
function baseStatus(value) {
  return isValueSet(value) ? 'set' : 'missing';
}

/**
 * @param {Record<string, string>} localValues
 * @param {Record<string, string> | null} targetValues
 * @param {string} key
 */
function compareStatus(localValues, targetValues, key) {
  if (!targetValues) return 'unavailable';
  const target = targetValues[key];
  if (!isValueSet(target)) return 'missing';
  const local = localValues[key];
  if (isValueSet(local) && local !== target) {
    return 'different';
  }
  return 'set';
}

/**
 * @param {'studio'|'platform'} app
 * @param {'local'|'preview'|'production'} mode
 * @param {boolean} includeVercel
 */
async function inspectApp(app, mode, includeVercel) {
  const config = getAppConfig(app);
  const entries = getManifestEntries(app);
  const example = await readEnvFile(resolveRepoPath(config.envExamplePath));
  const local = await readEnvFile(resolveRepoPath(config.envLocalPath));
  const devLocal = await readEnvFile(resolveRepoPath(config.envDevelopmentPath));
  const prodLocal = await readEnvFile(resolveRepoPath(config.envProductionPath));

  /** @type {string[]} */
  const warnings = [];

  /** @type {Record<string, string> | null} */
  let previewValues = devLocal.exists ? devLocal.values : null;
  /** @type {Record<string, string> | null} */
  let productionValues = prodLocal.exists ? prodLocal.values : null;

  if (includeVercel) {
    const pulledPreview = await pullVercelEnv(app, 'preview');
    if (pulledPreview.available) {
      previewValues = pulledPreview.values;
    } else if (pulledPreview.warning) {
      warnings.push(`[${app}] ${pulledPreview.warning}`);
    }
    const pulledProduction = await pullVercelEnv(app, 'production');
    if (pulledProduction.available) {
      productionValues = pulledProduction.values;
    } else if (pulledProduction.warning) {
      warnings.push(`[${app}] ${pulledProduction.warning}`);
    }
  }

  const selectedValues =
    mode === 'local'
      ? local.values
      : mode === 'preview'
        ? previewValues
        : productionValues;

  if (!selectedValues) {
    warnings.push(
      `[${app}] ${mode} source not available. Provide ${config[
        mode === 'preview' ? 'envDevelopmentPath' : 'envProductionPath'
      ]} or use --vercel with linked project.`,
    );
  }

  /** @type {string[]} */
  const failures = [];
  for (const entry of entries) {
    const required = isEntryRequiredForMode(entry, mode, {
      ...example.values,
      ...local.values,
      ...(selectedValues ?? {}),
    });
    if (!required) continue;

    if (!selectedValues || !isValueSet(selectedValues[entry.key])) {
      failures.push(`[${app}] missing required (${mode}) key: ${entry.key}`);
    }
  }

  console.log(`\n[env:doctor] ${config.label}`);
  console.log('key'.padEnd(42), 'example'.padEnd(10), 'local'.padEnd(10), 'preview'.padEnd(11), 'production');
  console.log('-'.repeat(88));

  for (const entry of entries) {
    const exampleStatus = baseStatus(example.values[entry.key]);
    const localStatus = baseStatus(local.values[entry.key]);
    const previewStatus = compareStatus(local.values, previewValues, entry.key);
    const productionStatus = compareStatus(local.values, productionValues, entry.key);
    const required = isEntryRequiredForMode(entry, mode, {
      ...example.values,
      ...local.values,
      ...(selectedValues ?? {}),
    });
    const suffix = required ? ' *' : '';

    console.log(
      `${`${entry.key}${suffix}`.padEnd(42)} ${colorize(exampleStatus).padEnd(10)} ${colorize(localStatus).padEnd(10)} ${colorize(previewStatus).padEnd(11)} ${colorize(productionStatus)}`,
    );
  }

  return { failures, warnings };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const apps = getSelectedApps(typeof options.app === 'string' ? options.app : undefined);
  const modeRaw = typeof options.mode === 'string' ? options.mode.toLowerCase() : 'local';
  if (!VALID_MODES.has(modeRaw)) {
    console.error('[env:doctor] --mode must be one of: local, preview, production');
    process.exit(1);
  }
  const mode = /** @type {'local'|'preview'|'production'} */ (modeRaw);
  const includeVercel = options.vercel === true;

  /** @type {string[]} */
  const allFailures = [];
  /** @type {string[]} */
  const allWarnings = [];

  for (const app of apps) {
    // eslint-disable-next-line no-await-in-loop
    const result = await inspectApp(app, mode, includeVercel);
    allFailures.push(...result.failures);
    allWarnings.push(...result.warnings);
  }

  if (allWarnings.length > 0) {
    console.warn('\n[env:doctor] warnings:');
    for (const warning of allWarnings) {
      console.warn(`  - ${warning}`);
    }
  }

  if (allFailures.length > 0) {
    console.error('\n[env:doctor] failed checks:');
    for (const failure of allFailures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log('\n[env:doctor] PASS');
}

main().catch((error) => {
  console.error('[env:doctor] unhandled error:', error);
  process.exit(1);
});
