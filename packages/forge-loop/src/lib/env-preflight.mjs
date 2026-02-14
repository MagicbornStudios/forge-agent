import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { getEnvSettings } from './config.mjs';
import { runCommand } from './git.mjs';

function splitCommand(commandText) {
  const tokens = String(commandText || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return tokens.length > 0 ? tokens : ['forge-env'];
}

function runEnvCommand(cwd, commandText, subArgs) {
  const tokens = splitCommand(commandText);
  const [command, ...baseArgs] = tokens;
  const result = runCommand(cwd, command, [...baseArgs, ...subArgs]);

  if (result.ok || command !== 'forge-env') {
    return result;
  }

  const pnpmFallback = process.platform === 'win32'
    ? runCommand(cwd, 'cmd.exe', ['/d', '/s', '/c', ['pnpm', 'forge-env', ...subArgs].join(' ')])
    : runCommand(cwd, 'pnpm', ['forge-env', ...subArgs]);
  return pnpmFallback;
}

function isInteractiveTerminal() {
  return process.stdin.isTTY && process.stdout.isTTY;
}

function launchDetached(command, args, shell = false) {
  try {
    const child = spawn(command, args, {
      stdio: 'ignore',
      detached: true,
      shell,
    });
    child.on('error', () => {});
    child.unref();
  } catch {
    // Best-effort launcher; doctor/portal fallback still enforces readiness.
  }
}

function tryLaunchRepoStudio(profile) {
  const baseArgs = ['open', '--view', 'env', '--mode', 'headless', '--profile', profile];
  const localCliPath = path.join(process.cwd(), 'packages', 'repo-studio', 'src', 'cli.mjs');

  if (fs.existsSync(localCliPath)) {
    launchDetached('node', [localCliPath, ...baseArgs], false);
    return true;
  }

  if (process.platform === 'win32') {
    launchDetached('cmd.exe', ['/d', '/s', '/c', ['pnpm', 'forge-repo-studio', ...baseArgs].join(' ')], false);
  } else {
    launchDetached('pnpm', ['forge-repo-studio', ...baseArgs], false);
  }
  return true;
}

export function shouldRunHeadlessEnvGate(config, options = {}) {
  const env = getEnvSettings(config);
  if (!env.enabled) return false;
  if (options.headless !== true) return false;
  return env.enforceHeadless === true;
}

export function ensureHeadlessEnvReady(config, options = {}) {
  const env = getEnvSettings(config);
  if (!env.enabled) {
    return {
      checked: false,
      reason: 'env-disabled',
      details: 'Environment checks disabled in .planning/config.json',
    };
  }

  const baseArgs = ['doctor', '--mode', 'headless', '--profile', env.profile];
  if (env.runner) {
    baseArgs.push('--runner', env.runner);
  }
  if (options.strict !== false) {
    baseArgs.push('--strict');
  }
  if (options.json === true) {
    baseArgs.push('--json');
  }

  let doctor = runEnvCommand(process.cwd(), env.command, baseArgs);
  if (doctor.ok) {
    return {
      checked: true,
      recovered: false,
      envProfile: env.profile,
      command: doctor.command,
      stdout: doctor.stdout,
      stderr: doctor.stderr,
    };
  }

  const canAutoLaunchPortal = (
    options.autoLaunchPortal !== false
    && env.autoLaunchPortal === true
    && isInteractiveTerminal()
  );

  if (canAutoLaunchPortal) {
    const launchedRepoStudio = tryLaunchRepoStudio(env.profile);
    const portal = runEnvCommand(
      process.cwd(),
      env.command,
      ['portal', '--mode', 'headless', '--profile', env.profile, '--bootstrap'],
    );

    if (!portal.ok) {
      throw new Error(
        `Headless env preflight failed and env portal could not start. Command: ${portal.command}\n${portal.stderr || portal.stdout || 'No output from portal command.'}`,
      );
    }

    doctor = runEnvCommand(process.cwd(), env.command, baseArgs);
    if (doctor.ok) {
      return {
        checked: true,
        recovered: true,
        launchedRepoStudio,
        envProfile: env.profile,
        command: doctor.command,
        stdout: doctor.stdout,
        stderr: doctor.stderr,
      };
    }
  }

  throw new Error(
    `Headless env preflight failed. Command: ${doctor.command}\n${doctor.stderr || doctor.stdout || 'No output from env doctor.'}\nRun: forge-repo-studio open --view env --mode headless --profile ${env.profile}\nFallback: ${env.command} portal --mode headless --profile ${env.profile}`,
  );
}
