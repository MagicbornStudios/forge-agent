import {
  GENERATED_END_MARKER,
  GENERATED_START_MARKER,
  PLANNING_FILES,
  toAbsPath,
} from '../lib/paths.mjs';
import { fileExists, readText } from '../lib/fs-utils.mjs';
import {
  getCommitScope,
  getEnvSettings,
  getLegacySyncTargets,
  getRuntimeSettings,
  loadPlanningConfig,
} from '../lib/config.mjs';
import { getStagedFiles, isGitRepo, isInCommitScope } from '../lib/git.mjs';
import { ensureHeadlessEnvReady } from '../lib/env-preflight.mjs';
import { evaluateCodexRuntimeReadiness } from '../lib/codex/cli-status.mjs';
import { resolveRuntimeRunner } from '../lib/runtime/resolver.mjs';

const REQUIRED_FILES = [
  PLANNING_FILES.project,
  PLANNING_FILES.requirements,
  PLANNING_FILES.roadmap,
  PLANNING_FILES.state,
  PLANNING_FILES.decisions,
  PLANNING_FILES.errors,
  PLANNING_FILES.taskRegistry,
  PLANNING_FILES.config,
];

function markerStateFor(filePath) {
  const content = readText(filePath, '');
  const hasStart = content.includes(GENERATED_START_MARKER);
  const hasEnd = content.includes(GENERATED_END_MARKER);

  if (hasStart && hasEnd) return { ok: true, status: 'markers-present' };
  if (!hasStart && !hasEnd) return { ok: false, status: 'markers-missing' };
  return { ok: false, status: 'markers-broken' };
}

function printDoctorReport(checks, warnings, issues) {
  const lines = [
    '# Forge Loop Doctor',
    '',
    '| Check | Result | Details |',
    '|---|---|---|',
    ...checks.map((check) => `| ${check.name} | ${check.ok ? 'PASS' : 'FAIL'} | ${check.details || '-'} |`),
  ];

  if (warnings.length > 0) {
    lines.push('', '## Warnings', ...warnings.map((item) => `- ${item}`));
  }
  if (issues.length > 0) {
    lines.push('', '## Issues', ...issues.map((item) => `- ${item}`));
  }

  return `${lines.join('\n')}\n`;
}

