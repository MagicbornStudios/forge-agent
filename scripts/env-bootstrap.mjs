#!/usr/bin/env node

/**
 * Env bootstrap: gate for dev commands. When required keys are missing,
 * launches the env portal (--bootstrap) and waits for user to save.
 * When CI or FORGE_SKIP_ENV_BOOTSTRAP=1, behaves like env:ensure:local (check only).
 */

import process from 'node:process';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getAppConfig,
  getManifestEntries,
  getSelectedApps,
  isEntryRequiredForMode,
  isValueSet,
  parseArgs,
  readEnvFile,
  resolveRepoPath,
} from './env/lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKIP_ENV_BOOTSTRAP = process.env.FORGE_SKIP_ENV_BOOTSTRAP === '1';
const IS_CI = process.env.CI === 'true';
const USE_PORTAL = !SKIP_ENV_BOOTSTRAP && !IS_CI;

/**
 * @param {'studio'|'platform'} app
 * @returns {{ ok: boolean, missing: string[] }}
 */
async function checkAppEnvLocal(app) {
  const config = getAppConfig(app);
  const entries = getManifestEntries(app);
  const envPath = resolveRepoPath(config.envLocalPath);
  const existing = await readEnvFile(envPath);
  const values = existing.values;

  const missing = [];
  for (const entry of entries) {
    if (!isEntryRequiredForMode(entry, 'local', values)) continue;
    if (!isValueSet(values[entry.key])) {
      missing.push(entry.key);
    }
  }
  return { ok: missing.length === 0, missing };
}

async function main() {
  if (SKIP_ENV_BOOTSTRAP || IS_CI) {
    const ensurePath = path.resolve(__dirname, 'env-ensure-local.mjs');
    const child = spawn(process.execPath, [ensurePath, ...process.argv.slice(2)], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
    const code = await new Promise((resolve) => child.on('exit', resolve));
    process.exit(code ?? 0);
    return;
  }

  const options = parseArgs(process.argv.slice(2));
  const apps = getSelectedApps(typeof options.app === 'string' ? options.app : undefined);

  let allOk = true;
  const byApp = {};
  for (const app of apps) {
    const result = await checkAppEnvLocal(app);
    byApp[app] = result;
    if (!result.ok) allOk = false;
  }

  if (allOk) {
    return;
  }

  if (!USE_PORTAL) {
    for (const app of apps) {
      const r = byApp[app];
      if (!r.ok) {
        const config = getAppConfig(app);
        console.error(
          `[env:bootstrap] ${config.label} is missing required local keys: ${r.missing.join(', ')}`,
        );
        console.error(`  Run: pnpm env:setup --app ${app}`);
      }
    }
    process.exit(1);
  }

  console.error('[env:bootstrap] Missing required env keys. Opening setup portal...');
  const portalPath = path.resolve(__dirname, 'env', 'env-portal.mjs');
  const child = spawn(
    process.execPath,
    [portalPath, '--bootstrap'],
    {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    },
  );

  await new Promise((resolve, reject) => {
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Portal exited with code ${code}`));
    });
    child.on('error', reject);
  });

  for (const app of apps) {
    const result = await checkAppEnvLocal(app);
    if (!result.ok) {
      const config = getAppConfig(app);
      console.error(
        `[env:bootstrap] ${config.label} still missing required keys: ${result.missing.join(', ')}`,
      );
      console.error(`  Run: pnpm env:portal to complete setup, or pnpm env:setup --app ${app}`);
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error('[env:bootstrap]', error.message);
  process.exit(1);
});
