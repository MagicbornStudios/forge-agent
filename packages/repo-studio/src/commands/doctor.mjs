import fs from 'node:fs/promises';
import path from 'node:path';

import { loadRepoStudioConfig, REPO_STUDIO_CONFIG_PATH } from '../lib/config.mjs';
import { buildAllowedCommands } from '../lib/policy.mjs';
import { collectRunbookDocs, collectLoopAnalytics } from '../lib/snapshots.mjs';
import { loadActiveRuntimeState, runtimeUrlFor } from '../lib/runtime-manager.mjs';
import { getCodexStatus } from '../lib/codex.mjs';
import { getDependencyHealth } from '../lib/dependency-health.mjs';
import { getDesktopAuthReadiness, getDesktopReadiness } from '../lib/desktop-readiness.mjs';

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback = null) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
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
  const codexSession = await readJson(path.join(process.cwd(), '.repo-studio', 'codex-session.json'), null);
  const deps = getDependencyHealth(process.cwd());
  const desktop = getDesktopReadiness(process.cwd());
  const desktopAuth = getDesktopAuthReadiness(process.cwd());

  const rootPackage = await exists(path.join(process.cwd(), 'package.json'));
  const depsOk = deps.dockviewPackageResolved
    && deps.dockviewCssResolved
    && deps.sharedStylesResolved
    && deps.cssPackagesResolved;
  const protocolInitialized = codexSession?.protocolInitialized === true;
  const activeThreadCount = Number(codexSession?.activeThreadCount || 0);
  const activeTurnCount = Number(codexSession?.activeTurnCount || 0);
  const execFallbackEnabled = codexSession?.execFallbackEnabled === true;
  const appServerReachable = codex.running === true || protocolInitialized;
  const desktopOk = desktop.electronInstalled
    && desktop.sqlitePathWritable
    && desktop.watcherAvailable;
  const ok = rootPackage
    && commands.length > 0
    && codex.readiness.ok
    && depsOk
    && desktopOk
    && (appServerReachable || codex.readiness.ok);

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
    `css packages resolved: ${deps.cssPackagesResolved ? 'yes' : 'no'}`,
    `codex ready: ${codex.readiness.ok ? 'yes' : 'no'}`,
    `codex cli: ${codex.readiness.cli.installed ? `yes (${codex.readiness.cli.version || 'unknown'})` : 'missing'}`,
    `codex login: ${codex.readiness.login?.loggedIn ? codex.readiness.login.authType : 'not-logged-in'}`,
    codex.running && codex.runtime?.wsUrl ? `codex server: ${codex.runtime.wsUrl} pid=${codex.runtime.pid}` : 'codex server: stopped',
    `codex app-server reachable: ${appServerReachable ? 'yes' : 'no'}`,
    `codex protocol initialized: ${protocolInitialized ? 'yes' : 'no'}`,
    `codex active threads: ${activeThreadCount}`,
    `codex active turns: ${activeTurnCount}`,
    `codex exec fallback enabled: ${execFallbackEnabled ? 'yes' : 'no'}`,
    `desktop electron installed: ${desktop.electronInstalled ? 'yes' : 'no'}`,
    `desktop next standalone present: ${desktop.nextStandalonePresent ? 'yes' : 'no'}`,
    `desktop sqlite path writable: ${desktop.sqlitePathWritable ? 'yes' : 'no'}`,
    `desktop watcher available: ${desktop.watcherAvailable ? 'yes' : 'no'}`,
    `desktop auth connected: ${desktopAuth.connected ? 'yes' : 'no'}`,
    `desktop auth provider: ${desktopAuth.provider}`,
    `desktop auth baseUrl configured: ${desktopAuth.baseUrlConfigured ? 'yes' : 'no'}`,
    `desktop auth validation ok: ${desktopAuth.validationOk ? 'yes' : 'no'}`,
    `desktop auth capabilities: connect=${desktopAuth.capabilities.connect ? 'yes' : 'no'} read=${desktopAuth.capabilities.read ? 'yes' : 'no'} write=${desktopAuth.capabilities.write ? 'yes' : 'no'}`,
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
  if (!desktopOk) {
    lines.push(
      '',
      '## Desktop Remediation',
      '- Install desktop dependencies: pnpm --filter @forge/repo-studio install',
      '- Build standalone app output: pnpm --filter @forge/repo-studio run desktop:build',
      ...desktop.messages.map((message) => `- ${message}`),
    );
  }

  return {
    ok,
    configExists,
    commandCount: commands.length,
    blockedCount: commands.filter((item) => item.blocked).length,
    docsCount: docs.length,
    deps,
    desktop,
    desktopAuth,
    codex,
    codexProtocol: {
      appServerReachable,
      protocolInitialized,
      activeThreadCount,
      activeTurnCount,
      execFallbackEnabled,
    },
    loop,
    runtime: runtime.running ? runtime.state : null,
    report: `${lines.join('\n')}\n`,
  };
}