export async function runDoctor(options = {}) {
  const checks = [];
  const warnings = [];
  const issues = [];

  for (const requiredPath of REQUIRED_FILES) {
    const exists = fileExists(requiredPath);
    checks.push({
      name: `artifact:${requiredPath.replace(/\\/g, '/')}`,
      ok: exists,
      details: exists ? 'present' : 'missing',
    });
    if (!exists) issues.push(`Missing required artifact: ${requiredPath.replace(/\\/g, '/')}`);
  }

  const config = loadPlanningConfig();
  const env = getEnvSettings(config);
  const runtimeSettings = getRuntimeSettings(config);
  const codexReadiness = evaluateCodexRuntimeReadiness(runtimeSettings);

  let runtimeSelection = null;
  let runtimeSelectionIssue = null;
  try {
    runtimeSelection = resolveRuntimeRunner({
      config,
      requestedRunner: options.runner,
      codexReadiness,
    });
  } catch (error) {
    runtimeSelectionIssue = error instanceof Error ? error.message : String(error);
  }

  checks.push({
    name: 'runtime.mode',
    ok: true,
    details: `mode=${runtimeSettings.mode}`,
  });

  checks.push({
    name: 'runtime.runnerSelected',
    ok: Boolean(runtimeSelection),
    details: runtimeSelection ? runtimeSelection.runnerSelected : 'unresolved',
  });
  if (!runtimeSelection && runtimeSelectionIssue) {
    issues.push(runtimeSelectionIssue);
  }

  checks.push({
    name: 'runtime.codexCliInstalled',
    ok: codexReadiness.cli.installed,
    details: codexReadiness.cli.installed ? codexReadiness.cli.version : 'missing',
  });

  checks.push({
    name: 'runtime.codexLoginValid',
    ok: Boolean(codexReadiness.login?.loggedIn),
    details: codexReadiness.login?.authType || 'none',
  });

  checks.push({
    name: 'runtime.codexAppServerReachable',
    ok: Boolean(codexReadiness.appServer?.reachable),
    details: codexReadiness.appServer?.reachable ? 'available' : 'unavailable',
  });

  checks.push({
    name: 'runtime.codexFallbackEnabled',
    ok: true,
    details: runtimeSettings.codex.execFallbackAllowed === true ? 'true' : 'false',
  });

  if (runtimeSettings.mode === 'codex' && !codexReadiness.ok) {
    issues.push(`Runtime mode codex is selected but readiness failed: ${codexReadiness.issues.join(', ')}`);
  } else if (runtimeSettings.mode === 'auto' && !codexReadiness.ok) {
    const message = `Runtime auto mode fallback active: ${codexReadiness.issues.join(', ')}`;
    if (runtimeSettings.codex.execFallbackAllowed === true) {
      warnings.push(message);
    } else {
      issues.push(message);
    }
  }

  checks.push({
    name: 'config.env.profile',
    ok: true,
    details: env.enabled ? `enabled (${env.profile})` : 'disabled',
  });

  const commitScope = getCommitScope(config);
  const commitScopeOk = Array.isArray(commitScope) && commitScope.length > 0;
  checks.push({
    name: 'config.git.commitScope',
    ok: commitScopeOk,
    details: commitScopeOk ? commitScope.join(', ') : 'empty',
  });
  if (!commitScopeOk) issues.push('git.commitScope must include at least one allowlist path.');

  const legacyTargets = getLegacySyncTargets(config);
  for (const relPath of legacyTargets) {
    const absPath = toAbsPath(relPath);
    if (!fileExists(absPath)) {
      warnings.push(`Legacy sync target not found: ${relPath}`);
      checks.push({
        name: `legacy-marker:${relPath}`,
        ok: false,
        details: 'missing file',
      });
      continue;
    }

    const markerState = markerStateFor(absPath);
    checks.push({
      name: `legacy-marker:${relPath}`,
      ok: markerState.ok,
      details: markerState.status,
    });

    if (markerState.status === 'markers-broken') {
      issues.push(`Marker block is broken in ${relPath}. Both start/end markers are required.`);
    } else if (markerState.status === 'markers-missing') {
      warnings.push(`Markers not initialized in ${relPath}; sync-legacy will append them.`);
    }
  }

  if (isGitRepo(process.cwd())) {
    const staged = getStagedFiles(process.cwd());
    const outOfScope = staged.filter((filePath) => !isInCommitScope(filePath, commitScope));
    checks.push({
      name: 'git.staged.scope',
      ok: outOfScope.length === 0,
      details: outOfScope.length === 0 ? 'staged files are within commit scope' : outOfScope.join(', '),
    });
    if (outOfScope.length > 0) {
      issues.push(`Staged out-of-scope files detected: ${outOfScope.join(', ')}`);
    }
  } else {
    warnings.push('Current directory is not a git repository.');
  }

  if (options.headless === true) {
    try {
      const envResult = ensureHeadlessEnvReady(config, {
        headless: true,
        autoLaunchPortal: options.autoLaunchPortal,
      });
      checks.push({
        name: 'env.headless',
        ok: true,
        details: envResult.recovered
          ? `ready (recovered via ${envResult.launchedRepoStudio ? 'repo-studio + ' : ''}portal, profile=${env.profile})`
          : `ready (profile=${env.profile})`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      checks.push({
        name: 'env.headless',
        ok: false,
        details: 'failed',
      });
      issues.push(message);
    }
  }

  const report = printDoctorReport(checks, warnings, issues);
  return {
    ok: issues.length === 0,
    checks,
    warnings,
    issues,
    runtime: {
      mode: runtimeSettings.mode,
      runnerSelected: runtimeSelection?.runnerSelected || null,
      codexCliInstalled: codexReadiness.cli.installed,
      codexLoginValid: Boolean(codexReadiness.login?.loggedIn),
      codexAppServerReachable: Boolean(codexReadiness.appServer?.reachable),
      codexFallbackEnabled: runtimeSettings.codex.execFallbackAllowed === true,
      fallbackReason: runtimeSelection?.fallbackReason || null,
    },
    report,
    nextAction: issues.length === 0 ? 'forge-loop progress' : 'Fix doctor issues and rerun forge-loop doctor',
  };
}
