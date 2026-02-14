import { reconcileProject } from '../lib/engine.mjs';
import { resolveProfile } from '../lib/profiles.mjs';
import { discoveryLines } from '../lib/reporting.mjs';

function renderReconcileReport(result, profile) {
  const lines = [
    '# forge-env reconcile',
    '',
    `profile: ${profile}`,
    `pending: ${result.pending.length}`,
    `changed: ${result.changed.length}`,
    `backups: ${result.backups.length}`,
    `missing: ${result.readiness.missing.length}`,
    `conflicts: ${result.readiness.conflicts.length}`,
  ];

  if (result.changed.length > 0) {
    lines.push('', '## Changed files', ...result.changed.map((item) => `- ${item}`));
  }

  if (result.pending.length > 0) {
    lines.push('', '## Pending changes', ...result.pending.map((item) => `- ${item}`));
  }

  if (result.backups.length > 0) {
    lines.push('', '## Backups', ...result.backups.map((item) => `- ${item}`));
  }

  if (result.readiness.missing.length > 0) {
    lines.push('', '## Missing required', ...result.readiness.missing.map((item) => `- ${item}`));
  }

  if (result.readiness.conflicts.length > 0) {
    lines.push('', '## Conflicts', ...result.readiness.conflicts.map((item) => `- ${item}`));
  }

  if (result.readiness.warnings.length > 0) {
    lines.push('', '## Warnings', ...result.readiness.warnings.map((item) => `- ${item}`));
  }

  lines.push(...discoveryLines(result.state?.discovery));

  return `${lines.join('\n')}\n`;
}

export async function runReconcile(options = {}) {
  const profile = await resolveProfile({ profile: options.profile });
  const result = await reconcileProject(profile.config, {
    app: options.app,
    mode: options.mode || 'local',
    write: options.write === true,
    syncExamples: options.syncExamples === true,
    examplesOnly: options.examplesOnly === true,
    profileFallback: options.profileFallback || profile.config.profileFallback || 'accept-satisfied',
  });

  const strict = options.strict === true;
  const ok = result.readiness.missing.length === 0 && (!strict || result.readiness.conflicts.length === 0);

  return {
    ok,
    profile: profile.profile,
    aliasWarning: profile.alias ? 'Profile alias "generic" is deprecated; using "forge-loop".' : null,
    pending: result.pending,
    changed: result.changed,
    backups: result.backups,
    readiness: result.readiness,
    discovery: result.state?.discovery,
    report: renderReconcileReport(result, profile.profile),
  };
}

export async function runDiff(options = {}) {
  const profile = await resolveProfile({ profile: options.profile });
  const result = await reconcileProject(profile.config, {
    app: options.app,
    mode: options.mode || 'local',
    write: false,
    syncExamples: false,
    profileFallback: options.profileFallback || profile.config.profileFallback || 'accept-satisfied',
  });

  return {
    ok: result.readiness.missing.length === 0,
    profile: profile.profile,
    aliasWarning: profile.alias ? 'Profile alias "generic" is deprecated; using "forge-loop".' : null,
    pending: result.pending,
    readiness: result.readiness,
    discovery: result.state?.discovery,
    report: renderReconcileReport(result, profile.profile),
  };
}

export async function runSyncExamples(options = {}) {
  const profile = await resolveProfile({ profile: options.profile });
  const result = await reconcileProject(profile.config, {
    app: options.app,
    mode: options.mode || 'local',
    write: options.write === true,
    syncExamples: true,
    examplesOnly: true,
    profileFallback: options.profileFallback || profile.config.profileFallback || 'accept-satisfied',
  });

  const pendingExamples = result.pending.filter((filePath) => filePath.endsWith('.env.example'));
  const ok = options.write === true
    ? result.readiness.missing.length === 0
    : (result.readiness.missing.length === 0 && pendingExamples.length === 0);

  return {
    ok,
    profile: profile.profile,
    aliasWarning: profile.alias ? 'Profile alias "generic" is deprecated; using "forge-loop".' : null,
    pending: result.pending,
    changed: result.changed,
    backups: result.backups,
    readiness: result.readiness,
    discovery: result.state?.discovery,
    report: renderReconcileReport(result, profile.profile),
  };
}

