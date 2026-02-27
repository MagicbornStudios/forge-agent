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
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: options.shell === true,
    maxBuffer: 100 * 1024 * 1024,
  });
  const stdoutText = result.stdout ? String(result.stdout) : '';
  const stderrText = result.stderr ? String(result.stderr) : '';
  if (stdoutText) process.stdout.write(stdoutText);
  if (stderrText) process.stderr.write(stderrText);
  if (result.error) {
    throw new Error(`Command failed (${command} ${args.join(' ')}): ${result.error.message}`);
  }
  const ok = (result.status ?? 1) === 0;
  const commandResult = {
    ok,
    code: result.status ?? 1,
    signal: result.signal ?? null,
    errorMessage: result.error ? String(result.error.message || result.error) : null,
    command,
    args,
    stdoutTail: stdoutText.slice(-8000),
    stderrTail: stderrText.slice(-8000),
  };
  if (!ok && options.allowFailure !== true) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
  return commandResult;
}

async function copyDir(source, target) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, {
    recursive: true,
    // Windows packaging environments can struggle with symlink copying.
    // Linux/macOS standalone traces are safer to preserve as-is.
    dereference: process.platform === 'win32',
  });
}

function resolveDesktopBuildRoot() {
  const thisFile = fileURLToPath(import.meta.url);
  const packageRoot = path.resolve(path.dirname(thisFile), '..', '..');
  return path.join(packageRoot, '.desktop-build');
}

function parseDesktopBuildArgs(argv = process.argv.slice(2)) {
  return {
    requireStandalone: argv.includes('--require-standalone'),
  };
}

function appendNodeRequireOption(existingNodeOptions, modulePath) {
  const normalizedPath = modulePath.replace(/\\/g, '/');
  const requireOption = `--require=${normalizedPath}`;
  const existing = String(existingNodeOptions || '').trim();
  if (!existing) return requireOption;
  if (existing.includes(requireOption) || existing.includes(normalizedPath)) return existing;
  return `${existing} ${requireOption}`;
}

export async function runDesktopBuild(options = {}) {
  const requireStandalone = options.requireStandalone === true;
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const standalone = resolveRepoStudioStandaloneServer(workspaceRoot);
  const appRoot = standalone.appRoot;
  const standaloneSymlinkFallbackPatch = path.join(appRoot, 'scripts', 'standalone-symlink-fallback.cjs');
  const standaloneBuildEnv = {
    REPO_STUDIO_STANDALONE: '1',
    REPO_STUDIO_OUTPUT_FILE_TRACING_ROOT: workspaceRoot,
  };
  const standaloneNextBuildEnv = { ...standaloneBuildEnv };
  if (fsSync.existsSync(standaloneSymlinkFallbackPatch)) {
    standaloneNextBuildEnv.NODE_OPTIONS = appendNodeRequireOption(
      process.env.NODE_OPTIONS,
      standaloneSymlinkFallbackPatch,
    );
  }

  const standaloneCodegen = run('pnpm', ['--filter', '@forge/repo-studio-app', 'run', 'codegen'], {
    cwd: workspaceRoot,
    shell: process.platform === 'win32',
    allowFailure: true,
  });
  const standaloneBuild = standaloneCodegen.ok
    ? run('pnpm', ['--filter', '@forge/repo-studio-app', 'exec', 'next', 'build'], {
        cwd: workspaceRoot,
        env: standaloneNextBuildEnv,
        shell: process.platform === 'win32',
        allowFailure: true,
      })
    : standaloneCodegen;
  const standaloneBuildPhase = standaloneCodegen.ok ? 'next-build' : 'codegen';

  const buildRoot = resolveDesktopBuildRoot();
  const resolved = resolveRepoStudioStandaloneServer(workspaceRoot);
  const standaloneSucceeded = standaloneBuild.ok && Boolean(resolved.resolved);

  if (!standaloneSucceeded) {
    if (requireStandalone) {
      const candidateStatuses = resolved.candidates
        .map((candidatePath) => `${candidatePath}:${fsSync.existsSync(candidatePath) ? 'present' : 'missing'}`)
        .join(', ');
      const diagnosticsPath = path.join(buildRoot, 'failure-diagnostics.json');
      await fs.mkdir(buildRoot, { recursive: true });
      await fs.writeFile(
        diagnosticsPath,
        `${JSON.stringify(
          {
            builtAt: new Date().toISOString(),
            workspaceRoot,
            appRoot,
            requireStandalone,
            standaloneBuild,
            standaloneBuildPhase,
            resolvedStandalone: resolved.resolved,
            standaloneCandidates: resolved.candidates.map((candidatePath) => ({
              path: candidatePath,
              exists: fsSync.existsSync(candidatePath),
            })),
          },
          null,
          2,
        )}\n`,
        'utf8',
      );
      throw new Error(
        [
          'Standalone build unavailable and --require-standalone was set. Refusing fallback packaging mode.',
          `buildExit=${standaloneBuild.code}`,
          `buildSignal=${standaloneBuild.signal ?? 'none'}`,
          `buildError=${standaloneBuild.errorMessage ?? 'none'}`,
          `buildPhase=${standaloneBuildPhase}`,
          `resolvedStandalone=${resolved.resolved ?? 'none'}`,
          `diagnosticsPath=${diagnosticsPath}`,
          `standaloneCandidates=${candidateStatuses}`,
        ].join(' '),
      );
    }

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
  const buildIdSource = path.join(appRoot, '.next', 'BUILD_ID');
  const buildIdTarget = path.join(buildRoot, 'next', 'BUILD_ID');
  const publicSource = path.join(appRoot, 'public');
  const publicTarget = path.join(buildRoot, 'next', 'public');

  await fs.rm(buildRoot, { recursive: true, force: true });
  await copyDir(path.dirname(resolved.resolved), standaloneTarget);
  await copyDir(staticSource, staticTarget);
  await fs.copyFile(buildIdSource, buildIdTarget);
  await copyDir(publicSource, publicTarget).catch(() => {});

  const manifest = {
    builtAt: new Date().toISOString(),
    workspaceRoot,
    appRoot,
    standaloneServer: resolved.resolved,
    copied: {
      standaloneTarget,
      staticTarget,
      buildIdTarget,
      publicTarget,
    },
  };
  await fs.writeFile(path.join(buildRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  // eslint-disable-next-line no-console
  console.log(`RepoStudio desktop build prepared at ${buildRoot}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runDesktopBuild(parseDesktopBuildArgs()).catch((error) => {
    // eslint-disable-next-line no-console
    console.error(`repo-studio desktop build failed: ${error.message}`);
    process.exitCode = 1;
  });
}
