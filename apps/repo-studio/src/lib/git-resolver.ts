import fs from 'node:fs';
import path from 'node:path';
import {
  spawnSync,
  type SpawnSyncOptionsWithStringEncoding,
  type SpawnSyncReturns,
} from 'node:child_process';
import { resolveHostWorkspaceRoot } from '@/lib/project-root';

export type ResolvedGitExecutable = {
  command: string;
  source: 'env' | 'bundled' | 'system';
  path: string;
};

let cached: ResolvedGitExecutable | null = null;

function isExecutable(filePath: string) {
  if (!filePath) return false;
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function bundledGitCandidates(hostRoot: string) {
  if (process.platform !== 'win32') return [];
  return [
    path.join(hostRoot, 'resources', 'git', 'windows', 'cmd', 'git.exe'),
    path.join(hostRoot, 'vendor', 'git', 'windows', 'cmd', 'git.exe'),
    path.join(hostRoot, '.repo-studio', 'tools', 'git', 'windows', 'cmd', 'git.exe'),
    path.join(hostRoot, 'apps', 'repo-studio', 'resources', 'git', 'windows', 'cmd', 'git.exe'),
  ];
}

export function resolveRepoStudioGitExecutable(): ResolvedGitExecutable {
  if (cached) return cached;
  const envPath = String(process.env.REPO_STUDIO_GIT_PATH || '').trim();
  if (envPath && isExecutable(envPath)) {
    cached = {
      command: envPath,
      source: 'env',
      path: envPath,
    };
    return cached;
  }

  const hostRoot = resolveHostWorkspaceRoot();
  for (const candidate of bundledGitCandidates(hostRoot)) {
    if (!isExecutable(candidate)) continue;
    cached = {
      command: candidate,
      source: 'bundled',
      path: candidate,
    };
    return cached;
  }

  cached = {
    command: 'git',
    source: 'system',
    path: 'git',
  };
  return cached;
}

export function runGitSpawnSync(
  args: string[],
  options: Omit<SpawnSyncOptionsWithStringEncoding, 'encoding'> = {},
): SpawnSyncReturns<string> {
  const resolved = resolveRepoStudioGitExecutable();
  return spawnSync(resolved.command, args, { ...options, encoding: 'utf8' });
}
