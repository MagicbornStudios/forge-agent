import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_MAX_BUFFER = 20 * 1024 * 1024;

function normalizeText(value) {
  return String(value || '').replace(/\\/g, '/').toLowerCase();
}

function normalizeRepoRoot(value) {
  return normalizeText(path.resolve(String(value || process.cwd())));
}

function normalizeKnownPorts(ports) {
  const input = Array.isArray(ports) ? ports : [];
  return [...new Set(input.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))].sort((a, b) => a - b);
}

function normalizeSnapshotRecord(value) {
  if (!value || typeof value !== 'object') return null;
  const record = value;
  const pid = Number(
    record.pid
    ?? record.PID
    ?? record.ProcessId
    ?? record.processId
    ?? 0,
  );
  if (!Number.isInteger(pid) || pid <= 0) return null;
  const parentPid = Number(
    record.parentPid
    ?? record.ParentProcessId
    ?? record.parentProcessId
    ?? record.PPID
    ?? record.ppid
    ?? 0,
  );
  const name = String(record.name || record.Name || record.comm || record.processName || '').trim();
  const commandLine = String(record.commandLine || record.CommandLine || record.args || record.command || '').trim();
  return {
    pid,
    parentPid: Number.isInteger(parentPid) && parentPid > 0 ? parentPid : 0,
    name,
    commandLine,
  };
}

function parseNetstatPid(line, port) {
  const text = String(line || '').trim();
  if (!text || !/LISTENING/i.test(text)) return null;
  const pattern = new RegExp(`[:.]${port}\\s+`);
  if (!pattern.test(text)) return null;
  const columns = text.split(/\s+/);
  const pid = Number(columns[columns.length - 1] || 0);
  if (!Number.isInteger(pid) || pid <= 0) return null;
  return pid;
}

function defaultPidByPortResolver(port) {
  const numeric = Number(port);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;

  if (process.platform === 'win32') {
    const netstat = spawnSync('netstat', ['-ano', '-p', 'tcp'], {
      encoding: 'utf8',
      maxBuffer: DEFAULT_MAX_BUFFER,
    });
    const lines = String(netstat.stdout || '').split(/\r?\n/);
    for (const line of lines) {
      const pid = parseNetstatPid(line, numeric);
      if (pid) return pid;
    }
    return null;
  }

  const lsof = spawnSync('lsof', ['-nP', `-iTCP:${numeric}`, '-sTCP:LISTEN', '-t'], {
    encoding: 'utf8',
    maxBuffer: DEFAULT_MAX_BUFFER,
  });
  const pid = Number(String(lsof.stdout || '').trim().split(/\s+/)[0] || 0);
  return Number.isInteger(pid) && pid > 0 ? pid : null;
}

export function parseWindowsProcessSnapshot(raw) {
  const text = String(raw || '').trim();
  if (!text) return [];
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : [parsed];
  return list.map((item) => normalizeSnapshotRecord(item)).filter(Boolean);
}

export function parsePosixProcessSnapshot(raw) {
  const lines = String(raw || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const records = [];
  for (const line of lines) {
    const ppidMatch = /^(\d+)\s+(\d+)\s+(\S+)\s*(.*)$/.exec(line);
    if (ppidMatch) {
      const pid = Number(ppidMatch[1]);
      const parentPid = Number(ppidMatch[2]);
      if (!Number.isInteger(pid) || pid <= 0) continue;
      records.push({
        pid,
        parentPid: Number.isInteger(parentPid) && parentPid > 0 ? parentPid : 0,
        name: String(ppidMatch[3] || '').trim(),
        commandLine: String(ppidMatch[4] || '').trim(),
      });
      continue;
    }

    const match = /^(\d+)\s+(\S+)\s*(.*)$/.exec(line);
    if (!match) continue;
    const pid = Number(match[1]);
    if (!Number.isInteger(pid) || pid <= 0) continue;
    records.push({
      pid,
      parentPid: 0,
      name: String(match[2] || '').trim(),
      commandLine: String(match[3] || '').trim(),
    });
  }
  return records;
}

function collectWindowsProcessSnapshot() {
  const script = "$ErrorActionPreference = 'Stop'; Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Depth 3 -Compress";
  const result = spawnSync('powershell', ['-NoProfile', '-Command', script], {
    encoding: 'utf8',
    maxBuffer: DEFAULT_MAX_BUFFER,
  });
  if ((result.status ?? 1) !== 0) {
    return {
      ok: false,
      records: [],
      stderr: String(result.stderr || '').trim(),
      stdout: String(result.stdout || '').trim(),
    };
  }
  try {
    return {
      ok: true,
      records: parseWindowsProcessSnapshot(result.stdout),
      stderr: '',
      stdout: '',
    };
  } catch (error) {
    return {
      ok: false,
      records: [],
      stderr: String(error?.message || error),
      stdout: String(result.stdout || '').trim(),
    };
  }
}

function collectPosixProcessSnapshot() {
  const result = spawnSync('ps', ['-axo', 'pid=,ppid=,comm=,args='], {
    encoding: 'utf8',
    maxBuffer: DEFAULT_MAX_BUFFER,
  });
  if ((result.status ?? 1) !== 0) {
    return {
      ok: false,
      records: [],
      stderr: String(result.stderr || '').trim(),
      stdout: String(result.stdout || '').trim(),
    };
  }
  return {
    ok: true,
    records: parsePosixProcessSnapshot(result.stdout),
    stderr: '',
    stdout: '',
  };
}

export function collectProcessSnapshot(options = {}) {
  if (Array.isArray(options.processes)) {
    return {
      ok: true,
      records: options.processes.map((item) => normalizeSnapshotRecord(item)).filter(Boolean),
      stderr: '',
      stdout: '',
      source: 'provided',
    };
  }

  const platform = options.platform || process.platform;
  const collected = platform === 'win32'
    ? collectWindowsProcessSnapshot()
    : collectPosixProcessSnapshot();
  return {
    ...collected,
    source: platform === 'win32' ? 'windows' : 'posix',
  };
}

function dedupeKnownPorts(existing = [], extra = []) {
  return [...new Set([...(Array.isArray(existing) ? existing : []), ...(Array.isArray(extra) ? extra : [])])]
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0)
    .sort((a, b) => a - b);
}

