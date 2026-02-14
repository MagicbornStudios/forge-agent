#!/usr/bin/env node

import { runForgeEnvCli } from '../packages/forge-env/src/cli.mjs';

const passthrough = process.argv.slice(2);
const withProfile = passthrough.includes('--profile')
  ? passthrough
  : ['--profile', 'forge-agent', ...passthrough];
const isCheckMode = passthrough.includes('--check');
const baseArgs = isCheckMode
  ? ['sync-examples', ...withProfile.filter((value) => value !== '--check')]
  : ['sync-examples', '--write', ...withProfile];

runForgeEnvCli(baseArgs)
  .then((result) => { process.exitCode = result.exitCode; })
  .catch((error) => {
    console.error(`[env:sync:examples] ${error.message}`);
    process.exitCode = 1;
  });

