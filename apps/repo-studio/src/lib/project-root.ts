import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import { runGitSpawnSync } from '@/lib/git-resolver';

const PNPM_WORKSPACE_FILE = 'pnpm-workspace.yaml';
const PROJECTS_COLLECTION = 'repo-projects';
const ACTIVE_PROJECT_RUNTIME_FILE = path.join('.repo-studio', 'active-project.json');

type PayloadProjectDoc = {
  id?: string;
  projectId?: string;
  name?: string;
  rootPath?: string;
  remoteUrl?: string;
  provider?: string;
  defaultBranch?: string;
  active?: boolean;
  createdAtIso?: string;
};

async function getRepoStudioPayloadLazy() {
  const payloadClientModule = await import('./payload-client');
  return payloadClientModule.getRepoStudioPayload();
}

export type RepoProjectRecord = {
  projectId: string;
  name: string;
  rootPath: string;
  remoteUrl: string;
  provider: string;
  defaultBranch: string;
  isGitRepo: boolean;
  active: boolean;
  createdAt: string;
};

export type RepoProjectBrowseEntry = {
  name: string;
  path: string;
};

export type RepoProjectBrowseResult = {
  cwd: string;
  parent: string | null;
  roots: string[];
  entries: RepoProjectBrowseEntry[];
};

function nowIso() {
  return new Date().toISOString();
}

export function resolveHostWorkspaceRoot(cwd: string = process.cwd()): string {
  const direct = path.resolve(cwd);
  if (fs.existsSync(path.join(direct, PNPM_WORKSPACE_FILE))) return direct;
  const parent = path.resolve(direct, '..');
  if (fs.existsSync(path.join(parent, PNPM_WORKSPACE_FILE))) return parent;
  const grandParent = path.resolve(direct, '..', '..');
  if (fs.existsSync(path.join(grandParent, PNPM_WORKSPACE_FILE))) return grandParent;
  return direct;
}

function runtimeStatePath() {
  return path.join(resolveHostWorkspaceRoot(), ACTIVE_PROJECT_RUNTIME_FILE);
}

function isGitRepoPath(rootPath: string) {
  const absolute = path.resolve(String(rootPath || '').trim());
  if (!absolute || !fs.existsSync(absolute)) return false;
  return fs.existsSync(path.join(absolute, '.git'));
}

function normalizeProjectRecord(input: PayloadProjectDoc): RepoProjectRecord | null {
  const projectId = String(input.projectId || '').trim();
  const rootPath = String(input.rootPath || '').trim();
  if (!projectId || !rootPath) return null;
  return {
    projectId,
    name: String(input.name || path.basename(rootPath) || projectId).trim() || projectId,
    rootPath,
    remoteUrl: String(input.remoteUrl || '').trim(),
    provider: String(input.provider || '').trim(),
    defaultBranch: String(input.defaultBranch || '').trim(),
    isGitRepo: isGitRepoPath(rootPath),
    active: input.active === true,
    createdAt: String(input.createdAtIso || nowIso()),
  };
}

export function resolveActiveProjectRoot() {
  try {
    const raw = fs.readFileSync(runtimeStatePath(), 'utf8');
    const parsed = JSON.parse(raw) as { rootPath?: unknown };
    const rootPath = String(parsed.rootPath || '').trim();
    if (rootPath && fs.existsSync(rootPath)) {
      return rootPath;
    }
  } catch {
    // ignore runtime state read failures
  }
  return resolveHostWorkspaceRoot();
}

async function writeActiveProjectRuntime(project: RepoProjectRecord | null) {
  const filePath = runtimeStatePath();
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, `${JSON.stringify({
    projectId: project?.projectId || null,
    rootPath: project?.rootPath || null,
    updatedAt: nowIso(),
  }, null, 2)}\n`, 'utf8');
}

function inferProvider(remoteUrl: string) {
  const normalized = String(remoteUrl || '').toLowerCase();
  if (!normalized) return '';
  if (normalized.includes('github.com')) return 'github';
  if (normalized.includes('gitlab.com')) return 'gitlab';
  return 'git';
}

function readGitRemote(rootPath: string) {
  const result = runGitSpawnSync(['remote', 'get-url', 'origin'], {
    cwd: rootPath,
    timeout: 5000,
  });
  if ((result.status ?? 1) !== 0) return '';
  return String(result.stdout || '').trim();
}

function readDefaultBranch(rootPath: string) {
  const result = runGitSpawnSync(['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: rootPath,
    timeout: 5000,
  });
  if ((result.status ?? 1) !== 0) return '';
  return String(result.stdout || '').trim();
}

function assertProjectDirectory(rootPath: string) {
  const absolute = path.resolve(String(rootPath || '').trim());
  if (!absolute) {
    throw new Error('rootPath is required.');
  }
  if (!fs.existsSync(absolute)) {
    throw new Error(`Path does not exist: ${absolute}`);
  }
  let stat: fs.Stats;
  try {
    stat = fs.statSync(absolute);
  } catch {
    throw new Error(`Unable to access path: ${absolute}`);
  }
  if (!stat.isDirectory()) {
    throw new Error(`Path is not a directory: ${absolute}`);
  }
  return absolute;
}

