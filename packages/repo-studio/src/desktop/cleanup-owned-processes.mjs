import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { resolveCurrentInstallState, resolveLocalProgramsRoot } from './install-locations.mjs';

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args.set(key, next);
      index += 1;
      continue;
    }
    args.set(key, true);
  }

  const extraRootsRaw = String(args.get('extra-roots') || '').trim();
  const extraRoots = extraRootsRaw
    ? extraRootsRaw.split(/[;,]/).map((part) => part.trim()).filter(Boolean)
    : [];

  return {
    installDir: String(args.get('install-dir') || '').trim(),
    extraRoots,
    failOnKillError: args.get('fail-on-kill-error') === true,
  };
}

function normalizePath(input) {
  return path.resolve(String(input || '')).replace(/[\\/]+$/, '');
}

function uniquePaths(paths = []) {
  const seen = new Set();
  const out = [];
  for (const candidate of paths) {
    if (!candidate) continue;
    const normalized = normalizePath(candidate);
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function safeLower(input) {
  return String(input || '').toLowerCase();
}

function parseProcessList(raw) {
  if (!raw) return [];
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') return [parsed];
  return [];
}

function getWindowsProcessList() {
  if (process.platform !== 'win32') return [];
  const script = [
    'Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |',
    'Select-Object ProcessId, ParentProcessId, Name, ExecutablePath, CommandLine |',
    'ConvertTo-Json -Depth 3',
  ].join(' ');
  const result = spawnSync('powershell', ['-NoProfile', '-Command', script], {
    encoding: 'utf8',
  });
  if ((result.status ?? 1) !== 0) return [];

  return parseProcessList(result.stdout).map((entry) => ({
    pid: Number(entry.ProcessId || 0),
    parentPid: Number(entry.ParentProcessId || 0),
    name: String(entry.Name || ''),
    executablePath: String(entry.ExecutablePath || ''),
    commandLine: String(entry.CommandLine || ''),
  })).filter((entry) => Number.isInteger(entry.pid) && entry.pid > 0);
}

function buildKnownRoots(options = {}) {
  const localPrograms = resolveLocalProgramsRoot();
  const installState = resolveCurrentInstallState({ installDir: options.installDir });
  const installRoots = (installState.installs || []).map((entry) => entry.installDir);
  const localProgramRoots = localPrograms
    ? [
      path.join(localPrograms, 'RepoStudio'),
      path.join(localPrograms, '@forgerepo-studio'),
    ]
    : [];

  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
  const buildRoots = [
    path.join(repoRoot, 'packages', 'repo-studio', 'dist', 'desktop', 'win-unpacked'),
    path.join(os.tmpdir(), 'RepoStudioSilentInstallSmoke'),
    path.join(os.tmpdir(), 'RepoStudioInstallSmoke'),
  ];

  return {
    installState,
    roots: uniquePaths([
      ...installRoots,
      ...localProgramRoots,
      ...buildRoots,
      ...(Array.isArray(options.extraRoots) ? options.extraRoots : []),
    ]),
  };
}

function processOwnedByKnownRoots(proc, roots = []) {
  const exe = safeLower(proc.executablePath);
  const cmd = safeLower(proc.commandLine);
  if (!exe && !cmd) return false;

  return roots.some((rootPath) => {
    const root = safeLower(rootPath);
    return (exe && exe.startsWith(root))
      || (cmd && cmd.includes(root));
  });
}

function collectDescendantPids(seedPids, processes) {
  const byParent = new Map();
  for (const proc of processes) {
    const parentPid = Number(proc.parentPid || 0);
    if (!byParent.has(parentPid)) byParent.set(parentPid, []);
    byParent.get(parentPid).push(proc.pid);
  }

  const descendants = new Set();
  const queue = [...seedPids];
  while (queue.length > 0) {
    const current = queue.shift();
    const children = byParent.get(current) || [];
    for (const childPid of children) {
      if (descendants.has(childPid) || seedPids.has(childPid)) continue;
      descendants.add(childPid);
      queue.push(childPid);
    }
  }
  return descendants;
}

function killPid(pid) {
  const result = spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], {
    encoding: 'utf8',
  });
  const text = `${result.stdout || ''}\n${result.stderr || ''}`;
  const ok = (result.status ?? 1) === 0 || /not found|no running instance/i.test(text);
  return {
    pid,
    ok,
    status: result.status ?? null,
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim(),
  };
}

export function cleanupOwnedDesktopProcesses(options = {}) {
  if (process.platform !== 'win32') {
    return {
      ok: true,
      platform: process.platform,
      message: 'No-op: cleanup-owned-processes currently targets Windows only.',
      roots: [],
      targetedPids: [],
      killed: [],
      failed: [],
    };
  }

  const { installState, roots } = buildKnownRoots(options);
  const processList = getWindowsProcessList();
  const rootOwned = processList
    .filter((proc) => processOwnedByKnownRoots(proc, roots))
    .map((proc) => proc.pid);
  const rootOwnedSet = new Set(rootOwned);
  const descendants = collectDescendantPids(rootOwnedSet, processList);
  const targetedPids = [...new Set([...rootOwnedSet, ...descendants])].sort((a, b) => b - a);

  const killed = [];
  const failed = [];
  for (const pid of targetedPids) {
    const outcome = killPid(pid);
    if (outcome.ok) {
      killed.push(outcome);
    } else {
      failed.push(outcome);
    }
  }

  const ok = failed.length === 0 || options.failOnKillError !== true;
  return {
    ok,
    platform: process.platform,
    roots,
    installState,
    processCount: processList.length,
    rootOwnedPids: [...rootOwnedSet].sort((a, b) => a - b),
    descendantPids: [...descendants].sort((a, b) => a - b),
    targetedPids,
    killed,
    failed,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = cleanupOwnedDesktopProcesses(parseArgs());
  // eslint-disable-next-line no-console
  console.log(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.ok ? 0 : 1;
}

