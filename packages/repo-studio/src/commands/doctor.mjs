import fs from 'node:fs/promises';
import path from 'node:path';

import { loadRepoStudioConfig, REPO_STUDIO_CONFIG_PATH } from '../lib/config.mjs';
import { buildAllowedCommands } from '../lib/policy.mjs';
import { collectRunbookDocs, collectLoopAnalytics } from '../lib/snapshots.mjs';
import { loadActiveRuntimeState, runtimeUrlFor } from '../lib/runtime-manager.mjs';
import { getCodexStatus } from '../lib/codex.mjs';
import { getDependencyHealth } from '../lib/dependency-health.mjs';

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function runDoctor() {
  const config = await loadRepoStudioConfig();
  const commands = await buildAllowedCommands(config);
  const docs = await collectRunbookDocs(config);
  const loop = await collectLoopAnalytics(config);
  const codex = await getCodexStatus(config);
  const configExists = await exists(REPO_STUDIO_CONFIG_PATH);
  const runtime = await loadActiveRuntimeState({ cleanupStale: true });
  const deps = getDependencyHealth(process.cwd());

  const rootPackage = await exists(path.join(process.cwd(), 'package.json'));
  const depsOk = deps.dockviewPackageResolved && deps.dockviewCssResolved && deps.sharedStylesResolved;
  const ok = rootPackage && commands.length > 0 && codex.readiness.ok && depsOk;

  const lines = [
    '# RepoStudio Doctor',
    '',
    `config: ${configExists ? REPO_STUDIO_CONFIG_PATH : 'defaults (no .repo-studio/config.json found)'}`,
    `commands: ${commands.length}`,
    `blocked commands: ${commands.filter((item) => item.blocked).length}`,
    `docs: ${docs.length}`,
    `loop summaries: ${loop.summaries}`,
    `loop verifications: ${loop.verifications}`,
    `open loop tasks: ${loop.tasks.pending + loop.tasks.in_progress}`,
    `dockview package resolved: ${deps.dockviewPackageResolved ? 'yes' : 'no'}`,
    `dockview css resolved: ${deps.dockviewCssResolved ? 'yes' : 'no'}`,
    `shared styles resolved: ${deps.sharedStylesResolved ? 'yes' : 'no'}`,
    `codex ready: ${codex.readiness.ok ? 'yes' : 'no'}`,
    `codex cli: ${codex.readiness.cli.installed ? `yes (${codex.readiness.cli.version || 'unknown'})` : 'missing'}`,
    `codex login: ${codex.readiness.login?.loggedIn ? codex.readiness.login.authType : 'not-logged-in'}`,
    codex.running && codex.runtime?.wsUrl ? `codex server: ${codex.runtime.wsUrl} pid=${codex.runtime.pid}` : 'codex server: stopped',
    runtime.running && runtime.state
      ? `runtime: running (${runtime.state.mode}) ${runtimeUrlFor(runtime.state)} pid=${runtime.state.pid}`
      : 'runtime: stopped',
  ];

  if (!rootPackage) {
    lines.push('', '- Missing package.json in current directory.');
  }
  if (!depsOk) {
    lines.push(
      '',
      '## Dependency Remediation',
      '- Run: pnpm install',
      '- Recheck: pnpm --filter @forge/repo-studio-app build',
      ...deps.messages.map((message) => `- ${message}`),
    );
  }

  return {
    ok,
    configExists,
    commandCount: commands.length,
    blockedCount: commands.filter((item) => item.blocked).length,
    docsCount: docs.length,
    deps,
    codex,
    loop,
    runtime: runtime.running ? runtime.state : null,
    report: `${lines.join('\n')}\n`,
  };
}
