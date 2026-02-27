import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function existsAsFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function existsAsDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

function resolveDesktopBuildRoot() {
  const thisFile = fileURLToPath(import.meta.url);
  const packageRoot = path.resolve(path.dirname(thisFile), '..', '..');
  return path.join(packageRoot, '.desktop-build');
}

function formatMissing(missingPaths) {
  return missingPaths.map((missingPath) => ` - ${missingPath}`).join('\n');
}

export function verifyDesktopStandaloneBundle() {
  const buildRoot = resolveDesktopBuildRoot();
  const nextRoot = path.join(buildRoot, 'next');
  const buildIdPath = path.join(nextRoot, 'BUILD_ID');
  const staticPath = path.join(nextRoot, 'static');
  const standaloneRoot = path.join(nextRoot, 'standalone');
  const standaloneServerCandidates = [
    path.join(standaloneRoot, 'server.js'),
    path.join(standaloneRoot, 'apps', 'repo-studio', 'server.js'),
  ];

  const missing = [];
  if (!existsAsFile(buildIdPath)) missing.push(buildIdPath);
  if (!existsAsDirectory(staticPath)) missing.push(staticPath);
  if (!existsAsDirectory(standaloneRoot)) missing.push(standaloneRoot);
  if (!standaloneServerCandidates.some((candidate) => existsAsFile(candidate))) {
    missing.push(...standaloneServerCandidates);
  }

  if (missing.length > 0) {
    throw new Error(
      [
        'RepoStudio desktop standalone bundle verification failed.',
        'Missing required assets:',
        formatMissing(missing),
      ].join('\n'),
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    [
      '[repo-studio:desktop] standalone bundle verified',
      `BUILD_ID: ${buildIdPath}`,
      `static: ${staticPath}`,
      `server: ${standaloneServerCandidates.find((candidate) => existsAsFile(candidate))}`,
    ].join('\n'),
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    verifyDesktopStandaloneBundle();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
