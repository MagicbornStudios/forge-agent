import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

const PNPM_WORKSPACE_FILE = 'pnpm-workspace.yaml';

type LoopIndexEntry = {
  id?: string;
  scope?: string[];
};

type LoopIndex = {
  activeLoopId?: string;
  loops?: LoopIndexEntry[];
};

const MAX_FILE_READ_BYTES = 1024 * 1024 * 2;
const DEFAULT_MAX_TREE_ITEMS = 1500;
const DEFAULT_MAX_DEPTH = 8;

export function normalizeRelPath(input: string) {
  return String(input || '').replace(/\\/g, '/').replace(/^\.\/+/, '').trim();
}

/**
 * Resolves the repository root by walking up from cwd until pnpm-workspace.yaml is found.
 * Single source of truth for repo root; use this instead of inline path.resolve(cwd, '..', '..').
 */
export function resolveRepoRoot(cwd: string = process.cwd()): string {
  const direct = path.resolve(cwd);
  if (existsSync(path.join(direct, PNPM_WORKSPACE_FILE))) return direct;

  const parent = path.resolve(direct, '..');
  if (existsSync(path.join(parent, PNPM_WORKSPACE_FILE))) return parent;

  const grandParent = path.resolve(direct, '..', '..');
  if (existsSync(path.join(grandParent, PNPM_WORKSPACE_FILE))) return grandParent;

  return direct;
}

export function isSafeRepoPath(filePath: string) {
  const normalized = normalizeRelPath(filePath);
  if (!normalized) return false;
  if (normalized.startsWith('/') || /^[a-zA-Z]:\//.test(normalized)) return false;
  if (normalized.includes('../') || normalized.includes('..\\')) return false;
  return /^[a-zA-Z0-9._/@\-]+(?:\/[a-zA-Z0-9._@\-]+)*$/.test(normalized);
}

function shouldIgnoreSegment(name: string) {
  const value = String(name || '').trim();
  if (!value) return true;
  if (value === '.git' || value === 'node_modules' || value === '.next') return true;
  if (value.startsWith('.turbo')) return true;
  return false;
}

function isWithinRepoRoot(repoRoot: string, candidate: string) {
  const normalizedRoot = path.resolve(repoRoot);
  const normalizedCandidate = path.resolve(candidate);
  return normalizedCandidate === normalizedRoot || normalizedCandidate.startsWith(`${normalizedRoot}${path.sep}`);
}

export function resolveSafeAbsolutePath(repoRoot: string, repoRelativePath: string) {
  const normalized = normalizeRelPath(repoRelativePath);
  if (!isSafeRepoPath(normalized)) {
    throw new Error(`Invalid path: ${repoRelativePath}`);
  }
  const candidate = path.resolve(repoRoot, normalized);
  if (!isWithinRepoRoot(repoRoot, candidate)) {
    throw new Error(`Path escapes repository root: ${repoRelativePath}`);
  }
  return candidate;
}

async function readLoopIndex(repoRoot: string): Promise<LoopIndex> {
  try {
    const raw = await fs.readFile(path.join(repoRoot, '.planning', 'LOOPS.json'), 'utf8');
    return JSON.parse(raw) as LoopIndex;
  } catch {
    return { activeLoopId: 'default', loops: [{ id: 'default', scope: ['.'] }] };
  }
}

export async function listScopeRoots(repoRoot: string, scope: 'workspace' | 'loop', loopId?: string) {
  if (scope === 'workspace') return ['.'];
  const index = await readLoopIndex(repoRoot);
  const selectedLoopId = normalizeRelPath(loopId || index.activeLoopId || 'default') || 'default';
  const entries = Array.isArray(index.loops) ? index.loops : [];
  const match = entries.find((entry) => normalizeRelPath(String(entry?.id || '')) === selectedLoopId);
  const scopeRoots = Array.isArray(match?.scope) ? match!.scope! : ['.'];
  return scopeRoots.length > 0 ? scopeRoots : ['.'];
}

export function isPathWithinRoots(repoRelativePath: string, roots: string[]) {
  const target = normalizeRelPath(repoRelativePath);
  if (!target) return false;
  const normalizedRoots = (roots || [])
    .map((value) => normalizeRelPath(value))
    .filter(Boolean);
  if (normalizedRoots.length === 0 || normalizedRoots.includes('.')) return true;
  return normalizedRoots.some((root) => target === root || target.startsWith(`${root}/`));
}

export async function listRepoFiles(options: {
  scope: 'workspace' | 'loop';
  loopId?: string;
  allowedRoots?: string[];
  maxItems?: number;
  maxDepth?: number;
  repoRoot?: string;
}) {
  const repoRoot = options.repoRoot ? path.resolve(options.repoRoot) : resolveRepoRoot();
  const scopeRoots = await listScopeRoots(repoRoot, options.scope, options.loopId);
  const allowedRoots = (options.allowedRoots || [])
    .map((value) => normalizeRelPath(value))
    .filter(Boolean);
  const maxItems = Number.isInteger(options.maxItems) ? Number(options.maxItems) : DEFAULT_MAX_TREE_ITEMS;
  const maxDepth = Number.isInteger(options.maxDepth) ? Number(options.maxDepth) : DEFAULT_MAX_DEPTH;
  const files: string[] = [];
  const seen = new Set<string>();

  const stack: Array<{ relRoot: string; relPath: string; depth: number }> = scopeRoots.map((entry) => ({
    relRoot: normalizeRelPath(entry) || '.',
    relPath: normalizeRelPath(entry) || '.',
    depth: 0,
  }));

  while (stack.length > 0 && files.length < maxItems) {
    const current = stack.pop();
    if (!current) break;
    const absolute = resolveSafeAbsolutePath(repoRoot, current.relPath);

    let entries: Array<{ name: string; isDirectory: () => boolean; isFile: () => boolean }> = [];
    try {
      // eslint-disable-next-line no-await-in-loop
      entries = await fs.readdir(absolute, { withFileTypes: true });
    } catch {
      continue;
    }

    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (shouldIgnoreSegment(entry.name)) continue;
      const childRel = normalizeRelPath(path.join(current.relPath, entry.name));
      if (!childRel) continue;
      if (seen.has(childRel)) continue;
      seen.add(childRel);

      if (entry.isDirectory()) {
        if (allowedRoots.length > 0 && !isPathWithinRoots(childRel, allowedRoots) && !allowedRoots.some((root) => root.startsWith(`${childRel}/`))) {
          continue;
        }
        if (current.depth < maxDepth) {
          stack.push({
            relRoot: current.relRoot,
            relPath: childRel,
            depth: current.depth + 1,
          });
        }
        continue;
      }

      if (entry.isFile()) {
        if (allowedRoots.length > 0 && !isPathWithinRoots(childRel, allowedRoots)) {
          continue;
        }
        files.push(childRel);
        if (files.length >= maxItems) break;
      }
    }
  }

  files.sort((a, b) => a.localeCompare(b));
  return {
    repoRoot,
    scope: options.scope,
    loopId: options.loopId || null,
    files,
    truncated: files.length >= maxItems,
    maxItems,
  };
}

