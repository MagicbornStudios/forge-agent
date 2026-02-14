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
  loadPlanningConfig,
} from '../lib/config.mjs';
import { getStagedFiles, isGitRepo, isInCommitScope } from '../lib/git.mjs';
import { ensureHeadlessEnvReady } from '../lib/env-preflight.mjs';

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
  const runtimeOk = config.runtime === 'prompt-pack';
  checks.push({
    name: 'config.runtime',
    ok: runtimeOk,
    details: `runtime=${config.runtime}`,
  });
  if (!runtimeOk) issues.push(`Unsupported runtime "${config.runtime}". Only "prompt-pack" is allowed.`);

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
    report,
    nextAction: issues.length === 0 ? 'forge-loop progress' : 'Fix doctor issues and rerun forge-loop doctor',
  };
}
