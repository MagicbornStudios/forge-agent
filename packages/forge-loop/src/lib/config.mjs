import { readJson } from './fs-utils.mjs';
import { DEFAULT_CONFIG, LEGACY_SYNC_TARGETS, PLANNING_FILES } from './paths.mjs';

function mergeObjects(base, override) {
  const safeBase = base && typeof base === 'object' && !Array.isArray(base) ? base : {};
  const result = { ...safeBase };
  if (!override || typeof override !== 'object') return result;

  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      result[key] = [...value];
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = mergeObjects(base?.[key] || {}, value);
      continue;
    }

    result[key] = value;
  }

  return result;
}

function normalizeRuntimeMode(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'codex' || raw === 'auto') return raw;
  return 'prompt-pack';
}

function normalizeCodexTransport(value) {
  return String(value || '').trim().toLowerCase() === 'exec' ? 'exec' : 'app-server';
}

function normalizeCodexApprovalMode(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'never' || raw === 'untrusted') return raw;
  return 'on-request';
}

function normalizeCodexSandboxMode(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'read-only' || raw === 'danger-full-access') return raw;
  return 'workspace-write';
}

function normalizeRuntimeSettings(value, defaults = DEFAULT_CONFIG.runtime) {
  const defaultCodex = defaults?.codex || {};

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const codex = value.codex && typeof value.codex === 'object' ? value.codex : {};
    return {
      mode: normalizeRuntimeMode(value.mode),
      codex: {
        transport: normalizeCodexTransport(codex.transport || defaultCodex.transport),
        execFallbackAllowed: codex.execFallbackAllowed === true,
        approvalMode: normalizeCodexApprovalMode(codex.approvalMode || defaultCodex.approvalMode),
        sandboxMode: normalizeCodexSandboxMode(codex.sandboxMode || defaultCodex.sandboxMode),
        defaultModel: String(codex.defaultModel || defaultCodex.defaultModel || 'gpt-5'),
      },
    };
  }

  return {
    mode: normalizeRuntimeMode(value),
    codex: {
      transport: normalizeCodexTransport(defaultCodex.transport),
      execFallbackAllowed: defaultCodex.execFallbackAllowed === true,
      approvalMode: normalizeCodexApprovalMode(defaultCodex.approvalMode),
      sandboxMode: normalizeCodexSandboxMode(defaultCodex.sandboxMode),
      defaultModel: String(defaultCodex.defaultModel || 'gpt-5'),
    },
  };
}

export function loadPlanningConfig() {
  const onDisk = readJson(PLANNING_FILES.config, null) || {};
  const merged = mergeObjects(DEFAULT_CONFIG, onDisk);
  const runtimeSettings = normalizeRuntimeSettings(merged.runtime);
  return {
    ...merged,
    runtime: runtimeSettings.mode,
    runtimeSettings,
  };
}

export function getRuntimeSettings(config = null) {
  const resolved = config || loadPlanningConfig();
  if (resolved.runtimeSettings) return resolved.runtimeSettings;
  return normalizeRuntimeSettings(resolved.runtime);
}

export function getAutoCommitEnabled(config = null) {
  const resolved = config || loadPlanningConfig();
  return resolved?.git?.autoCommit !== false;
}

export function getCommitScope(config = null) {
  const resolved = config || loadPlanningConfig();
  const configured = resolved?.git?.commitScope;
  if (Array.isArray(configured) && configured.length > 0) return configured;
  return [...DEFAULT_CONFIG.git.commitScope];
}

export function getVerificationProfile(config = null) {
  const resolved = config || loadPlanningConfig();
  const profile = String(resolved?.verification?.profile || '').trim().toLowerCase();
  if (profile === 'generic') return 'forge-loop';
  if (profile === 'forge-loop') return 'forge-loop';
  if (profile === 'custom') return 'forge-loop';
  return 'forge-agent';
}

export function isStrictVerificationEnabled(config = null, strictFlag = undefined) {
  if (typeof strictFlag === 'boolean') return strictFlag;
  const resolved = config || loadPlanningConfig();
  return resolved?.verification?.strictDefault !== false;
}

export function isLegacySyncEnabled(config = null) {
  const resolved = config || loadPlanningConfig();
  return resolved?.legacySync?.enabled !== false;
}

export function getLegacySyncTargets(config = null) {
  const resolved = config || loadPlanningConfig();
  const configured = resolved?.legacySync?.targets;
  if (Array.isArray(configured) && configured.length > 0) return configured;
  return [...LEGACY_SYNC_TARGETS];
}

export function getEnvSettings(config = null) {
  const resolved = config || loadPlanningConfig();
  const env = resolved?.env || {};
  const defaults = DEFAULT_CONFIG.env;
  const profileRaw = String(env.profile || defaults.profile || 'forge-agent').trim().toLowerCase();
  const normalizedProfile = profileRaw === 'generic'
    ? 'forge-loop'
    : (profileRaw === 'forge-loop' || profileRaw === 'custom' ? profileRaw : 'forge-agent');
  const runnerRaw = String(env.runner || defaults.runner || 'codex').trim().toLowerCase();
  const normalizedRunner = runnerRaw === 'openrouter' || runnerRaw === 'custom' ? runnerRaw : 'codex';

  return {
    enabled: env.enabled !== false,
    profile: normalizedProfile,
    runner: normalizedRunner,
    enforceHeadless: env.enforceHeadless !== false,
    autoLaunchPortal: env.autoLaunchPortal !== false,
    command: String(env.command || defaults.command || 'forge-env').trim() || 'forge-env',
    profileFallback: String(env.profileFallback || defaults.profileFallback || 'accept-satisfied'),
  };
}
