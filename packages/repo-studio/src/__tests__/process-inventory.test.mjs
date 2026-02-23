import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildProcessInventory,
  parsePosixProcessSnapshot,
  parseWindowsProcessSnapshot,
} from '../lib/process-inventory.mjs';

test('process inventory parsers handle windows and posix fixtures', () => {
  const windowsRaw = JSON.stringify([
    {
      ProcessId: 101,
      Name: 'node.exe',
      CommandLine: 'node C:\\repo\\apps\\repo-studio\\server.js',
    },
  ]);
  const parsedWindows = parseWindowsProcessSnapshot(windowsRaw);
  assert.equal(parsedWindows.length, 1);
  assert.equal(parsedWindows[0].pid, 101);
  assert.equal(parsedWindows[0].name, 'node.exe');

  const posixRaw = [
    '202 node /usr/bin/node /repo/apps/repo-studio/server.js',
    '303 bash /bin/bash',
  ].join('\n');
  const parsedPosix = parsePosixProcessSnapshot(posixRaw);
  assert.equal(parsedPosix.length, 2);
  assert.equal(parsedPosix[0].pid, 202);
  assert.equal(parsedPosix[0].name, 'node');
});

test('buildProcessInventory classifies ownership and known ports', () => {
  const repoRoot = 'C:/Users/test/forge-agent';
  const inventory = buildProcessInventory({
    repoRoot,
    processes: [
      {
        ProcessId: 4100,
        Name: 'node.exe',
        CommandLine: 'node C:\\Users\\test\\forge-agent\\apps\\repo-studio\\node_modules\\next\\dist\\bin\\next dev -p 3010',
      },
      {
        ProcessId: 4200,
        Name: 'node.exe',
        CommandLine: 'node C:\\Users\\test\\forge-agent\\node_modules\\.pnpm\\@openai+codex@0.104.0\\node_modules\\@openai\\codex\\bin\\codex.js app-server',
      },
      {
        ProcessId: 4300,
        Name: 'node.exe',
        CommandLine: 'node C:\\Users\\test\\other-repo\\apps\\studio\\server.js',
      },
    ],
    knownPorts: [3010, 3789],
    pidByPortResolver: (port) => {
      if (port === 3010) return 4100;
      if (port === 3789) return 4200;
      return null;
    },
  });

  const repoStudioProcess = inventory.processes.find((item) => item.pid === 4100);
  assert.equal(repoStudioProcess.repoOwned, true);
  assert.equal(repoStudioProcess.repoStudioOwned, true);
  assert.deepEqual(repoStudioProcess.knownPorts, [3010]);

  const codexProcess = inventory.processes.find((item) => item.pid === 4200);
  assert.equal(codexProcess.repoOwned, true);
  assert.equal(codexProcess.repoStudioOwned, true);
  assert.deepEqual(codexProcess.knownPorts, [3789]);

  const externalProcess = inventory.processes.find((item) => item.pid === 4300);
  assert.equal(externalProcess.repoOwned, false);
  assert.equal(externalProcess.repoStudioOwned, false);
});
