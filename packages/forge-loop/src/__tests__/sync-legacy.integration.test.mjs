import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  mkTempRepo,
  runCli,
} from './helpers.mjs';

test('sync-legacy respects legacySync.enabled flag', () => {
  const tempDir = mkTempRepo('forge-loop-sync-legacy-disabled-');

  let result = runCli(tempDir, ['new-project', '--fresh']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const configPath = path.join(tempDir, '.planning', 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.legacySync = { ...(config.legacySync || {}), enabled: false };
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

  result = runCli(tempDir, ['sync-legacy']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /legacy sync is disabled/i);
});
