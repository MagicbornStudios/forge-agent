import { spawnSync } from 'node:child_process';

import { resolveActiveProjectRoot } from '@/lib/project-root';
import { isPathWithinRoots, listScopeRoots, normalizeRelPath } from '@/lib/repo-files';
import { resolveScopeGuardContext } from '@/lib/scope-guard';
import type { RepoSearchMatch } from '@/lib/api/types';
import type { RepoSearchInput } from '@/lib/search-input';

const MAX_MATCHES = 300;

function resolveSearchRoots(scopeRoots: string[], allowedRoots: string[]) {
  const normalizedScope = scopeRoots.map((root) => normalizeRelPath(root)).filter(Boolean);
  const normalizedAllowed = allowedRoots.map((root) => normalizeRelPath(root)).filter(Boolean);
  if (normalizedAllowed.length === 0 || normalizedAllowed.includes('.')) {
    return normalizedScope.length > 0 ? normalizedScope : ['.'];
  }
  const narrowed = normalizedScope.filter((scopeRoot) => {
    if (scopeRoot === '.') return true;
    if (isPathWithinRoots(scopeRoot, normalizedAllowed)) return true;
    return normalizedAllowed.some((allowedRoot) => allowedRoot.startsWith(`${scopeRoot}/`));
  });
  if (narrowed.length > 0) return narrowed;
  return normalizedAllowed;
}

function parseRgJsonOutput(stdout: string, maxMatches: number) {
  const matches: RepoSearchMatch[] = [];
  let truncated = false;
  const lines = String(stdout || '').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let event: any;
    try {
      event = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (event?.type !== 'match') continue;
    const data = event?.data || {};
    const filePath = String(data?.path?.text || '').replace(/\\/g, '/');
    const lineNumber = Number(data?.line_number || 0) || 1;
    const submatch = Array.isArray(data?.submatches) ? data.submatches[0] : null;
    const column = Number(submatch?.start || 0) + 1;
    const preview = String(data?.lines?.text || '').replace(/\r?\n$/, '');
    matches.push({
      path: filePath,
      line: lineNumber,
      column,
      preview,
    });
    if (matches.length >= maxMatches) {
      truncated = true;
      break;
    }
  }
  return { matches, truncated };
}

export async function searchRepository(input: RepoSearchInput) {
  const repoRoot = resolveActiveProjectRoot();
  const scopeRoots = await listScopeRoots(repoRoot, input.scope, input.loopId || undefined);
  const guard = await resolveScopeGuardContext({
    loopId: input.loopId || undefined,
  });
  const roots = resolveSearchRoots(scopeRoots, guard.allowedRoots);
  const normalizedRoots = roots.map((root) => (root === '.' ? '.' : normalizeRelPath(root))).filter(Boolean);

  const args = [
    '--json',
    '--line-number',
    '--column',
    '--color',
    'never',
    '--max-filesize',
    '1M',
  ];
  if (!input.regex) {
    args.push('-F');
  }
  for (const pattern of input.include) {
    args.push('-g', pattern);
  }
  for (const pattern of input.exclude) {
    args.push('-g', `!${pattern}`);
  }
  args.push(input.query);
  args.push(...normalizedRoots);

  const result = spawnSync('rg', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.error) {
    throw new Error('ripgrep (rg) is required for /api/repo/search. Install ripgrep and retry.');
  }
  if ((result.status ?? 1) > 1) {
    throw new Error(String(result.stderr || 'Search failed.'));
  }

  const parsed = parseRgJsonOutput(String(result.stdout || ''), MAX_MATCHES);
  return {
    query: input.query,
    regex: input.regex,
    scope: input.scope,
    loopId: input.loopId,
    roots: normalizedRoots,
    include: input.include,
    exclude: input.exclude,
    matches: parsed.matches,
    truncated: parsed.truncated,
  };
}
