#!/usr/bin/env node

import { execSync } from 'node:child_process';

function run(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }).trim();
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout).trim() : '';
    const stderr = error?.stderr ? String(error.stderr).trim() : '';
    return [stdout, stderr].filter(Boolean).join('\n').trim();
  }
}

function fail(header, details) {
  console.error(`[guard-assistant-canonical] ${header}`);
  if (details) {
    console.error(details);
  }
  process.exitCode = 1;
}

const runtimeWrapperMatches = run(
  'rg -n "AssistantRuntimeProvider|useChatRuntime|AssistantChatTransport" apps --glob "**/*.{ts,tsx}" --glob "!apps/docs/**"',
);

if (runtimeWrapperMatches) {
  fail(
    'App-local assistant runtime wrappers are forbidden. Use @forge/shared AssistantPanel instead.',
    runtimeWrapperMatches,
  );
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('[guard-assistant-canonical] OK');