export async function readRepoFile(repoRelativePath: string, repoRootInput?: string) {
  const repoRoot = repoRootInput ? path.resolve(repoRootInput) : resolveRepoRoot();
  const absolute = resolveSafeAbsolutePath(repoRoot, repoRelativePath);
  const stat = await fs.stat(absolute);
  if (stat.size > MAX_FILE_READ_BYTES) {
    throw new Error(`File too large (${stat.size} bytes). Max allowed is ${MAX_FILE_READ_BYTES}.`);
  }
  const content = await fs.readFile(absolute, 'utf8');
  return {
    repoRoot,
    path: normalizeRelPath(repoRelativePath),
    content,
    size: stat.size,
  };
}

export async function writeRepoFile(input: {
  path: string;
  content: string;
  createIfMissing?: boolean;
  repoRoot?: string;
}) {
  const repoRoot = input.repoRoot ? path.resolve(input.repoRoot) : resolveRepoRoot();
  const repoRelativePath = normalizeRelPath(input.path);
  const absolute = resolveSafeAbsolutePath(repoRoot, repoRelativePath);
  const parentDir = path.dirname(absolute);
  await fs.mkdir(parentDir, { recursive: true });

  if (input.createIfMissing !== true) {
    try {
      await fs.access(absolute);
    } catch {
      throw new Error(`File does not exist: ${repoRelativePath}`);
    }
  }

  await fs.writeFile(absolute, String(input.content || ''), 'utf8');
  const stat = await fs.stat(absolute);
  return {
    repoRoot,
    path: repoRelativePath,
    size: stat.size,
  };
}
