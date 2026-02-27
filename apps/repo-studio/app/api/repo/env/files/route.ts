import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import { resolveActiveProjectRoot } from '@/lib/project-root';
import { normalizeRelPath, isSafeRepoPath, resolveSafeAbsolutePath } from '@/lib/repo-files';

const ENV_FILE_PATTERN = /^\.env/i;

/**
 * Allowed dir for env files: "." (root) or "apps/<single-segment>" (e.g. apps/repo-studio).
 */
function isAllowedEnvDir(normalized: string): boolean {
  if (normalized === '.' || normalized === '') return true;
  const match = /^apps\/[a-zA-Z0-9._@-]+$/.exec(normalized);
  return Boolean(match);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dirParam = String(url.searchParams.get('dir') ?? '').trim();
  const dir = normalizeRelPath(dirParam || '.');

  if (!isSafeRepoPath(dir) || !isAllowedEnvDir(dir)) {
    return NextResponse.json(
      { ok: false, files: [], message: 'Invalid or disallowed dir for env files.' },
      { status: 400 },
    );
  }

  try {
    const repoRoot = resolveActiveProjectRoot();
    const absoluteDir = resolveSafeAbsolutePath(repoRoot, dir);
    const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

    const files: Array<{ path: string; name: string }> = [];
    for (const entry of entries) {
      if (!entry.isFile() || !ENV_FILE_PATTERN.test(entry.name)) continue;
      const relPath = dir === '.' ? entry.name : `${dir}/${entry.name}`;
      files.push({ path: normalizeRelPath(relPath) || relPath, name: entry.name });
    }
    files.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ ok: true, files });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, files: [], message }, { status: 500 });
  }
}
