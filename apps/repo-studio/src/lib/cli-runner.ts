import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { resolveRepoRoot } from '@/lib/repo-files';

function parseJsonPayload(stdout: string) {
  const raw = String(stdout || '').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function parseJsonPayloadFromStreams(stdout: string, stderr: string) {
  return parseJsonPayload(stdout) || parseJsonPayload(stderr);
}

export { resolveRepoRoot } from '@/lib/repo-files';

export function runRepoStudioCli(args: string[]) {
  const repoRoot = resolveRepoRoot();
  const cliPath = path.join(repoRoot, 'packages', 'repo-studio', 'src', 'cli.mjs');
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  const payload = parseJsonPayload(String(result.stdout || ''));
  return {
    ok: (result.status ?? 1) === 0,
    code: result.status ?? 1,
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    payload: parseJsonPayloadFromStreams(String(result.stdout || ''), String(result.stderr || '')) || payload,
  };
}
