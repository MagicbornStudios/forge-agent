/**
 * Vercel env sync: reads manifest + app .env.local, maps keys to projects, calls upsert.
 * Never logs plaintext secrets.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_CONFIG, ENV_MANIFEST } from './manifest.mjs';
import { readEnvFile, resolveRepoPath, isValueSet } from './lib.mjs';
import { upsertProjectEnv } from './vercel-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERCEL_CONFIG_PATH = resolveRepoPath('.env.vercel.local');

/** @type {('production'|'preview')[]} */
const DEFAULT_TARGETS = ['production', 'preview'];

/**
 * @returns {{ token: string, teamId?: string, projectStudio: string, projectPlatform: string } | null}
 */
export async function loadVercelConfig() {
  const result = await readEnvFile(VERCEL_CONFIG_PATH);
  if (!result.exists || !isValueSet(result.values.VERCEL_API_TOKEN)) {
    return null;
  }
  return {
    token: result.values.VERCEL_API_TOKEN,
    teamId: result.values.VERCEL_TEAM_ID || undefined,
    projectStudio: result.values.VERCEL_PROJECT_STUDIO || '',
    projectPlatform: result.values.VERCEL_PROJECT_PLATFORM || '',
  };
}

/**
 * @param {string} key
 * @param {{ secret?: boolean }} entry
 */
function envType(entry) {
  return entry?.secret ? 'encrypted' : 'plain';
}

/**
 * @param {{ app: string, key: string, value: string, entry: { secret?: boolean } }[]} items
 * @param {string} projectId
 * @param {string} token
 * @param {string} [teamId]
 * @param {('production'|'preview')[]} [targets]
 */
export async function syncToProject(items, projectId, token, teamId, targets = DEFAULT_TARGETS) {
  const results = [];
  for (const item of items) {
    try {
      await upsertProjectEnv(
        projectId,
        {
          key: item.key,
          value: item.value,
          type: envType(item.entry),
          target: targets,
        },
        token,
        teamId,
      );
      results.push({ key: item.key, ok: true, message: 'upserted' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ key: item.key, ok: false, message: msg });
    }
  }
  return results;
}

/**
 * @param {Record<string, string>} values
 * @param {import('./manifest.mjs').ENV_MANIFEST} manifestEntries
 */
function collectSyncItems(values, manifestEntries) {
  const items = [];
  for (const entry of manifestEntries) {
    const value = values[entry.key];
    if (!isValueSet(value)) continue;
    items.push({
      app: entry.app,
      key: entry.key,
      value,
      entry,
    });
  }
  return items;
}

/**
 * Sync env from .env.local files to both Vercel projects.
 * @param {{ targets?: ('production'|'preview')[] }} [options]
 */
export async function runSync(options = {}) {
  const config = await loadVercelConfig();
  if (!config) {
    throw new Error(
      'Missing Vercel config. Create .env.vercel.local with VERCEL_API_TOKEN, VERCEL_PROJECT_STUDIO, VERCEL_PROJECT_PLATFORM',
    );
  }
  if (!isValueSet(config.projectStudio) || !isValueSet(config.projectPlatform)) {
    throw new Error('VERCEL_PROJECT_STUDIO and VERCEL_PROJECT_PLATFORM required in .env.vercel.local');
  }

  const targets = options.targets ?? DEFAULT_TARGETS;

  const [studioEnv, platformEnv] = await Promise.all([
    readEnvFile(resolveRepoPath(APP_CONFIG.studio.envLocalPath)),
    readEnvFile(resolveRepoPath(APP_CONFIG.platform.envLocalPath)),
  ]);

  const studioEntries = ENV_MANIFEST.filter((e) => e.app === 'studio');
  const platformEntries = ENV_MANIFEST.filter((e) => e.app === 'platform');

  const studioItems = collectSyncItems(studioEnv.values, studioEntries);
  const platformItems = collectSyncItems(platformEnv.values, platformEntries);

  const studioResults = await syncToProject(
    studioItems.map((i) => ({ ...i, entry: i.entry })),
    config.projectStudio,
    config.token,
    config.teamId,
    targets,
  );
  const platformResults = await syncToProject(
    platformItems.map((i) => ({ ...i, entry: i.entry })),
    config.projectPlatform,
    config.token,
    config.teamId,
    targets,
  );

  return {
    studio: { project: config.projectStudio, results: studioResults },
    platform: { project: config.projectPlatform, results: platformResults },
  };
}
