#!/usr/bin/env node

import { searchPattern } from './lib/guard-search.mjs';

function fail(header, details) {
  console.error(`[guard-assistant-canonical] ${header}`);
  if (details) {
    console.error(details);
  }
  process.exitCode = 1;
}

const runtimeWrapperMatches = searchPattern({
  pattern: 'AssistantRuntimeProvider|useChatRuntime|AssistantChatTransport',
  roots: ['apps'],
  extensions: ['.ts', '.tsx'],
  excludeSubpaths: ['apps/docs/'],
});

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
