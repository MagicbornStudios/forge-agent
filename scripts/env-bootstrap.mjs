#!/usr/bin/env node

import { runForgeEnvCli } from '../packages/forge-env/src/cli.mjs';

const passthrough = process.argv.slice(2);
const withProfile = passthrough.includes('--profile')
  ? passthrough
  : ['--profile', 'forge-agent', ...passthrough];
const skipBootstrap = process.env.FORGE_SKIP_ENV_BOOTSTRAP === '1' || process.env.CI === 'true';
const baseArgs = skipBootstrap
  ? ['doctor', '--mode', 'local', '--strict']
  : ['doctor', '--mode', 'local', '--bootstrap', '--strict'];

runForgeEnvCli([...baseArgs, ...withProfile])
  .then((result) => { process.exitCode = result.exitCode; })
  .catch((error) => {
    console.error(`[env:bootstrap] ${error.message}`);
    process.exitCode = 1;
  });

