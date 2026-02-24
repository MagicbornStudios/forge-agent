#!/usr/bin/env node
/** Run vendored GSD installer Codex-only (FORGE_GSD_CODEX_ONLY=1). */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const installJs = path.join(root, 'vendor', 'get-shit-done', 'bin', 'install.js');
const result = spawnSync(
  process.execPath,
  [installJs, '--codex', '--local'],
  {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, FORGE_GSD_CODEX_ONLY: '1' },
  }
);
process.exit(result.status ?? 1);
