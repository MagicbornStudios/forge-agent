import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { resolveActiveProjectRoot, resolveHostWorkspaceRoot } from '@/lib/project-root';

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

export function runRepoStudioCli(args: string[], options: { timeoutMs?: number; cwd?: string } = {}) {
  const hostRoot = resolveHostWorkspaceRoot();
  const targetCwd = options.cwd ? path.resolve(options.cwd) : resolveActiveProjectRoot();
  const cliPath = path.join(hostRoot, 'packages', 'repo-studio', 'src', 'cli.mjs');
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: targetCwd,
    encoding: 'utf8',
    timeout: Number(options.timeoutMs || 30000),
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
