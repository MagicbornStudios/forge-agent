#!/usr/bin/env node

import { fileURLToPath } from 'node:url';

import { parseArgs } from './lib/constants.mjs';
import { runInit } from './commands/init.mjs';
import { runDoctor } from './commands/doctor.mjs';
import { runPortal } from './commands/portal.mjs';
import { runDiff, runReconcile, runSyncExamples } from './commands/reconcile.mjs';

function printUsage() {
  console.log(`forge-env v1.0\n\nUsage:\n  forge-env <command> [options]\n\nCommands:\n  init [--profile forge-agent|forge-loop|custom] [--force]\n  doctor [--profile ...] [--app <target>] [--mode local|preview|production|headless] [--runner codex|openrouter|custom] [--strict] [--bootstrap] [--json]\n  portal [--profile ...] [--app <target>] [--mode local|preview|production|headless] [--bootstrap] [--legacy-portal]\n  reconcile [--profile ...] [--app <target>] [--write] [--sync-examples] [--mode ...] [--strict] [--json]\n  diff [--profile ...] [--app <target>] [--mode ...] [--json]\n  sync-examples [--profile ...] [--app <target>] [--write] [--mode ...] [--json]\n`);
}

function printResult(result, asJson, stream = 'stdout') {
  const write = (message) => {
    if (stream === 'stderr') {
      console.error(message);
    } else {
      console.log(message);
    }
  };

  if (!result) return;

  if (asJson) {
    write(JSON.stringify(result, null, 2));
    return;
  }

  if (result.warning) {
    console.warn(result.warning);
  }

  if (result.aliasWarning) {
    console.warn(result.aliasWarning);
  }

  if (result.message) {
    write(result.message);
  }

  if (result.path) {
    write(`config: ${result.path}`);
  }

  if (result.report) {
    write(result.report);
  }

  if (result.url) {
    write(`portal: ${result.url}`);
  }

  if (result.pid) {
    write(`pid: ${result.pid}`);
  }

  if (result.runtimeMode) {
    write(`runtime: ${result.runtimeMode}`);
  }
}

export async function runForgeEnvCli(argv = process.argv.slice(2)) {
  const command = argv[0];

  if (!command || ['-h', '--help', 'help'].includes(command)) {
    printUsage();
    return { exitCode: 0 };
  }

  const { flags } = parseArgs(argv.slice(1));
  const asJson = flags.has('json');

  let result;
  switch (command) {
    case 'init':
      result = await runInit({
        profile: flags.get('profile'),
        force: flags.has('force'),
      });
      break;
    case 'doctor':
      result = await runDoctor({
        profile: flags.get('profile'),
        app: flags.get('app'),
        mode: flags.get('mode') || 'local',
        runner: flags.get('runner'),
        strict: flags.has('strict'),
        bootstrap: flags.has('bootstrap'),
      });
      break;
    case 'portal':
      result = await runPortal({
        profile: flags.get('profile'),
        app: flags.get('app'),
        mode: flags.get('mode') || 'local',
        bootstrap: flags.has('bootstrap'),
        legacyPortal: flags.has('legacy-portal'),
        port: flags.get('port'),
        openBrowser: true,
      });
      break;
    case 'reconcile':
      result = await runReconcile({
        profile: flags.get('profile'),
        app: flags.get('app'),
        mode: flags.get('mode') || 'local',
        write: flags.has('write'),
        syncExamples: flags.has('sync-examples'),
        strict: flags.has('strict'),
      });
      break;
    case 'diff':
      result = await runDiff({
        profile: flags.get('profile'),
        app: flags.get('app'),
        mode: flags.get('mode') || 'local',
      });
      break;
    case 'sync-examples':
      result = await runSyncExamples({
        profile: flags.get('profile'),
        app: flags.get('app'),
        mode: flags.get('mode') || 'local',
        write: flags.has('write'),
      });
      break;
    default:
      throw new Error(`Unknown forge-env command: ${command}`);
  }

  printResult(result, asJson, command === 'portal' ? 'stderr' : 'stdout');
  return { exitCode: result?.ok === false ? 1 : 0 };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runForgeEnvCli().then((result) => {
    process.exitCode = result.exitCode;
  }).catch((error) => {
    console.error(`forge-env error: ${error.message}`);
    process.exitCode = 1;
  });
}