function buildPortMap(knownPorts, pidByPortResolver) {
  const map = new Map();
  const resolvePid = typeof pidByPortResolver === 'function'
    ? pidByPortResolver
    : defaultPidByPortResolver;
  for (const port of normalizeKnownPorts(knownPorts)) {
    let pid = null;
    try {
      pid = Number(resolvePid(port));
    } catch {
      pid = null;
    }
    if (!Number.isInteger(pid) || pid <= 0) continue;
    const existing = map.get(pid) || [];
    map.set(pid, dedupeKnownPorts(existing, [port]));
  }
  return map;
}

function isRepoStudioOwned(commandLineNormalized, repoRootNormalized) {
  if (!commandLineNormalized || !repoRootNormalized) return false;
  const markers = [
    `${repoRootNormalized}/apps/repo-studio`,
    `${repoRootNormalized}/packages/repo-studio`,
    `${repoRootNormalized}/.repo-studio`,
    `${repoRootNormalized}/node_modules/.pnpm/@openai+codex`,
    `${repoRootNormalized}/node_modules/@openai/codex`,
  ];
  return markers.some((marker) => commandLineNormalized.includes(marker));
}

function mergeDuplicateRecords(records = []) {
  const byPid = new Map();
  for (const record of records) {
    const existing = byPid.get(record.pid);
    if (!existing) {
      byPid.set(record.pid, {
        ...record,
        parentPid: Number(record.parentPid || 0),
        knownPorts: dedupeKnownPorts(record.knownPorts, []),
      });
      continue;
    }
    byPid.set(record.pid, {
      ...existing,
      parentPid: Number(existing.parentPid || 0) > 0
        ? Number(existing.parentPid || 0)
        : Number(record.parentPid || 0),
      name: existing.name || record.name,
      commandLine: existing.commandLine.length >= record.commandLine.length
        ? existing.commandLine
        : record.commandLine,
      knownPorts: dedupeKnownPorts(existing.knownPorts, record.knownPorts),
    });
  }
  return [...byPid.values()].sort((a, b) => a.pid - b.pid);
}

export function buildProcessInventory(options = {}) {
  const repoRoot = path.resolve(String(options.repoRoot || process.cwd()));
  const repoRootNormalized = normalizeRepoRoot(repoRoot);
  const knownPorts = normalizeKnownPorts(options.knownPorts);
  const snapshot = collectProcessSnapshot(options);
  const portMap = buildPortMap(knownPorts, options.pidByPortResolver);

  const records = snapshot.records.map((base) => {
    const commandLine = String(base.commandLine || '').trim();
    const normalizedCommandLine = normalizeText(commandLine);
    const repoOwned = normalizedCommandLine.includes(repoRootNormalized);
    const repoStudioOwned = repoOwned && isRepoStudioOwned(normalizedCommandLine, repoRootNormalized);
    return {
      pid: base.pid,
      parentPid: Number(base.parentPid || 0),
      name: String(base.name || '').trim(),
      commandLine,
      repoOwned,
      repoStudioOwned,
      knownPorts: dedupeKnownPorts(base.knownPorts, portMap.get(base.pid) || []),
    };
  });

  return {
    ok: snapshot.ok,
    repoRoot,
    source: snapshot.source,
    error: snapshot.ok ? null : (snapshot.stderr || 'Failed to collect process snapshot.'),
    processes: mergeDuplicateRecords(records),
  };
}

export function findInventoryProcessByPid(inventory, pid) {
  const numeric = Number(pid);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;
  const list = Array.isArray(inventory?.processes) ? inventory.processes : [];
  return list.find((item) => Number(item.pid) === numeric) || null;
}
