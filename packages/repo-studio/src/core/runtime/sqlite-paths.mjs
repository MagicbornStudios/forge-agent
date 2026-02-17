import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function normalizeWorkspaceRoot(workspaceRoot = process.cwd()) {
  return path.resolve(String(workspaceRoot || process.cwd()));
}

function resolveRepoStudioAppDir(workspaceRoot = process.cwd()) {
  const root = normalizeWorkspaceRoot(workspaceRoot);
  const appDir = path.join(root, 'apps', 'repo-studio');
  if (fs.existsSync(path.join(appDir, 'package.json'))) {
    return appDir;
  }
  return root;
}

export function resolveRepoStudioWebDatabasePath(options = {}) {
  const appDir = resolveRepoStudioAppDir(options.workspaceRoot);
  return path.join(appDir, 'data', 'repo-studio.db');
}

export function resolveRepoStudioDesktopDatabasePath(options = {}) {
  const workspaceRoot = normalizeWorkspaceRoot(options.workspaceRoot);
  const providedUserDataPath = String(options.userDataPath || '').trim();
  const userDataBase = providedUserDataPath
    ? path.resolve(providedUserDataPath)
    : path.join(workspaceRoot, '.repo-studio', 'desktop-user-data');
  return path.join(userDataBase, 'repo-studio', 'repo-studio.db');
}

export function toSqliteDatabaseUri(filePath) {
  return pathToFileURL(path.resolve(String(filePath || ''))).href;
}

export function resolveRepoStudioSqlite(options = {}) {
  const explicitDatabaseUri = String(options.explicitDatabaseUri || '').trim();
  const runtime = String(options.runtime || 'web').toLowerCase();

  if (explicitDatabaseUri) {
    return {
      runtime: runtime === 'desktop' ? 'desktop' : 'web',
      databasePath: null,
      databaseUri: explicitDatabaseUri,
      source: 'explicit-env',
    };
  }

  const databasePath = runtime === 'desktop'
    ? resolveRepoStudioDesktopDatabasePath(options)
    : resolveRepoStudioWebDatabasePath(options);

  return {
    runtime: runtime === 'desktop' ? 'desktop' : 'web',
    databasePath,
    databaseUri: toSqliteDatabaseUri(databasePath),
    source: runtime === 'desktop' ? 'desktop-user-data' : 'web-app-data',
  };
}

export function ensureSqliteParentDir(databasePath) {
  if (!databasePath) return null;
  const parent = path.dirname(path.resolve(databasePath));
  fs.mkdirSync(parent, { recursive: true });
  return parent;
}

export function validateSqlitePathWritable(databasePath) {
  const parent = ensureSqliteParentDir(databasePath);
  if (!parent) {
    return {
      ok: false,
      message: 'No sqlite database path provided for write check.',
    };
  }

  const probePath = path.join(parent, '.repo-studio-write-probe.tmp');
  try {
    fs.writeFileSync(probePath, 'ok', 'utf8');
    fs.rmSync(probePath, { force: true });
    return {
      ok: true,
      message: 'sqlite path writable',
      parent,
    };
  } catch (error) {
    return {
      ok: false,
      message: String(error?.message || error),
      parent,
    };
  }
}

