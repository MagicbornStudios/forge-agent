#!/usr/bin/env node

import { runForgeEnvCli } from '../packages/forge-env/src/cli.mjs';

const passthrough = process.argv.slice(2);
const withProfile = passthrough.includes('--profile')
  ? passthrough
  : ['--profile', 'forge-agent', ...passthrough];

runForgeEnvCli(['doctor', ...withProfile])
  .then((result) => { process.exitCode = result.exitCode; })
  .catch((error) => {
    console.error(`[env:doctor] ${error.message}`);
    process.exitCode = 1;
  });