function listDirectoryRoots() {
  const roots = new Set<string>();
  if (process.platform === 'win32') {
    for (let code = 65; code <= 90; code += 1) {
      const drive = `${String.fromCharCode(code)}:\\`;
      if (fs.existsSync(drive)) roots.add(drive);
    }
  } else {
    roots.add(path.parse(resolveHostWorkspaceRoot()).root || '/');
  }
  roots.add(resolveHostWorkspaceRoot());
  roots.add(resolveActiveProjectRoot());
  const home = os.homedir();
  if (home && fs.existsSync(home)) roots.add(path.resolve(home));
  return Array.from(roots)
    .map((entry) => path.resolve(entry))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export async function browseProjectDirectories(input: { path?: string; limit?: number }) : Promise<RepoProjectBrowseResult> {
  const roots = listDirectoryRoots();
  const requestedPath = String(input.path || '').trim();
  const fallbackRoot = roots[0] || resolveHostWorkspaceRoot();
  const cwd = assertProjectDirectory(requestedPath || fallbackRoot);
  const parent = path.dirname(cwd);
  const parentPath = parent && parent !== cwd ? parent : null;
  const dirEntries = await fsp.readdir(cwd, { withFileTypes: true });
  const limit = Number.isFinite(input.limit) ? Math.max(1, Math.floor(Number(input.limit))) : 300;
  const entries = dirEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      path: path.join(cwd, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit);
  return {
    cwd,
    parent: parentPath,
    roots,
    entries,
  };
}

async function saveProject(project: RepoProjectRecord) {
  const payload = await getRepoStudioPayloadLazy();
  const existing = await payload.find({
    collection: PROJECTS_COLLECTION,
    where: {
      projectId: {
        equals: project.projectId,
      },
    },
    limit: 1,
  });
  const doc = existing?.docs?.[0] as PayloadProjectDoc | undefined;
  const data = {
    projectId: project.projectId,
    name: project.name,
    rootPath: project.rootPath,
    remoteUrl: project.remoteUrl,
    provider: project.provider,
    defaultBranch: project.defaultBranch,
    active: project.active,
    createdAtIso: project.createdAt,
  };
  const saved = doc?.id
    ? await payload.update({ collection: PROJECTS_COLLECTION, id: doc.id, data })
    : await payload.create({ collection: PROJECTS_COLLECTION, data });
  return normalizeProjectRecord(saved as PayloadProjectDoc) || project;
}

export async function listRepoProjects() {
  const payload = await getRepoStudioPayloadLazy();
  const result = await payload.find({
    collection: PROJECTS_COLLECTION,
    limit: 500,
    sort: '-updatedAt',
  });
  return (result?.docs || [])
    .map((entry: PayloadProjectDoc) => normalizeProjectRecord(entry))
    .filter(Boolean) as RepoProjectRecord[];
}

export async function getActiveRepoProject() {
  const projects = await listRepoProjects();
  const active = projects.find((entry) => entry.active);
  if (active) return active;
  const activeRoot = resolveActiveProjectRoot();
  return projects.find((entry) => path.resolve(entry.rootPath) === path.resolve(activeRoot)) || null;
}

export async function importLocalRepoProject(input: { rootPath: string; name?: string }) {
  const rootPath = assertProjectDirectory(input.rootPath);
  const remoteUrl = readGitRemote(rootPath);
  const project: RepoProjectRecord = {
    projectId: randomUUID(),
    name: String(input.name || path.basename(rootPath)).trim() || path.basename(rootPath),
    rootPath,
    remoteUrl,
    provider: inferProvider(remoteUrl),
    defaultBranch: readDefaultBranch(rootPath),
    isGitRepo: isGitRepoPath(rootPath),
    active: true,
    createdAt: nowIso(),
  };

  const projects = await listRepoProjects();
  for (const existing of projects) {
    if (path.resolve(existing.rootPath) === path.resolve(rootPath)) {
      const updated = await setActiveRepoProject(existing.projectId);
      return updated || existing;
    }
  }

  const saved = await saveProject(project);
  await setActiveRepoProject(saved.projectId);
  return saved;
}

export async function cloneRepoProject(input: { remoteUrl: string; targetPath: string; name?: string }) {
  const remoteUrl = String(input.remoteUrl || '').trim();
  const targetPath = path.resolve(String(input.targetPath || '').trim());
  if (!remoteUrl) {
    throw new Error('remoteUrl is required.');
  }
  if (!targetPath) {
    throw new Error('targetPath is required.');
  }
  await fsp.mkdir(path.dirname(targetPath), { recursive: true });
  const result = runGitSpawnSync(['clone', remoteUrl, targetPath], {
    cwd: resolveHostWorkspaceRoot(),
    timeout: 180000,
  });
  if ((result.status ?? 1) !== 0) {
    throw new Error(String(result.stderr || result.stdout || 'git clone failed.'));
  }
  return importLocalRepoProject({
    rootPath: targetPath,
    name: input.name,
  });
}

export async function setActiveRepoProject(projectId: string) {
  const normalizedProjectId = String(projectId || '').trim();
  if (!normalizedProjectId) {
    throw new Error('projectId is required.');
  }
  const payload = await getRepoStudioPayloadLazy();
  const projects = await listRepoProjects();
  const target = projects.find((entry) => entry.projectId === normalizedProjectId);
  if (!target) {
    throw new Error(`Unknown project id: ${normalizedProjectId}`);
  }

  for (const project of projects) {
    const shouldBeActive = project.projectId === normalizedProjectId;
    if (project.active === shouldBeActive) continue;
    const existing = await payload.find({
      collection: PROJECTS_COLLECTION,
      where: {
        projectId: {
          equals: project.projectId,
        },
      },
      limit: 1,
    });
    const doc = existing?.docs?.[0] as PayloadProjectDoc | undefined;
    if (!doc?.id) continue;
    // eslint-disable-next-line no-await-in-loop
    await payload.update({
      collection: PROJECTS_COLLECTION,
      id: doc.id,
      data: {
        active: shouldBeActive,
      },
    });
  }

  const next = {
    ...target,
    active: true,
  };
  await writeActiveProjectRuntime(next);
  return next;
}
