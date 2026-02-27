import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import { resolveActiveProjectRoot } from '@/lib/project-root';
import { normalizeRelPath } from '@/lib/repo-files';

const ENV_SCOPES_ROOT_ID = 'root';
const ENV_SCOPES_ROOT_LABEL = 'Root';
const APPS_DIR = 'apps';

export async function GET() {
  try {
    const repoRoot = resolveActiveProjectRoot();
    const scopes: Array<{ id: string; dir: string; label: string }> = [
      { id: ENV_SCOPES_ROOT_ID, dir: '.', label: ENV_SCOPES_ROOT_LABEL },
    ];

    const appsPath = path.join(repoRoot, APPS_DIR);
    let entries: Array<{ name: string; isDirectory: () => boolean }> = [];
    try {
      entries = await fs.readdir(appsPath, { withFileTypes: true });
    } catch {
      return NextResponse.json({ ok: true, scopes });
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const dir = normalizeRelPath(path.join(APPS_DIR, entry.name));
      if (!dir) continue;
      scopes.push({
        id: entry.name,
        dir,
        label: entry.name,
      });
    }

    scopes.sort((a, b) => (a.id === ENV_SCOPES_ROOT_ID ? -1 : b.id === ENV_SCOPES_ROOT_ID ? 1 : a.label.localeCompare(b.label)));
    return NextResponse.json({ ok: true, scopes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, scopes: [], message }, { status: 500 });
  }
}
