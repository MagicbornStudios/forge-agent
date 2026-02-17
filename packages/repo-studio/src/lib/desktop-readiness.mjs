import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import {
  resolveRepoStudioSqlite,
  validateSqlitePathWritable,
} from '../core/runtime/sqlite-paths.mjs';

const require = createRequire(import.meta.url);
const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function exists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function readJson(filePath, fallback = null) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function resolveStandaloneCandidates(workspaceRoot = process.cwd()) {
  const appRoot = path.join(workspaceRoot, 'apps', 'repo-studio');
  const standaloneRoot = path.join(appRoot, '.next', 'standalone');
  return [
    path.join(standaloneRoot, 'apps', 'repo-studio', 'server.js'),
    path.join(standaloneRoot, 'server.js'),
  ];
}

function resolvePackagePath(packageName, workspaceRoot = process.cwd()) {
  const searchPaths = [workspaceRoot, PACKAGE_ROOT];
  for (const target of searchPaths) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return require.resolve(`${packageName}/package.json`, { paths: [target] });
    } catch {
      // try next search path
    }
  }
  try {
    return require.resolve(`${packageName}/package.json`);
  } catch {
    return null;
  }
}

export function getDesktopReadiness(workspaceRoot = process.cwd()) {
  const electronPackage = resolvePackagePath('electron', workspaceRoot);
  const watcherPackage = resolvePackagePath('chokidar', workspaceRoot);
  const standaloneCandidates = resolveStandaloneCandidates(workspaceRoot);
  const standaloneServer = standaloneCandidates.find((candidate) => exists(candidate)) || null;
  const sqlite = resolveRepoStudioSqlite({
    runtime: 'desktop',
    workspaceRoot,
    explicitDatabaseUri: process.env.REPO_STUDIO_DATABASE_URI,
  });
  const sqliteWritable = sqlite.databasePath
    ? validateSqlitePathWritable(sqlite.databasePath)
    : { ok: true, message: 'explicit database uri configured' };

  const messages = [];
  if (!electronPackage) {
    messages.push('electron package is not installed.');
  }
  if (!watcherPackage) {
    messages.push('chokidar package is not installed.');
  }
  if (!standaloneServer) {
    messages.push('next standalone output not found. Run desktop build pipeline first.');
  }
  if (!sqliteWritable.ok) {
    messages.push(`desktop sqlite path is not writable: ${sqliteWritable.message}`);
  }
  if (messages.length === 0) {
    messages.push('desktop runtime dependencies are ready.');
  }

  return {
    electronInstalled: Boolean(electronPackage),
    nextStandalonePresent: Boolean(standaloneServer),
    sqlitePathWritable: sqliteWritable.ok === true,
    watcherAvailable: Boolean(watcherPackage),
    messages,
    details: {
      electronPackagePath: electronPackage,
      watcherPackagePath: watcherPackage,
      standaloneServerPath: standaloneServer,
      standaloneCandidates,
      sqlite,
      sqliteWriteCheck: sqliteWritable,
    },
  };
}

export function getDesktopAuthReadiness(workspaceRoot = process.cwd()) {
  const authStatePath = path.join(workspaceRoot, '.repo-studio', 'desktop-auth-state.json');
  const state = readJson(authStatePath, {});
  const connected = state?.connected === true;
  const provider = String(state?.provider || 'memory');
  const baseUrlConfigured = typeof state?.baseUrl === 'string' && state.baseUrl.trim().length > 0;
  const capabilities = {
    connect: state?.capabilities?.connect === true,
    read: state?.capabilities?.read === true,
    write: state?.capabilities?.write === true,
  };
  const validationOk = connected && capabilities.connect === true;

  return {
    connected,
    provider,
    baseUrlConfigured,
    validationOk,
    capabilities,
    lastValidatedAt: state?.lastValidatedAt || null,
    message: String(state?.message || (connected ? 'Connected.' : 'Not connected.')),
    statePath: authStatePath,
  };
}
