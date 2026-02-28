import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function resolvePackageRoot() {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), '..', '..');
}

function parseArgs(argv = process.argv.slice(2)) {
  return {
    resetDist: argv.includes('--reset-dist'),
    includeTemp: argv.includes('--include-temp'),
  };
}

async function safeRemove(targetPath) {
  try {
    await fs.rm(targetPath, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

function isDisposableDesktopFile(fileName, version) {
  if (!fileName) return false;

  if (
    fileName === 'builder-debug.yml'
    || fileName === 'builder-effective-config.yaml'
    || /^builder-.*\.ya?ml$/i.test(fileName)
  ) {
    return true;
  }
  if (fileName === 'err.txt' || fileName === 'err2.txt' || fileName === 'out.txt' || fileName === 'out2.txt') {
    return true;
  }
  if (fileName.endsWith('.nsis.7z')) return true;

  if (
    fileName === `RepoStudio ${version}.exe`
    || fileName === `RepoStudio Setup ${version}.exe`
    || fileName === `RepoStudio Setup ${version}.exe.blockmap`
    || fileName === `RepoStudio Silent Setup ${version}.exe`
    || fileName === `RepoStudio Silent Setup ${version}.exe.blockmap`
  ) {
    return false;
  }

  if (/^RepoStudio(?: Silent)? Setup .*\.exe(?:\.blockmap)?$/i.test(fileName)) {
    return true;
  }
  if (/^RepoStudio .*\.exe$/i.test(fileName)) {
    return true;
  }

  return false;
}

function isDisposableDesktopDirectory(directoryName) {
  if (!directoryName) return false;
  return /^win(?:-[\w-]+)?-unpacked$/i.test(directoryName);
}

function matchesTempCleanupName(name) {
  if (!name) return false;

  const exactNames = new Set([
    'repo-studio-app-unpacked',
    'repo-smoke.js',
    'repo-smoke-no-node-mode.js',
    'repo-installer-smoke.js',
    'repo-installer-only.js',
    'repo-silent-installer-smoke.js',
    'repo-studio-css.txt',
    'RepoStudioInstallSmoke',
    'RepoStudioSilentInstallSmoke',
    'RepoStudioInstallInspect',
  ]);

  if (exactNames.has(name)) return true;

  const prefixes = [
    'repo-studio-disabled-',
    'repo-studio-resolver-',
    'repo-studio-runtime-',
    'repo-studio-sqlite-',
    'repo-studio-test-',
    'repo-studio-watcher-',
  ];

  return prefixes.some((prefix) => name.startsWith(prefix));
}

async function cleanDesktopDist(packageRoot, version, resetDist) {
  const distRoot = path.join(packageRoot, 'dist', 'desktop');
  if (!fsSync.existsSync(distRoot)) {
    return { removed: [], freedBytes: 0 };
  }

  if (resetDist) {
    const size = await measurePathBytes(distRoot);
    const removed = await safeRemove(distRoot);
    return {
      removed: removed ? [distRoot] : [],
      freedBytes: removed ? size : 0,
    };
  }

  const entries = await fs.readdir(distRoot, { withFileTypes: true });
  const removed = [];
  let freedBytes = 0;

  for (const entry of entries) {
    const targetPath = path.join(distRoot, entry.name);
    const isDisposable = entry.isDirectory()
      ? isDisposableDesktopDirectory(entry.name)
      : entry.isFile()
        ? isDisposableDesktopFile(entry.name, version)
        : false;

    if (!isDisposable) continue;

    const pathBytes = await measurePathBytes(targetPath);
    if (await safeRemove(targetPath)) {
      removed.push(targetPath);
      freedBytes += pathBytes;
    }
  }

  return { removed, freedBytes };
}

async function cleanTempScratch() {
  const tempRoot = os.tmpdir();
  const entries = await fs.readdir(tempRoot, { withFileTypes: true }).catch(() => []);
  const removed = [];
  let freedBytes = 0;

  for (const entry of entries) {
    if (!matchesTempCleanupName(entry.name)) continue;
    const targetPath = path.join(tempRoot, entry.name);
    const pathBytes = await measurePathBytes(targetPath);
    if (await safeRemove(targetPath)) {
      removed.push(targetPath);
      freedBytes += pathBytes;
    }
  }

  return { removed, freedBytes };
}

async function measurePathBytes(targetPath) {
  const stat = await fs.lstat(targetPath).catch(() => null);
  if (!stat) return 0;

  if (!stat.isDirectory()) {
    return Number(stat.size || 0);
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true }).catch(() => []);
  let total = 0;

  for (const entry of entries) {
    total += await measurePathBytes(path.join(targetPath, entry.name));
  }

  return total;
}

export async function runDesktopCleanup(options = {}) {
  const packageRoot = resolvePackageRoot();
  const packageJsonPath = path.join(packageRoot, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  const version = String(packageJson.version || '').trim();

  const distResult = await cleanDesktopDist(packageRoot, version, options.resetDist === true);
  const tempResult = options.includeTemp === true
    ? await cleanTempScratch()
    : { removed: [], freedBytes: 0 };

  const totalRemoved = distResult.removed.length + tempResult.removed.length;
  const totalFreedBytes = distResult.freedBytes + tempResult.freedBytes;

  return {
    ok: true,
    version,
    totalRemoved,
    totalFreedBytes,
    dist: distResult,
    temp: tempResult,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runDesktopCleanup(parseArgs())
    .then((result) => {
      const freedMb = (Number(result.totalFreedBytes || 0) / (1024 * 1024)).toFixed(2);
      // eslint-disable-next-line no-console
      console.log(
        `RepoStudio desktop cleanup complete: removed ${result.totalRemoved} items, freed ~${freedMb} MB.`,
      );
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(`repo-studio desktop cleanup failed: ${error.message}`);
      process.exitCode = 1;
    });
}
