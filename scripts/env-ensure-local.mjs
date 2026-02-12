#!/usr/bin/env node

import process from 'node:process';
import {
  asString,
  buildEnvFile,
  getAppConfig,
  getManifestEntries,
  getSelectedApps,
  isEntryRequiredForMode,
  isValueSet,
  parseArgs,
  readEnvFile,
  resolveRepoPath,
  writeTextFile,
} from './env/lib.mjs';

const SKIP_ENV_BOOTSTRAP = process.env.FORGE_SKIP_ENV_BOOTSTRAP === '1';

/**
 * @param {'studio'|'platform'} app
 */
async function ensureAppEnvLocal(app) {
  const config = getAppConfig(app);
  const entries = getManifestEntries(app);
  const envPath = resolveRepoPath(config.envLocalPath);
  const existing = await readEnvFile(envPath);

  /** @type {Record<string, string>} */
  const values = { ...existing.values };
  let created = false;

  if (!existing.exists) {
    created = true;
    for (const entry of entries) {
      const defaultValue = asString(entry.exampleDefault);
      if (isEntryRequiredForMode(entry, 'local', values)) {
        values[entry.key] = defaultValue;
      }
    }

    const knownKeys = entries.map((entry) => entry.key);
    const orderedValues = {};
    for (const key of knownKeys) {
      if (key in values) {
        orderedValues[key] = values[key];
      }
    }

    const fileContent = buildEnvFile(
      [
        '# Auto-created by `pnpm env:ensure:local`.',
        '# Run `pnpm env:setup --app ' + app + '` to fill/update values interactively.',
      ],
      orderedValues,
      knownKeys,
    );
    await writeTextFile(envPath, fileContent);
  }

  /** @type {string[]} */
  const missingRequired = [];
  for (const entry of entries) {
    const required = isEntryRequiredForMode(entry, 'local', values);
    if (!required) continue;
    if (!isValueSet(values[entry.key])) {
      missingRequired.push(entry.key);
    }
  }

  if (created) {
    console.log(`[env:ensure:local] created ${config.envLocalPath}`);
  }

  if (missingRequired.length > 0) {
    console.error(
      `[env:ensure:local] ${config.label} is missing required local keys: ${missingRequired.join(', ')}`,
    );
    console.error(`  Run: pnpm env:setup --app ${app}`);
    return false;
  }

  return true;
}

async function main() {
  if (SKIP_ENV_BOOTSTRAP || process.env.CI === 'true') {
    console.log('[env:ensure:local] skipped (FORGE_SKIP_ENV_BOOTSTRAP=1 or CI=true).');
    return;
  }

  const options = parseArgs(process.argv.slice(2));
  const apps = getSelectedApps(typeof options.app === 'string' ? options.app : undefined);

  let ok = true;
  for (const app of apps) {
    // eslint-disable-next-line no-await-in-loop
    const result = await ensureAppEnvLocal(app);
    ok = ok && result;
  }

  if (!ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('[env:ensure:local] unhandled error:', error);
  process.exit(1);
});

