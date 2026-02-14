import { isValueSet } from './io.mjs';
import { checkCodexReadiness } from './codex.mjs';

function isConditionSatisfied(condition, values) {
  if (!condition) return true;
  const value = values?.[condition.key];
  if (condition.equals != null) return value === condition.equals;
  if (condition.notEquals != null) return value !== condition.notEquals;
  if (condition.truthy === true) return isValueSet(value);
  return true;
}

function requiredForMode(entry, mode, values) {
  if (!Array.isArray(entry.requiredIn)) return false;
  if (!entry.requiredIn.includes(mode)) return false;
  return isConditionSatisfied(entry.dependsOn, values);
}

function evaluateAnyOfGroups(anyOfGroups, valueUniverse) {
  const missing = [];
  for (const group of anyOfGroups) {
    const keys = Array.isArray(group) ? group : [];
    if (keys.length === 0) continue;
    const satisfied = keys.some((key) => isValueSet(valueUniverse[key]));
    if (!satisfied) {
      missing.push(`anyOf(${keys.join(' | ')})`);
    }
  }
  return missing;
}

function normalizeRunner(runner) {
  const normalized = String(runner || '').trim().toLowerCase();
  if (normalized === 'codex' || normalized === 'custom') return normalized;
  return 'openrouter';
}

function evaluateOpenrouterRequirements(headless, valueUniverse) {
  const missing = [];
  const warnings = [];
  const runnerConfig = headless?.runners?.openrouter || {};

  const allOf = Array.isArray(runnerConfig.requires) && runnerConfig.requires.length > 0
    ? runnerConfig.requires
    : (Array.isArray(headless?.allOf) ? headless.allOf : []);
  for (const key of allOf) {
    if (!isValueSet(valueUniverse[key])) {
      missing.push(key);
    }
  }

  const anyOfGroups = Array.isArray(runnerConfig.requiresAny) && runnerConfig.requiresAny.length > 0
    ? runnerConfig.requiresAny
    : (Array.isArray(headless?.anyOf) ? headless.anyOf : []);
  missing.push(...evaluateAnyOfGroups(anyOfGroups, valueUniverse));
  if (missing.length === 0 && anyOfGroups.length > 0) {
    warnings.push('Headless requirements satisfied by at least one provider key group.');
  }

  return {
    missing,
    warnings,
    checks: {
      runner: 'openrouter',
      codexCliInstalled: null,
      codexLoginChatgpt: null,
    },
  };
}

function evaluateCodexRequirements(headless) {
  const missing = [];
  const warnings = [];
  const runnerConfig = headless?.runners?.codex || {};
  const codexCommand = String(runnerConfig.command || 'codex').trim() || 'codex';
  const requiredChecks = Array.isArray(runnerConfig.requires) && runnerConfig.requires.length > 0
    ? runnerConfig.requires
    : ['codex_cli_installed', 'codex_chatgpt_login'];
  const codex = checkCodexReadiness(codexCommand);

  if (requiredChecks.includes('codex_cli_installed') && !codex.codexCliInstalled) {
    missing.push('codex_cli_installed');
  }
  if (requiredChecks.includes('codex_chatgpt_login') && !codex.codexLoginChatgpt) {
    missing.push('codex_chatgpt_login');
  }
  if (codex.codexCliInstalled && codex.loginAuthType === 'other') {
    warnings.push('Codex login detected, but not ChatGPT auth. chatgpt-strict requires ChatGPT login.');
  }

  return {
    missing,
    warnings,
    checks: {
      runner: 'codex',
      codexCliInstalled: codex.codexCliInstalled,
      codexLoginChatgpt: codex.codexLoginChatgpt,
      codexVersion: codex.codexVersion,
      codexLoginAuthType: codex.loginAuthType,
    },
  };
}

