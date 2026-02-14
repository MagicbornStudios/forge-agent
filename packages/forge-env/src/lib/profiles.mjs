import path from 'node:path';

import { FORGE_ENV_CONFIG_PATH, normalizeProfileId } from './constants.mjs';
import { readJson } from './io.mjs';
import { APP_ALIASES, APP_CONFIG, ENV_MANIFEST, SECTION_META } from './forge-agent-manifest.mjs';

function deepMerge(base, override) {
  if (!override || typeof override !== 'object') return { ...base };
  const result = { ...(base || {}) };
  for (const [key, value] of Object.entries(override)) {
    if (Array.isArray(value)) {
      result[key] = [...value];
      continue;
    }
    if (value && typeof value === 'object') {
      result[key] = deepMerge(base?.[key] || {}, value);
      continue;
    }
    result[key] = value;
  }
  return result;
}

function buildForgeAgentProfile() {
  const targets = Object.values(APP_CONFIG).map((config) => ({
    id: config.id,
    label: config.label,
    dir: config.dir,
    paths: {
      env: '.env',
      local: path.basename(config.envLocalPath || '.env.local'),
      development: path.basename(config.envDevelopmentPath || '.env.development.local'),
      production: path.basename(config.envProductionPath || '.env.production.local'),
      example: path.basename(config.envExamplePath || '.env.example'),
    },
  }));

  const entries = ENV_MANIFEST.map((entry) => ({
    target: entry.app,
    key: entry.key,
    section: entry.section,
    description: entry.description,
    exampleDefault: entry.exampleDefault,
    requiredIn: entry.requiredIn,
    secret: entry.secret === true,
    localOnly: entry.localOnly === true,
    dependsOn: entry.dependsOn,
  }));

  return {
    profile: 'forge-agent',
    targets,
    aliases: APP_ALIASES,
    entries,
    sectionMeta: SECTION_META,
    required: {
      local: [],
      preview: [],
      production: [],
      headless: [],
    },
    discovery: {
      enabled: true,
      workspaceGlobs: [],
      includePackages: true,
      ignorePatterns: [],
    },
    profileFallback: 'accept-satisfied',
    headless: {
      runner: 'openrouter',
      runners: {
        codex: {
          requires: ['codex_cli_installed', 'codex_chatgpt_login'],
        },
        openrouter: {
          requiresAny: [
            ['OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
          ],
        },
        custom: {},
      },
      allOf: [],
      anyOf: [
        ['OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
      ],
    },
    writePolicy: {
      preserveUnknown: true,
      preserveNonEmpty: true,
      backupOnWrite: true,
      createModeFiles: false,
    },
  };
}

function rootTarget() {
  return {
    id: 'root',
    label: 'Project root',
    dir: '.',
    paths: {
      env: '.env',
      local: '.env.local',
      development: '.env.development.local',
      production: '.env.production.local',
      example: '.env.example',
    },
  };
}

function buildForgeLoopProfile() {
  return {
    profile: 'forge-loop',
    targets: [rootTarget()],
    aliases: {},
    entries: [
      {
        target: 'root',
        key: 'OPENROUTER_API_KEY',
        section: 'headless',
        description: 'Optional provider key for OpenRouter-based headless runs.',
        secret: true,
      },
      {
        target: 'root',
        key: 'OPENAI_API_KEY',
        section: 'headless',
        description: 'Optional provider key for OpenAI-based headless runs.',
        secret: true,
      },
      {
        target: 'root',
        key: 'ANTHROPIC_API_KEY',
        section: 'headless',
        description: 'Optional provider key for Anthropic-based headless runs.',
        secret: true,
      },
      {
        target: 'root',
        key: 'AGENT_MODEL',
        section: 'headless',
        description: 'Optional model identifier used by your external headless runner.',
        exampleDefault: 'openrouter/openai/gpt-4o-mini',
      },
    ],
    sectionMeta: {
      root: {
        headless: {
          title: 'Headless agent runner',
          description: 'Set at least one provider key for unattended agent runs.',
        },
      },
    },
    required: {
      local: [],
      preview: [],
      production: [],
      headless: [],
    },
    discovery: {
      enabled: true,
      workspaceGlobs: [],
      includePackages: true,
      ignorePatterns: [],
    },
    profileFallback: 'accept-satisfied',
    headless: {
      runner: 'codex',
      runners: {
        codex: {
          requires: ['codex_cli_installed', 'codex_chatgpt_login'],
        },
        openrouter: {
          requiresAny: [
            ['OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
          ],
        },
        custom: {},
      },
      allOf: [],
      anyOf: [
        ['OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
      ],
    },
    writePolicy: {
      preserveUnknown: true,
      preserveNonEmpty: true,
      backupOnWrite: true,
      createModeFiles: false,
    },
  };
}

function buildCustomProfile() {
  return {
    profile: 'custom',
    targets: [rootTarget()],
    aliases: {},
    entries: [],
    sectionMeta: {
      root: {
        custom: {
          title: 'Custom keys',
          description: 'Add custom required keys in .forge-env/config.json',
        },
      },
    },
    required: {
      local: [],
      preview: [],
      production: [],
      headless: [],
    },
    discovery: {
      enabled: true,
      workspaceGlobs: [],
      includePackages: true,
      ignorePatterns: [],
    },
    profileFallback: 'accept-satisfied',
    headless: {
      runner: 'custom',
      runners: {
        codex: {
          requires: ['codex_cli_installed', 'codex_chatgpt_login'],
        },
        openrouter: {
          requiresAny: [
            ['OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
          ],
        },
        custom: {},
      },
      allOf: [],
      anyOf: [],
    },
    writePolicy: {
      preserveUnknown: true,
      preserveNonEmpty: true,
      backupOnWrite: true,
      createModeFiles: false,
    },
  };
}

export function defaultProfileConfig(profileId) {
  if (profileId === 'forge-agent') return buildForgeAgentProfile();
  if (profileId === 'custom') return buildCustomProfile();
  return buildForgeLoopProfile();
}

export async function loadProjectEnvConfig() {
  return readJson(FORGE_ENV_CONFIG_PATH, null);
}

export async function resolveProfile(options = {}) {
  const configOnDisk = await loadProjectEnvConfig();
  const requested = options.profile || configOnDisk?.profile;
  const normalized = normalizeProfileId(requested || 'forge-loop');
  const base = defaultProfileConfig(normalized.profile);

  const merged = deepMerge(base, configOnDisk || {});
  merged.profile = normalized.profile;

  if (!Array.isArray(merged.targets) || merged.targets.length === 0) {
    merged.targets = defaultProfileConfig(normalized.profile).targets;
  }
  if (!Array.isArray(merged.entries)) {
    merged.entries = [];
  }

  return {
    profile: normalized.profile,
    alias: normalized.alias,
    config: merged,
    configOnDisk,
  };
}

