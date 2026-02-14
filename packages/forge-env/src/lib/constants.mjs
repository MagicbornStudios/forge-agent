import path from 'node:path';

export const REPO_ROOT = process.cwd();

export const FORGE_ENV_DIR = path.join(REPO_ROOT, '.forge-env');
export const FORGE_ENV_CONFIG_PATH = path.join(FORGE_ENV_DIR, 'config.json');

export const MODES = ['local', 'preview', 'production', 'headless'];

export function resolveRepoPath(relativePath) {
  if (!relativePath) return REPO_ROOT;
  return path.isAbsolute(relativePath) ? relativePath : path.join(REPO_ROOT, relativePath);
}

export function normalizeProfileId(rawProfile) {
  const normalized = String(rawProfile || '').trim().toLowerCase();
  if (!normalized) {
    return { profile: 'forge-loop', alias: null };
  }

  if (normalized === 'generic') {
    return { profile: 'forge-loop', alias: 'generic' };
  }

  if (normalized === 'forge-agent' || normalized === 'forge-loop' || normalized === 'custom') {
    return { profile: normalized, alias: null };
  }

  return { profile: 'custom', alias: null };
}

export function parseArgs(argv) {
  const positional = [];
  const flags = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }

    const keyValue = token.slice(2).split('=');
    const key = keyValue[0];
    if (!key) continue;

    if (keyValue.length > 1) {
      flags.set(key, keyValue.slice(1).join('='));
      continue;
    }

    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      flags.set(key, next);
      index += 1;
      continue;
    }

    flags.set(key, true);
  }

  return { positional, flags };
}
