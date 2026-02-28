import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runInstallerSmoke } from './smoke-install.mjs';

const BREAK_TARGETS = [
  path.join('resources', 'next', 'BUILD_ID'),
  path.join('resources', 'app.asar'),
];

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

  return {
    kind: String(args.get('kind') || 'silent'),
    port: Number(args.get('port') || 3020),
    timeoutMs: Number(args.get('timeout-ms') || 720000),
    idleTimeoutMs: Number(args.get('idle-timeout-ms') || 300000),
    healthTimeoutMs: Number(args.get('health-timeout-ms') || 360000),
  };
}

function maybeWriteFailureArtifact(result, prefix = 'repostudio-upgrade-repair') {
  if (result.ok === true || process.env.CI !== 'true') {
    return { ...result, failureArtifactPath: null };
  }
  const runnerTemp = String(process.env.RUNNER_TEMP || '').trim();
  if (!runnerTemp) {
    return { ...result, failureArtifactPath: null };
  }
  const artifactPath = path.join(runnerTemp, `${prefix}-${Date.now()}.json`);
  return fs.writeFile(artifactPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
    .then(() => ({ ...result, failureArtifactPath: artifactPath }))
    .catch(() => ({ ...result, failureArtifactPath: null }));
}

async function breakInstalledRuntime(installDir) {
  const attempts = [];
  for (const relativePath of BREAK_TARGETS) {
    const targetPath = path.join(installDir, relativePath);
    try {
      await fs.unlink(targetPath);
      attempts.push({
        relativePath,
        targetPath,
        removed: true,
      });
      return {
        ok: true,
        attempts,
        removedPath: relativePath,
      };
    } catch (error) {
      attempts.push({
        relativePath,
        targetPath,
        removed: false,
        error: String(error?.message || error || 'unlink failed'),
      });
    }
  }
  return {
    ok: false,
    attempts,
    removedPath: null,
  };
}

export async function runUpgradeRepairSmoke(options = {}) {
  const baseOptions = {
    kind: options.kind || 'silent',
    timeoutMs: Number(options.timeoutMs || 720000),
    idleTimeoutMs: Number(options.idleTimeoutMs || 300000),
    healthTimeoutMs: Number(options.healthTimeoutMs || 360000),
    port: Number(options.port || 3020),
    launch: false,
    repairExisting: false,
  };

  const initial = await runInstallerSmoke(baseOptions);
  if (!initial.ok || !initial.effectiveInstallDir) {
    const failed = {
      ok: false,
      message: 'Initial install failed before upgrade-repair simulation.',
      initial,
      breakResult: null,
      repaired: null,
    };
    return maybeWriteFailureArtifact(failed);
  }

  const breakResult = await breakInstalledRuntime(initial.effectiveInstallDir);
  if (!breakResult.ok) {
    const failed = {
      ok: false,
      message: 'Failed to simulate broken install state before repair.',
      initial,
      breakResult,
      repaired: null,
    };
    return maybeWriteFailureArtifact(failed);
  }

  const repaired = await runInstallerSmoke({
    ...baseOptions,
    launch: true,
    repairExisting: true,
  });

  const result = {
    ok: repaired.ok === true,
    message: repaired.ok
      ? 'Upgrade-repair smoke passed.'
      : 'Upgrade-repair smoke failed during repair/install/launch.',
    initial,
    breakResult,
    repaired,
  };

  return maybeWriteFailureArtifact(result);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runUpgradeRepairSmoke(parseArgs())
    .then((result) => {
      // eslint-disable-next-line no-console
      console.log(`${JSON.stringify(result, null, 2)}\n`);
      process.exitCode = result.ok ? 0 : 1;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(`repo-studio upgrade-repair smoke failed: ${error.message}`);
      process.exitCode = 1;
    });
}

