import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

function normalizePath(input) {
  return path.resolve(String(input || '')).replace(/[\\/]+$/, '');
}

function uniqueExistingDirectories(candidates = []) {
  const seen = new Set();
  const list = [];
  for (const item of candidates) {
    if (!item) continue;
    const normalized = normalizePath(item);
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    list.push(normalized);
  }
  return list;
}

export function resolveLocalProgramsRoot() {
  return process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Programs')
    : null;
}

export function resolveSmokeInstallDirectories() {
  const tempRoot = process.env.TEMP || process.env.TMP || os.tmpdir();
  return uniqueExistingDirectories([
    path.join(tempRoot, 'RepoStudioSilentInstallSmoke'),
    path.join(tempRoot, 'RepoStudioInstallSmoke'),
  ]);
}

export function resolveKnownInstallDirectories(options = {}) {
  const localPrograms = resolveLocalProgramsRoot();
  const explicitInstallDir = String(options.installDir || '').trim();
  const registryInstallDir = options.registryInstallDir
    ? String(options.registryInstallDir).trim()
    : getActualInstallLocation();
  const candidates = [
    explicitInstallDir || null,
    registryInstallDir || null,
    ...resolveSmokeInstallDirectories(),
    ...(localPrograms ? [
      path.join(localPrograms, 'RepoStudio'),
      path.join(localPrograms, '@forgerepo-studio'),
    ] : []),
  ];
  return uniqueExistingDirectories(candidates);
}

export function resolveInstalledExeCandidates(installDir = '', options = {}) {
  const localPrograms = resolveLocalProgramsRoot();
  const explicitExe = String(options.explicitExePath || '').trim();
  const candidates = [
    explicitExe || null,
    ...(installDir ? [path.join(installDir, 'RepoStudio.exe')] : []),
    ...(localPrograms ? [
      path.join(localPrograms, 'RepoStudio', 'RepoStudio.exe'),
      path.join(localPrograms, '@forgerepo-studio', 'RepoStudio.exe'),
    ] : []),
    ...resolveSmokeInstallDirectories().map((dirPath) => path.join(dirPath, 'RepoStudio.exe')),
  ];
  const deduped = [];
  const seen = new Set();
  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizePath(candidate);
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(normalized);
  }
  return deduped;
}

export function firstExistingPath(paths = []) {
  for (const candidate of paths) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function getActualInstallLocation() {
  if (process.platform !== 'win32') return null;
  try {
    const script = [
      "Get-ChildItem 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' -ErrorAction SilentlyContinue |",
      "ForEach-Object { $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue;",
      "if ($p.DisplayName -eq 'RepoStudio' -and $p.InstallLocation) { $p.InstallLocation.TrimEnd([char]0x5C) } } |",
      'Select-Object -First 1',
    ].join(' ');
    const out = execSync(`powershell -NoProfile -Command "${script}"`, {
      encoding: 'utf8',
      timeout: 5000,
    });
    const installDir = String(out || '').trim();
    if (!installDir) return null;
    return normalizePath(installDir);
  } catch {
    return null;
  }
}

export function resolveInstalledExePath(options = {}) {
  const explicitExePath = String(options.explicitExePath || '').trim();
  const explicitInstallDir = String(options.installDir || '').trim();
  const registryInstallDir = options.registryInstallDir
    ? String(options.registryInstallDir).trim()
    : getActualInstallLocation();
  const candidates = resolveInstalledExeCandidates(explicitInstallDir, {
    explicitExePath,
  });
  if (registryInstallDir) {
    candidates.push(path.join(registryInstallDir, 'RepoStudio.exe'));
  }
  const existing = firstExistingPath(candidates);
  if (!existing) return null;
  return normalizePath(existing);
}

export function resolveCurrentInstallState(options = {}) {
  const registryInstallDir = getActualInstallLocation();
  const directories = resolveKnownInstallDirectories({
    installDir: options.installDir,
    registryInstallDir,
  });
  const installs = directories.map((installDir) => {
    const exePath = path.join(installDir, 'RepoStudio.exe');
    const uninstallPath = path.join(installDir, 'Uninstall RepoStudio.exe');
    return {
      installDir,
      source: registryInstallDir && installDir.toLowerCase() === registryInstallDir.toLowerCase()
        ? 'registry'
        : 'candidate',
      exePath,
      uninstallPath,
      exeExists: fs.existsSync(exePath),
      uninstallExists: fs.existsSync(uninstallPath),
      dirExists: fs.existsSync(installDir),
    };
  });
  const primary = installs.find((item) => item.exeExists) || installs.find((item) => item.uninstallExists) || installs[0] || null;
  return {
    registryInstallDir,
    installs,
    primary,
  };
}
