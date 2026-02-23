import fs from 'node:fs/promises';
import path from 'node:path';

import { loadRepoStudioConfig, REPO_STUDIO_CONFIG_PATH } from '../lib/config.mjs';
import { buildAllowedCommands } from '../lib/policy.mjs';
import { collectRunbookDocs, collectLoopAnalytics } from '../lib/snapshots.mjs';
import {
  loadActiveRuntimeState,
  runtimeUrlFor,
  findListeningPidByPort,
  REPO_STUDIO_APP_DEFAULT_PORT,
  REPO_STUDIO_PACKAGE_DEFAULT_PORT,
  REPO_STUDIO_DESKTOP_DEFAULT_PORT,
} from '../lib/runtime-manager.mjs';
import { getCodexStatus } from '../lib/codex.mjs';
import { getDependencyHealth } from '../lib/dependency-health.mjs';
import { getDesktopAuthReadiness, getDesktopReadiness } from '../lib/desktop-readiness.mjs';
import {
  renderKeyValueSection,
  statusBadge,
  renderTerminalLink,
  shouldUseTerminalLinks,
} from '../lib/terminal-format.mjs';

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

export function evaluateDoctorCodexReadiness(codexStatus = {}, options = {}) {
  const readiness = codexStatus?.readiness || {};
  const cliInstalled = readiness?.cli?.installed === true;
  const codexEnabled = readiness?.codex?.enabled !== false;
  const loginOk = readiness?.login?.loggedIn === true
    && readiness?.login?.authType === 'chatgpt';
  const requireCodexLogin = options.requireCodexLogin === true;

  if (!codexEnabled) return false;
  if (!cliInstalled) return false;
  if (requireCodexLogin && !loginOk) return false;
  return true;
}

function detectRuntimePortConflicts(runtime) {
  const ports = new Set([
    REPO_STUDIO_APP_DEFAULT_PORT,
    REPO_STUDIO_PACKAGE_DEFAULT_PORT,
    REPO_STUDIO_DESKTOP_DEFAULT_PORT,
  ]);
  if (Number.isInteger(Number(runtime?.state?.port))) {
    ports.add(Number(runtime.state.port));
  }
  if (Number.isInteger(Number(runtime?.state?.desktop?.appPort))) {
    ports.add(Number(runtime.state.desktop.appPort));
  }

  const trackedPids = new Set();
  if (runtime?.running && runtime?.state) {
    const pid = Number(runtime.state.pid || 0);
    if (Number.isInteger(pid) && pid > 0) trackedPids.add(pid);
    const electronPid = Number(runtime.state?.desktop?.electronPid || 0);
    if (Number.isInteger(electronPid) && electronPid > 0) trackedPids.add(electronPid);
    const serverPid = Number(runtime.state?.desktop?.serverPid || 0);
    if (Number.isInteger(serverPid) && serverPid > 0) trackedPids.add(serverPid);
  }

  const conflicts = [];
  for (const candidate of ports) {
    const port = Number(candidate);
    if (!Number.isInteger(port) || port <= 0) continue;
    const pid = Number(findListeningPidByPort(port) || 0);
    if (!Number.isInteger(pid) || pid <= 0) continue;
    if (trackedPids.has(pid)) continue;
    conflicts.push({ port, pid });
  }
  return conflicts;
}

function formatPortConflicts(conflicts = []) {
  return conflicts
    .map((item) => `${item.port} (pid ${item.pid})`)
    .join(', ');
}

