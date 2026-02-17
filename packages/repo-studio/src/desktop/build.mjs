import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { resolveRepoStudioStandaloneServer } from './next-server.mjs';

function findWorkspaceRoot(start = process.cwd()) {
  let current = path.resolve(start);
  for (let depth = 0; depth < 6; depth += 1) {
    const workspaceFile = path.join(current, 'pnpm-workspace.yaml');
    if (fsSync.existsSync(workspaceFile)) return current;
    const parent = path.resolve(current, '..');
    if (parent === current) break;
    current = parent;
  }
  return path.resolve(start);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    env: {
      ...process.env,
      ...(options.env || {}),
    },
    stdio: 'inherit',
    shell: options.shell === true,
  });
  const ok = (result.status ?? 1) === 0;
  if (!ok && options.allowFailure !== true) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
  return {
    ok,
    code: result.status ?? 1,
  };
}

async function copyDir(source, target) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true });
}

function resolveDesktopBuildRoot() {
  const thisFile = fileURLToPath(import.meta.url);
  const packageRoot = path.resolve(path.dirname(thisFile), '..', '..');
  return path.join(packageRoot, '.desktop-build');
}

export async function runDesktopBuild() {
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const standalone = resolveRepoStudioStandaloneServer(workspaceRoot);
  const appRoot = standalone.appRoot;

  const standaloneBuild = run('pnpm', ['--filter', '@forge/repo-studio-app', 'build'], {
    cwd: workspaceRoot,
    env: {
      REPO_STUDIO_STANDALONE: '1',
    },
    shell: process.platform === 'win32',
    allowFailure: true,
  });

  const buildRoot = resolveDesktopBuildRoot();
  const resolved = resolveRepoStudioStandaloneServer(workspaceRoot);
  const standaloneSucceeded = standaloneBuild.ok && Boolean(resolved.resolved);

  if (!standaloneSucceeded) {
    // eslint-disable-next-line no-console
    console.warn('Standalone build unavailable (likely Windows symlink permissions). Falling back to standard app build.');
    run('pnpm', ['--filter', '@forge/repo-studio-app', 'build'], {
      cwd: workspaceRoot,
      shell: process.platform === 'win32',
    });
    await fs.rm(buildRoot, { recursive: true, force: true });
    await fs.mkdir(buildRoot, { recursive: true });
    const fallbackManifest = {
      builtAt: new Date().toISOString(),
      workspaceRoot,
      appRoot,
      standaloneServer: null,
      fallbackMode: 'dev-only',
      message: 'Standalone output unavailable. Use desktop-dev mode for local desktop runtime.',
    };
    await fs.writeFile(path.join(buildRoot, 'manifest.json'), `${JSON.stringify(fallbackManifest, null, 2)}\n`, 'utf8');
    // eslint-disable-next-line no-console
    console.log(`RepoStudio desktop build prepared (fallback) at ${buildRoot}`);
    return;
  }

  const standaloneTarget = path.join(buildRoot, 'next', 'standalone');
  const staticSource = path.join(appRoot, '.next', 'static');
  const staticTarget = path.join(buildRoot, 'next', 'static');
  const publicSource = path.join(appRoot, 'public');
  const publicTarget = path.join(buildRoot, 'next', 'public');

  await fs.rm(buildRoot, { recursive: true, force: true });
  await copyDir(path.dirname(resolved.resolved), standaloneTarget);
  await copyDir(staticSource, staticTarget);
  await copyDir(publicSource, publicTarget).catch(() => {});

  const manifest = {
    builtAt: new Date().toISOString(),
    workspaceRoot,
    appRoot,
    standaloneServer: resolved.resolved,
    copied: {
      standaloneTarget,
      staticTarget,
      publicTarget,
    },
  };
  await fs.writeFile(path.join(buildRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`RepoStudio desktop build prepared at ${buildRoot}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runDesktopBuild().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(`repo-studio desktop build failed: ${error.message}`);
    process.exitCode = 1;
  });
}
