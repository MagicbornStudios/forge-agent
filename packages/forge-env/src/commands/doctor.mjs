import process from 'node:process';

import { collectProjectState, evaluateReadiness } from '../lib/engine.mjs';
import { resolveProfile } from '../lib/profiles.mjs';
import { discoveryLines } from '../lib/reporting.mjs';
import { runPortal } from './portal.mjs';

function buildTable(state, mode, readiness) {
  const lines = [
    '# forge-env doctor',
    '',
    `profile: ${state.profileConfig.profile}`,
    `mode: ${mode}`,
    '',
    '| Target | Keys | Missing | Conflicts |',
    '|---|---:|---:|---:|',
  ];

  for (const target of state.targets) {
    const missingCount = readiness.missing.filter((item) => item.startsWith(`${target.target.id}:`)).length;
    const conflictCount = target.conflicts.length;
    lines.push(`| ${target.target.id} | ${target.unionKeys.length} | ${missingCount} | ${conflictCount} |`);
  }

  if (readiness.missing.length > 0) {
    lines.push('', '## Missing Required', ...readiness.missing.map((item) => `- ${item}`));
  }

  if (readiness.conflicts.length > 0) {
    lines.push('', '## Conflicts', ...readiness.conflicts.map((item) => `- ${item}`));
  }

  if (readiness.warnings.length > 0) {
    lines.push('', '## Warnings', ...readiness.warnings.map((item) => `- ${item}`));
  }

  if (mode === 'headless') {
    lines.push('', '## Headless Runner');
    lines.push(`- runner: ${readiness.runner || 'unknown'}`);
    lines.push(`- runner satisfied: ${readiness.runnerSatisfied ? 'yes' : 'no'}`);
    if (readiness.runnerChecks) {
      if (readiness.runnerChecks.codexCliInstalled != null) {
        lines.push(`- codex cli installed: ${readiness.runnerChecks.codexCliInstalled ? 'yes' : 'no'}`);
      }
      if (readiness.runnerChecks.codexLoginChatgpt != null) {
        lines.push(`- codex chatgpt login: ${readiness.runnerChecks.codexLoginChatgpt ? 'yes' : 'no'}`);
      }
      if (readiness.runnerChecks.codexVersion) {
        lines.push(`- codex version: ${readiness.runnerChecks.codexVersion}`);
      }
      if (readiness.runnerChecks.codexLoginAuthType) {
        lines.push(`- codex login auth type: ${readiness.runnerChecks.codexLoginAuthType}`);
      }
    }
  }

  lines.push(...discoveryLines(state.discovery));

  return `${lines.join('\n')}\n`;
}

export async function runDoctor(options = {}) {
  const resolvedProfile = await resolveProfile({ profile: options.profile });
  const mode = options.mode || 'local';

  let state = await collectProjectState(resolvedProfile.config, { app: options.app });
  let readiness = evaluateReadiness(state, mode, {
    profileFallback: options.profileFallback || resolvedProfile.config.profileFallback || 'accept-satisfied',
    runner: options.runner,
  });

  const canBootstrap = options.bootstrap === true && process.stdin.isTTY && process.stdout.isTTY;
  if (!readiness.ok && canBootstrap) {
    await runPortal({
      profile: resolvedProfile.profile,
      mode,
      app: options.app,
      bootstrap: true,
      openBrowser: true,
    });

    state = await collectProjectState(resolvedProfile.config, { app: options.app });
    readiness = evaluateReadiness(state, mode, {
      profileFallback: options.profileFallback || resolvedProfile.config.profileFallback || 'accept-satisfied',
      runner: options.runner,
    });
  }

  const strict = options.strict === true;
  const ok = readiness.ok && (!strict || readiness.conflicts.length === 0);

  const result = {
    ok,
    mode,
    profile: resolvedProfile.profile,
    aliasWarning: resolvedProfile.alias ? 'Profile alias "generic" is deprecated; using "forge-loop".' : null,
    missing: readiness.missing,
    conflicts: readiness.conflicts,
    warnings: readiness.warnings,
    runner: readiness.runner,
    runnerSatisfied: readiness.runnerSatisfied,
    codexCliInstalled: readiness.runnerChecks?.codexCliInstalled ?? null,
    codexLoginChatgpt: readiness.runnerChecks?.codexLoginChatgpt ?? null,
    runnerChecks: readiness.runnerChecks || null,
    discovery: state.discovery,
    report: buildTable(state, mode, readiness),
  };

  if (strict && readiness.conflicts.length > 0) {
    result.warnings.push('Strict mode enabled: conflicts must be resolved.');
  }

  return result;
}

