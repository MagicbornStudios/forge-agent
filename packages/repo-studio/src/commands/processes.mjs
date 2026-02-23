import { loadRepoStudioConfig } from '../lib/config.mjs';
import {
  buildReclaimPlan,
  RECLAIM_SCOPE_REPO,
  RECLAIM_SCOPE_REPO_STUDIO,
} from '../lib/process-reclaim.mjs';
import { renderKeyValueSection, renderProcessTable } from '../lib/terminal-format.mjs';

function normalizeScope(value) {
  const scope = String(value || RECLAIM_SCOPE_REPO_STUDIO).trim().toLowerCase();
  return scope === RECLAIM_SCOPE_REPO ? RECLAIM_SCOPE_REPO : RECLAIM_SCOPE_REPO_STUDIO;
}

function toTableRows(items = []) {
  return items.map((item) => ({
    ...item,
    action: item.action || (item.reason ? `skip:${item.reason}` : 'skip'),
  }));
}

export async function runProcesses(options = {}, dependencies = {}) {
  const scope = normalizeScope(options.scope);
  const config = dependencies.loadConfig
    ? await dependencies.loadConfig()
    : await loadRepoStudioConfig();
  const plan = await (dependencies.buildReclaimPlan || buildReclaimPlan)({
    scope,
    force: options.force === true,
    dryRun: true,
    config,
    repoRoot: process.cwd(),
    excludePids: [process.pid, process.ppid],
    platform: options.platform,
    processes: options.processes,
    inventory: options.inventory,
    trackedPids: options.trackedPids,
  });

  const summaryEntries = [
    { key: 'scope', value: scope },
    { key: 'known ports', value: plan.knownPorts.join(', ') || '(none)' },
    {
      key: 'inventory',
      value: String(plan.inventory?.processes?.length || 0),
      status: plan.inventory?.ok === false ? 'warn' : 'ok',
    },
    { key: 'targets', value: String(plan.targets.length), status: plan.targets.length > 0 ? 'warn' : 'ok' },
    { key: 'skipped', value: String(plan.skipped.length), status: plan.skipped.length > 0 ? 'warn' : 'ok' },
  ];

  const targetTablePlain = renderProcessTable(plan.targets, {
    ansi: false,
    emptyMessage: '(no reclaim targets for this scope)',
  });
  const skippedTablePlain = renderProcessTable(toTableRows(plan.skipped), {
    ansi: false,
    emptyMessage: '(none)',
  });

  const targetTableAnsi = renderProcessTable(plan.targets, {
    ansi: true,
    emptyMessage: '(no reclaim targets for this scope)',
  });
  const skippedTableAnsi = renderProcessTable(toTableRows(plan.skipped), {
    ansi: true,
    emptyMessage: '(none)',
  });

  const report = [
    '# RepoStudio Processes',
    '',
    ...summaryEntries.map((entry) => `${entry.key}: ${entry.value}`),
    plan.inventory?.ok === false && plan.inventory?.error
      ? `inventory warning: ${plan.inventory.error}`
      : null,
    '',
    '## Reclaim Targets',
    targetTablePlain,
    '',
    '## Skipped',
    skippedTablePlain,
  ].join('\n');

  const reportAnsi = [
    renderKeyValueSection('RepoStudio Processes', summaryEntries, { ansi: true }),
    plan.inventory?.ok === false && plan.inventory?.error
      ? `\ninventory warning: ${plan.inventory.error}`
      : '',
    '',
    'Reclaim Targets',
    targetTableAnsi,
    '',
    'Skipped',
    skippedTableAnsi,
  ].join('\n');

  return {
    ok: true,
    scope,
    dryRun: true,
    inventoryOk: plan.inventory?.ok !== false,
    inventoryError: plan.inventory?.error || null,
    knownPorts: plan.knownPorts,
    inventoryCount: plan.inventory?.processes?.length || 0,
    targetCount: plan.targets.length,
    skippedCount: plan.skipped.length,
    targets: plan.targets,
    skipped: plan.skipped,
    report: `${report}\n`,
    reportAnsi: `${reportAnsi}\n`,
    message: plan.inventory?.ok === false
      ? `Found ${plan.targets.length} reclaim target(s) for scope "${scope}" (inventory fallback mode).`
      : `Found ${plan.targets.length} reclaim target(s) for scope "${scope}".`,
  };
}
