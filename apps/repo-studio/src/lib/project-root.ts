import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { getRepoStudioPayload } from '@/lib/payload-client';

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

export type RepoProjectRecord = {
  projectId: string;
  name: string;
  rootPath: string;
  remoteUrl: string;
  provider: string;
  defaultBranch: string;
  active: boolean;
  createdAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

export function resolveWorkspaceRoot(cwd: string = process.cwd()): string {
  const direct = path.resolve(cwd);
  if (fs.existsSync(path.join(direct, PNPM_WORKSPACE_FILE))) return direct;
  const parent = path.resolve(direct, '..');
  if (fs.existsSync(path.join(parent, PNPM_WORKSPACE_FILE))) return parent;
  const grandParent = path.resolve(direct, '..', '..');
  if (fs.existsSync(path.join(grandParent, PNPM_WORKSPACE_FILE))) return grandParent;
  return direct;
}

function runtimeStatePath() {
  return path.join(resolveWorkspaceRoot(), ACTIVE_PROJECT_RUNTIME_FILE);
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
  return resolveWorkspaceRoot();
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
  const result = spawnSync('git', ['remote', 'get-url', 'origin'], {
    cwd: rootPath,
    encoding: 'utf8',
    timeout: 5000,
  });
  if ((result.status ?? 1) !== 0) return '';
  return String(result.stdout || '').trim();
}

function readDefaultBranch(rootPath: string) {
  const result = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
    cwd: rootPath,
    encoding: 'utf8',
    timeout: 5000,
  });
  if ((result.status ?? 1) !== 0) return '';
  return String(result.stdout || '').trim();
}

function assertGitRepo(rootPath: string) {
  const absolute = path.resolve(String(rootPath || '').trim());
  if (!absolute) {
    throw new Error('rootPath is required.');
  }
  if (!fs.existsSync(absolute)) {
    throw new Error(`Path does not exist: ${absolute}`);
  }
  const gitDir = path.join(absolute, '.git');
  if (!fs.existsSync(gitDir)) {
    throw new Error(`Path is not a git repository: ${absolute}`);
  }
  return absolute;
}

async function saveProject(project: RepoProjectRecord) {
  const payload = await getRepoStudioPayload();
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
  const payload = await getRepoStudioPayload();
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
  const rootPath = assertGitRepo(input.rootPath);
  const remoteUrl = readGitRemote(rootPath);
  const project: RepoProjectRecord = {
    projectId: randomUUID(),
    name: String(input.name || path.basename(rootPath)).trim() || path.basename(rootPath),
    rootPath,
    remoteUrl,
    provider: inferProvider(remoteUrl),
    defaultBranch: readDefaultBranch(rootPath),
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
  const result = spawnSync('git', ['clone', remoteUrl, targetPath], {
    cwd: resolveWorkspaceRoot(),
    encoding: 'utf8',
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
  const payload = await getRepoStudioPayload();
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