function evaluateHeadlessRequirements(profileConfig, valueUniverse, options = {}) {
  const headless = profileConfig.headless || {};
  const selectedRunner = normalizeRunner(options.runner || headless.runner || 'openrouter');
  if (selectedRunner === 'codex') {
    return {
      ...evaluateCodexRequirements(headless),
      runner: selectedRunner,
    };
  }

  if (selectedRunner === 'custom') {
    return {
      missing: [],
      warnings: [],
      checks: {
        runner: 'custom',
        codexCliInstalled: null,
        codexLoginChatgpt: null,
      },
      runner: selectedRunner,
    };
  }

  return {
    ...evaluateOpenrouterRequirements(headless, valueUniverse),
    runner: selectedRunner,
  };
}

function modeRequirements(profileConfig, mode) {
  const required = profileConfig.required || {};
  return Array.isArray(required[mode]) ? required[mode] : [];
}

function evaluateTargetMissing(targetState, profileConfig, mode, valueUniverse, fallbackMode = 'accept-satisfied') {
  const missing = [];
  const warnings = [];

  const values = targetState.mergedValues;
  const perEntryMissing = [];

  for (const entry of targetState.entries) {
    if (!requiredForMode(entry, mode, values)) continue;
    if (isValueSet(values[entry.key])) continue;

    if (fallbackMode === 'accept-satisfied' && isValueSet(valueUniverse[entry.key])) {
      warnings.push(`${targetState.target.id}:${entry.key} satisfied from alternate env source.`);
      continue;
    }

    perEntryMissing.push(entry.key);
  }

  const additionalRequired = modeRequirements(profileConfig, mode);
  for (const key of additionalRequired) {
    if (isValueSet(values[key])) continue;
    if (fallbackMode === 'accept-satisfied' && isValueSet(valueUniverse[key])) {
      warnings.push(`${targetState.target.id}:${key} satisfied from alternate env source.`);
      continue;
    }
    perEntryMissing.push(key);
  }

  if (perEntryMissing.length > 0) {
    missing.push(...perEntryMissing.map((key) => `${targetState.target.id}:${key}`));
  }

  return { missing, warnings };
}

export function evaluateReadiness(state, mode, options = {}) {
  const fallbackMode = options.profileFallback || 'accept-satisfied';
  const missing = [];
  const warnings = [];
  const conflicts = [];
  let runnerChecks = {
    runner: 'openrouter',
    codexCliInstalled: null,
    codexLoginChatgpt: null,
  };
  let selectedRunner = 'openrouter';
  let runnerSatisfied = true;

  for (const target of state.targets) {
    const status = evaluateTargetMissing(target, state.profileConfig, mode, state.valueUniverse, fallbackMode);
    missing.push(...status.missing);
    warnings.push(...status.warnings);
    conflicts.push(...target.conflicts.map((item) => `${target.target.id}:${item.key}`));
  }

  if (mode === 'headless') {
    const headlessStatus = evaluateHeadlessRequirements(state.profileConfig, state.valueUniverse, {
      runner: options.runner,
    });
    missing.push(...headlessStatus.missing);
    warnings.push(...headlessStatus.warnings);
    selectedRunner = headlessStatus.runner || selectedRunner;
    runnerChecks = {
      ...runnerChecks,
      ...(headlessStatus.checks || {}),
    };
    runnerSatisfied = headlessStatus.missing.length === 0;
  }

  if (state.discovery?.manifestMissingDirs?.length > 0) {
    warnings.push(...state.discovery.manifestMissingDirs.map((item) => `manifest target dir missing: ${item}`));
  }

  if (state.discovery?.discoveredWithoutManifest?.length > 0) {
    warnings.push(
      ...state.discovery.discoveredWithoutManifest.map((item) => `discovered target not in manifest: ${item}`),
    );
  }

  return {
    ok: missing.length === 0,
    missing,
    warnings,
    conflicts,
    runner: mode === 'headless' ? selectedRunner : null,
    runnerSatisfied: mode === 'headless' ? runnerSatisfied : null,
    runnerChecks: mode === 'headless' ? runnerChecks : null,
  };
}
