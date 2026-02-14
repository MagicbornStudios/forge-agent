#!/usr/bin/env node

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { parseArgs } from './lib/args.mjs';
import { runOpen } from './commands/open.mjs';
import { runDoctor } from './commands/doctor.mjs';
import { runCommandById } from './commands/run.mjs';
import { runStop } from './commands/stop.mjs';
import { runStatus } from './commands/status.mjs';
import { runCommandsList } from './commands/commands-list.mjs';
import { runCommandsToggle } from './commands/commands-toggle.mjs';
import { runCommandsView } from './commands/commands-view.mjs';
import { runCodexStatus } from './commands/codex-status.mjs';
import { runCodexStart } from './commands/codex-start.mjs';
import { runCodexStop } from './commands/codex-stop.mjs';
import { runCodexExecCommand } from './commands/codex-exec.mjs';

function usage() {
  fs.writeSync(1, `forge-repo-studio v0.1

Usage:
  forge-repo-studio <command> [options]

Commands:
  open [--profile forge-agent|forge-loop|custom] [--mode local|preview|production|headless] [--view planning|env|commands|docs|loop-assistant|codex-assistant|diff] [--port <n>] [--app-runtime|--package-runtime] [--reuse|--no-reuse] [--detach|--foreground] [--legacy-ui]
  doctor
  commands-list
  commands-toggle <command-id> [--enable|--disable]
  commands-view [--query <text>] [--source <all|forge-builtins|root-scripts|workspace-scripts>] [--status <all|allowed|blocked>] [--tab <recommended|all|blocked>] [--sort <id|source|command>]
  codex-status
  codex-start [--ws-port <n>] [--reuse|--no-reuse]
  codex-stop
  codex-exec [--prompt <text>]
  status
  stop [--app-runtime|--package-runtime]
  run <command-id> [--confirm]
`);
}

function printLine(stream, text = '') {
  const fd = stream === 'stderr' ? 2 : 1;
  fs.writeSync(fd, `${text}\n`);
}

function printResult(result, asJson = false, stream = 'stdout') {
  if (!result) return;
  if (asJson) {
    printLine(stream, JSON.stringify(result, null, 2));
    return;
  }
  if (result.message) printLine(stream, result.message);
  if (result.report) printLine(stream, result.report);
  if (result.url) printLine(stream, `url: ${result.url}`);
  if (result.pid) printLine(stream, `pid: ${result.pid}`);
  if (result.mode) printLine(stream, `mode: ${result.mode}`);
  if (result.logPath) printLine(stream, `log: ${result.logPath}`);
  if (result.stdout) printLine(stream, result.stdout);
  if (result.stderr) printLine('stderr', result.stderr);
}

export async function runRepoStudioCli(argv = process.argv.slice(2)) {
  const command = argv[0];
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    usage();
    return { exitCode: 0 };
  }

  const { positional, flags } = parseArgs(argv.slice(1));
  const asJson = flags.has('json');
  let result;

  if (command === 'open') {
    const detach = flags.has('foreground') ? false : (flags.has('detach') ? true : undefined);
    const reuse = flags.has('no-reuse') ? false : (flags.has('reuse') ? true : undefined);
    result = await runOpen({
      profile: flags.get('profile'),
      mode: flags.get('mode'),
      view: flags.get('view'),
      port: flags.get('port'),
      appRuntime: flags.has('app-runtime'),
      packageRuntime: flags.has('package-runtime'),
      reuse,
      detach,
      foreground: flags.has('foreground'),
      legacyUi: flags.has('legacy-ui'),
      openBrowser: !flags.has('no-browser'),
      runtimeChild: flags.has('runtime-child'),
    });
  } else if (command === 'doctor') {
    result = await runDoctor();
  } else if (command === 'commands-list') {
    result = await runCommandsList();
  } else if (command === 'commands-toggle') {
    result = await runCommandsToggle({
      commandId: positional[0],
      disabled: flags.has('disable') ? true : (flags.has('enable') ? false : true),
    });
  } else if (command === 'commands-view') {
    result = await runCommandsView({
      query: flags.get('query'),
      source: flags.get('source'),
      status: flags.get('status'),
      tab: flags.get('tab'),
      sort: flags.get('sort'),
    });
  } else if (command === 'codex-status') {
    result = await runCodexStatus();
  } else if (command === 'codex-start') {
    result = await runCodexStart({
      wsPort: flags.get('ws-port'),
      reuse: flags.has('no-reuse') ? false : (flags.has('reuse') ? true : undefined),
    });
  } else if (command === 'codex-stop') {
    result = await runCodexStop();
  } else if (command === 'codex-exec') {
    result = await runCodexExecCommand({
      prompt: flags.get('prompt') || positional[0],
    });
  } else if (command === 'status') {
    result = await runStatus();
  } else if (command === 'stop') {
    result = await runStop({
      appRuntime: flags.has('app-runtime'),
      packageRuntime: flags.has('package-runtime'),
    });
  } else if (command === 'run') {
    result = await runCommandById({
      commandId: positional[0],
      confirm: flags.has('confirm'),
    });
  } else {
    throw new Error(`Unknown command: ${command}`);
  }

  const outputStream = command === 'open' ? 'stderr' : 'stdout';
  printResult(result, asJson, outputStream);
  return { exitCode: result?.ok === false ? 1 : 0 };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runRepoStudioCli()
    .then((result) => {
      process.exitCode = result.exitCode;
    })
    .catch((error) => {
      printLine('stderr', `forge-repo-studio error: ${error.message}`);
      process.exitCode = 1;
    });
}
