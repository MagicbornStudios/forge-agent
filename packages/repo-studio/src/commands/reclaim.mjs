import { loadRepoStudioConfig } from '../lib/config.mjs';
import {
  buildReclaimPlan,
  executeReclaimPlan,
  RECLAIM_SCOPE_REPO,
  RECLAIM_SCOPE_REPO_STUDIO,
} from '../lib/process-reclaim.mjs';
import { renderKeyValueSection, renderProcessTable, statusBadge } from '../lib/terminal-format.mjs';

function normalizeScope(value) {
  const scope = String(value || RECLAIM_SCOPE_REPO_STUDIO).trim().toLowerCase();
  return scope === RECLAIM_SCOPE_REPO ? RECLAIM_SCOPE_REPO : RECLAIM_SCOPE_REPO_STUDIO;
}

function renderScopeForceGuard(scope) {
  const report = [
    '# RepoStudio Reclaim',
    '',
    `scope: ${scope}`,
    'ok: false',
    'message: --scope repo requires --force for actual termination.',
    '',
    'Remediation:',
    '- Preview first: forge-repo-studio reclaim --scope repo --dry-run',
    '- Execute explicitly: forge-repo-studio reclaim --scope repo --force',
  ].join('\n');

  const reportAnsi = [
    renderKeyValueSection('RepoStudio Reclaim', [
      { key: 'scope', value: scope },
      { key: 'ok', value: 'false', status: 'fail' },
      { key: 'message', value: '--scope repo requires --force for actual termination.', status: 'warn' },
    ], { ansi: true }),
    '',
    `${statusBadge('WARN', { ansi: true })} Use --dry-run first, then --force for repo-wide cleanup.`,
  ].join('\n');

  return {
    ok: false,
    scope,
    force: false,
    dryRun: false,
    targetCount: 0,
    stoppedCount: 0,
    failedCount: 0,
    message: '--scope repo requires --force for actual termination.',
    remediation: [
      'forge-repo-studio reclaim --scope repo --dry-run',
      'forge-repo-studio reclaim --scope repo --force',
    ],
    report: `${report}\n`,
    reportAnsi: `${reportAnsi}\n`,
  };
}

function toExecutionRows(execution) {
  const stopped = (execution.stopped || []).map((item) => ({
    ...item,
    action: 'killed',
  }));
  const failed = (execution.failed || []).map((item) => ({
    ...item,
    action: item.alive ? 'failed:alive' : 'failed',
  }));
  return [...stopped, ...failed].sort((a, b) => Number(a.pid || 0) - Number(b.pid || 0));
}

export async function runReclaim(options = {}, dependencies = {}) {
  const scope = normalizeScope(options.scope);
  const dryRun = options.dryRun === true;
  const force = options.force === true;
  if (scope === RECLAIM_SCOPE_REPO && !dryRun && !force) {
    return renderScopeForceGuard(scope);
  }

  const config = dependencies.loadConfig
    ? await dependencies.loadConfig()
    : await loadRepoStudioConfig();
  const buildPlanFn = dependencies.buildReclaimPlan || buildReclaimPlan;
  const executePlanFn = dependencies.executeReclaimPlan || executeReclaimPlan;

  const plan = await buildPlanFn({
    scope,
    force,
    dryRun,
    config,
    repoRoot: process.cwd(),
    excludePids: [process.pid, process.ppid],
    platform: options.platform,
    processes: options.processes,
    inventory: options.inventory,
    trackedPids: options.trackedPids,
    knownPorts: options.knownPorts,
  });

  const execution = await executePlanFn(plan, {
    stopProcessTree: dependencies.stopProcessTree,
    isProcessAlive: dependencies.isProcessAlive,
  });

  const executionRows = toExecutionRows(execution);
  const summaryEntries = [
    { key: 'scope', value: scope },
    { key: 'force', value: force ? 'true' : 'false' },
    { key: 'dryRun', value: dryRun ? 'true' : 'false' },
    { key: 'targets', value: String(plan.targets.length), status: plan.targets.length > 0 ? 'warn' : 'ok' },
    { key: 'stopped', value: String(execution.stopped?.length || 0), status: 'ok' },
    { key: 'failed', value: String(execution.failed?.length || 0), status: (execution.failed?.length || 0) > 0 ? 'fail' : 'ok' },
    { key: 'cleared state files', value: String(execution.clearedState?.removed?.length || 0), status: 'ok' },
  ];

  const tablePlain = renderProcessTable(
    dryRun ? plan.targets : executionRows,
    {
      ansi: false,
      emptyMessage: dryRun ? '(dry-run: no targets)' : '(no processes reclaimed)',
    },
  );
  const tableAnsi = renderProcessTable(
    dryRun ? plan.targets : executionRows,
    {
      ansi: true,
      emptyMessage: dryRun ? '(dry-run: no targets)' : '(no processes reclaimed)',
    },
  );

  const report = [
    '# RepoStudio Reclaim',
    '',
    ...summaryEntries.map((entry) => `${entry.key}: ${entry.value}`),
    '',
    dryRun ? '## Dry-Run Targets' : '## Execution Results',
    tablePlain,
    '',
    execution.clearedState?.removed?.length > 0
      ? `state files cleared: ${execution.clearedState.removed.join(', ')}`
      : 'state files cleared: none',
  ].join('\n');

  const reportAnsi = [
    renderKeyValueSection('RepoStudio Reclaim', summaryEntries, { ansi: true }),
    '',
    dryRun ? 'Dry-Run Targets' : 'Execution Results',
    tableAnsi,
    '',
    (execution.clearedState?.removed?.length || 0) > 0
      ? `${statusBadge('OK', { ansi: true })} Cleared state files: ${execution.clearedState.removed.join(', ')}`
      : `${statusBadge('OK', { ansi: true })} Cleared state files: none`,
  ].join('\n');

  return {
    ok: execution.ok === true,
    scope,
    force,
    dryRun,
    targetCount: plan.targets.length,
    stoppedCount: execution.stopped?.length || 0,
    failedCount: execution.failed?.length || 0,
    knownPorts: plan.knownPorts,
    targets: plan.targets,
    stopped: execution.stopped || [],
    failed: execution.failed || [],
    skipped: plan.skipped || [],
    clearedStateFiles: execution.clearedState?.removed || [],
    message: execution.message,
    report: `${report}\n`,
    reportAnsi: `${reportAnsi}\n`,
  };
}