export function buildDoctorRuntimeQuickActions(input = {}) {
  const runtime = input.runtime && typeof input.runtime === 'object'
    ? input.runtime
    : { running: false, state: null, stale: false };
  const runtimeState = runtime.state && typeof runtime.state === 'object'
    ? runtime.state
    : null;
  const runtimeUrl = String(
    input.runtimeUrl
    || (runtime.running && runtimeState ? runtimeUrlFor(runtimeState) : '')
    || '',
  ).trim();
  const conflicts = Array.isArray(input.portConflicts)
    ? input.portConflicts.filter((item) => Number.isInteger(Number(item?.port)) && Number.isInteger(Number(item?.pid)))
      .map((item) => ({ port: Number(item.port), pid: Number(item.pid) }))
    : [];
  const conflictText = formatPortConflicts(conflicts);
  const linksEnabled = input.linksEnabled === true;
  const running = runtime.running === true && runtimeState != null;
  const runtimeMode = running ? String(runtimeState.mode || 'unknown') : null;
  const runtimePid = running ? Number(runtimeState.pid || 0) : null;
  const stoppedWithConflicts = !running && conflicts.length > 0;

  const summaryStatus = running ? 'ok' : (stoppedWithConflicts ? 'warn' : 'info');
  const summaryValue = running
    ? `${runtimeMode} (${runtimePid})`
    : stoppedWithConflicts
      ? `stopped (listener on ${conflicts.map((item) => item.port).join(', ')})`
      : 'stopped (expected before start)';
  const runtimeLine = running
    ? `runtime: running (${runtimeMode}) ${runtimeUrl || 'http://127.0.0.1'} pid=${runtimePid}`
    : stoppedWithConflicts
      ? `runtime: stopped (listener detected: ${conflictText})`
      : 'runtime: stopped (expected before starting dev)';

  const plainSectionLines = ['', '## Runtime Quick Actions'];
  const ansiSectionLines = [
    '',
    `${statusBadge(running ? 'OK' : (stoppedWithConflicts ? 'WARN' : 'INFO'), { ansi: true })} Runtime quick actions`,
  ];

  if (running) {
    const openUrlText = runtimeUrl || 'http://127.0.0.1';
    const linkedUrl = runtimeUrl
      ? renderTerminalLink(runtimeUrl, runtimeUrl, { enabled: linksEnabled })
      : openUrlText;
    plainSectionLines.push(
      `- Status: running (${runtimeMode}) pid=${runtimePid}`,
      `- Open: ${openUrlText}`,
      '- Stop: pnpm forge-repo-studio stop',
      '- Reclaim dry run if ports get stuck: pnpm forge-repo-studio reclaim --dry-run',
    );
    ansiSectionLines.push(
      `  status: running (${runtimeMode}) pid=${runtimePid}`,
      `  open: ${linkedUrl}`,
      '  stop: pnpm forge-repo-studio stop',
      '  reclaim dry run: pnpm forge-repo-studio reclaim --dry-run',
    );
    return {
      summaryStatus,
      summaryValue,
      runtimeLine,
      plainSectionLines,
      ansiSectionLines,
    };
  }

  if (stoppedWithConflicts) {
    plainSectionLines.push(
      `- Status: stopped, but detected listeners on ${conflictText}.`,
      '- Reclaim (safe scope): pnpm forge-repo-studio reclaim',
      '- Reclaim preview: pnpm forge-repo-studio reclaim --dry-run',
      '- Repo-wide preview: pnpm forge-repo-studio reclaim --scope repo --force --dry-run',
    );
    ansiSectionLines.push(
      `  status: stopped, listener detected on ${conflictText}`,
      '  reclaim: pnpm forge-repo-studio reclaim',
      '  reclaim preview: pnpm forge-repo-studio reclaim --dry-run',
      '  repo-wide preview: pnpm forge-repo-studio reclaim --scope repo --force --dry-run',
    );
    return {
      summaryStatus,
      summaryValue,
      runtimeLine,
      plainSectionLines,
      ansiSectionLines,
    };
  }

  plainSectionLines.push(
    '- Status: stopped (expected before launching dev).',
    '- Start (root): pnpm dev:repo-studio',
    '- Start (app only): pnpm --filter @forge/repo-studio-app dev',
    '- Reclaim dry run if ports are blocked: pnpm forge-repo-studio reclaim --dry-run',
  );
  ansiSectionLines.push(
    '  status: stopped (expected before launching dev)',
    '  start (root): pnpm dev:repo-studio',
    '  start (app only): pnpm --filter @forge/repo-studio-app dev',
    '  reclaim dry run: pnpm forge-repo-studio reclaim --dry-run',
  );
  return {
    summaryStatus,
    summaryValue,
    runtimeLine,
    plainSectionLines,
    ansiSectionLines,
  };
}
export async function runDoctor(options = {}) {
  const requireCodexLogin = options.requireCodexLogin === true;
  const linksEnabled = shouldUseTerminalLinks({
    noLinks: options.noLinks === true,
    stream: options.stream || 'stdout',
    tty: options.tty,
  });
  const config = await loadRepoStudioConfig();
  const commands = await buildAllowedCommands(config);
  const docs = await collectRunbookDocs(config);
  const loop = await collectLoopAnalytics(config);
  const codex = await getCodexStatus(config, { requireLogin: requireCodexLogin });
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
    && deps.cssPackagesResolved
    && deps.runtimePackagesResolved
    && deps.postcssConfigResolved
    && deps.tailwindPostcssResolved
    && deps.tailwindPipelineResolved;
  const protocolInitialized = codexSession?.protocolInitialized === true;
  const activeThreadCount = Number(codexSession?.activeThreadCount || 0);
  const activeTurnCount = Number(codexSession?.activeTurnCount || 0);
  const execFallbackEnabled = codexSession?.execFallbackEnabled === true;
  const appServerReachable = codex.running === true || protocolInitialized;
  const codexReadyForDoctor = evaluateDoctorCodexReadiness(codex, { requireCodexLogin });
  const desktopOk = desktop.electronInstalled
    && desktop.sqlitePathWritable
    && desktop.watcherAvailable;
  const runtimePortConflicts = detectRuntimePortConflicts(runtime);
  const runtimeQuickActions = buildDoctorRuntimeQuickActions({
    runtime,
    runtimeUrl: runtime.running && runtime.state ? runtimeUrlFor(runtime.state) : null,
    portConflicts: runtimePortConflicts,
    linksEnabled,
  });
  const ok = rootPackage
    && commands.length > 0
    && codexReadyForDoctor
    && depsOk
    && desktopOk
    && (appServerReachable || codexReadyForDoctor);

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
    `runtime packages resolved: ${deps.runtimePackagesResolved ? 'yes' : 'no'}`,
    `postcss config resolved: ${deps.postcssConfigResolved ? 'yes' : 'no'}`,
    `tailwind postcss resolved: ${deps.tailwindPostcssResolved ? 'yes' : 'no'}`,
    `tailwind pipeline resolved: ${deps.tailwindPipelineResolved ? 'yes' : 'no'}`,
    `codex ready: ${codexReadyForDoctor ? 'yes' : 'no'}`,
    `codex login strict mode: ${requireCodexLogin ? 'yes' : 'no'}`,
    `codex cli: ${codex.readiness.cli.installed ? `yes (${codex.readiness.cli.version || 'unknown'})` : 'missing'}`,
    `codex cli source: ${codex.readiness.cli.source || 'unknown'}`,
    `codex cli invocation: ${codex.readiness.cli.invocation?.display || codex.readiness.cli.invocation?.command || codex.readiness.codex?.cliCommand || 'unknown'}`,
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
    runtimeQuickActions.runtimeLine,
  ];

  const summaryEntries = [
    { key: 'config', value: configExists ? REPO_STUDIO_CONFIG_PATH : 'defaults', status: configExists ? 'ok' : 'warn' },
    { key: 'commands', value: String(commands.length), status: commands.length > 0 ? 'ok' : 'fail' },
    { key: 'blocked commands', value: String(commands.filter((item) => item.blocked).length), status: 'ok' },
    { key: 'docs', value: String(docs.length), status: docs.length > 0 ? 'ok' : 'warn' },
    { key: 'codex ready', value: codexReadyForDoctor ? 'yes' : 'no', status: codexReadyForDoctor ? 'ok' : 'fail' },
    { key: 'codex cli', value: codex.readiness.cli.installed ? (codex.readiness.cli.version || 'installed') : 'missing', status: codex.readiness.cli.installed ? 'ok' : 'fail' },
    { key: 'codex login', value: codex.readiness.login?.loggedIn ? codex.readiness.login.authType : 'not-logged-in', status: codex.readiness.login?.loggedIn ? 'ok' : 'warn' },
    { key: 'tailwind pipeline', value: deps.tailwindPipelineResolved ? 'ready' : 'missing', status: deps.tailwindPipelineResolved ? 'ok' : 'fail' },
    { key: 'runtime', value: runtimeQuickActions.summaryValue, status: runtimeQuickActions.summaryStatus },
  ];
  const ansiLines = [
    renderKeyValueSection('RepoStudio Doctor', summaryEntries, { ansi: true }),
  ];
  lines.push(...runtimeQuickActions.plainSectionLines);
  ansiLines.push(...runtimeQuickActions.ansiSectionLines);

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
    ansiLines.push(
      '',
      `${statusBadge('WARN', { ansi: true })} Dependency remediation`,
      '  pnpm install',
      '  pnpm --filter @forge/repo-studio-app build',
      ...deps.messages.map((message) => `  - ${message}`),
    );
  }
  if (!codex.readiness?.cli?.installed) {
    lines.push(
      '',
      '## Codex CLI Remediation',
      '- Run: pnpm install',
      '- Recheck: pnpm forge-repo-studio codex-status --json',
      '- RepoStudio expects bundled Codex via @openai/codex.',
    );
    ansiLines.push(
      '',
      `${statusBadge('FAIL', { ansi: true })} Codex CLI remediation`,
      '  pnpm install',
      '  pnpm forge-repo-studio codex-status --json',
    );
  }
  if (requireCodexLogin && codex.readiness?.login?.loggedIn !== true) {
    lines.push(
      '',
      '## Codex Login Remediation',
      '- Run: pnpm forge-repo-studio codex-login',
      '- Or sign in from RepoStudio Codex Assistant panel.',
      '- Recheck: pnpm forge-repo-studio codex-status --json',
    );
    ansiLines.push(
      '',
      `${statusBadge('WARN', { ansi: true })} Codex login remediation`,
      '  pnpm forge-repo-studio codex-login',
      '  Or sign in from RepoStudio Codex Assistant panel',
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
    ansiLines.push(
      '',
      `${statusBadge('WARN', { ansi: true })} Desktop remediation`,
      '  pnpm --filter @forge/repo-studio install',
      '  pnpm --filter @forge/repo-studio run desktop:build',
      ...desktop.messages.map((message) => `  - ${message}`),
    );
  }

  return {
    ok,
    requireCodexLogin,
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
    reportAnsi: `${ansiLines.join('\n')}\n`,
  };
}
