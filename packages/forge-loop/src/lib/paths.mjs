import path from 'node:path';

export const REPO_ROOT = process.cwd();

export const ROOT_PLANNING_DIR = '.planning';
export const ACTIVE_LOOP_ID = process.env.FORGE_LOOP_LOOP_ID || 'default';
export const PLANNING_DIR = process.env.FORGE_LOOP_PLANNING_DIR || ROOT_PLANNING_DIR;
export const PLANNING_PATH = path.join(REPO_ROOT, PLANNING_DIR);
export const PLANNING_PHASES_DIR = path.join(PLANNING_PATH, 'phases');
export const PLANNING_PROMPTS_DIR = path.join(PLANNING_PATH, 'prompts');
export const LOOPS_INDEX_PATH = path.join(REPO_ROOT, ROOT_PLANNING_DIR, 'LOOPS.json');

export const LEGACY_CORE_DIR = path.join('docs', 'agent-artifacts', 'core');
export const LEGACY_STATUS_PATH = path.join(LEGACY_CORE_DIR, 'STATUS.md');
export const LEGACY_TASK_REGISTRY_PATH = path.join(LEGACY_CORE_DIR, 'task-registry.md');
export const LEGACY_DECISIONS_PATH = path.join(LEGACY_CORE_DIR, 'decisions.md');
export const LEGACY_ERRORS_PATH = path.join(LEGACY_CORE_DIR, 'errors-and-attempts.md');

export const LEGACY_SYNC_TARGETS = [
  LEGACY_STATUS_PATH,
  LEGACY_TASK_REGISTRY_PATH,
  LEGACY_DECISIONS_PATH,
  LEGACY_ERRORS_PATH,
];

export const DEFAULT_COMMIT_SCOPE = [
  '.planning/**',
  'docs/agent-artifacts/core/**',
];

export const GENERATED_START_MARKER = '<!-- forge-loop:generated:start -->';
export const GENERATED_END_MARKER = '<!-- forge-loop:generated:end -->';

export const DEFAULT_CONFIG = {
  mode: 'interactive',
  runtime: {
    mode: 'prompt-pack',
    codex: {
      transport: 'app-server',
      execFallbackAllowed: false,
      approvalMode: 'on-request',
      sandboxMode: 'workspace-write',
      defaultModel: 'gpt-5',
    },
  },
  scope: 'monorepo',
  git: {
    autoCommit: true,
    commitPrefix: 'forge-loop',
    commitScope: DEFAULT_COMMIT_SCOPE,
  },
  verification: {
    docs: true,
    build: true,
    tests: true,
    profile: 'forge-agent',
    strictDefault: true,
  },
  env: {
    enabled: true,
    profile: 'forge-agent',
    runner: 'codex',
    enforceHeadless: true,
    autoLaunchPortal: true,
    command: 'forge-env',
    profileFallback: 'accept-satisfied',
  },
  legacySync: {
    enabled: true,
    targets: LEGACY_SYNC_TARGETS,
  },
};

export const PLANNING_FILES = {
  project: path.join(PLANNING_PATH, 'PROJECT.md'),
  requirements: path.join(PLANNING_PATH, 'REQUIREMENTS.md'),
  roadmap: path.join(PLANNING_PATH, 'ROADMAP.md'),
  state: path.join(PLANNING_PATH, 'STATE.md'),
  decisions: path.join(PLANNING_PATH, 'DECISIONS.md'),
  errors: path.join(PLANNING_PATH, 'ERRORS.md'),
  taskRegistry: path.join(PLANNING_PATH, 'TASK-REGISTRY.md'),
  tempRefactorBacklog: path.join(PLANNING_PATH, 'TEMP-REFACTOR-BACKLOG.md'),
  config: path.join(PLANNING_PATH, 'config.json'),
  migrationReport: path.join(PLANNING_PATH, 'migration-report.json'),
};

export function toAbsPath(relPath) {
  return path.isAbsolute(relPath) ? relPath : path.join(REPO_ROOT, relPath);
}

export function normalizePhaseNumber(rawPhase) {
  const text = String(rawPhase || '').trim();
  if (!text) return null;

  const parts = text.split('.');
  if (parts.length > 2) return null;
  if (!parts.every((segment) => /^\d+$/.test(segment))) return null;

  const major = parts[0].padStart(2, '0');
  if (parts.length === 1) return major;

  const minor = String(Number(parts[1]));
  return `${major}.${minor}`;
}

export function phaseFilePrefix(phaseNumber) {
  return normalizePhaseNumber(phaseNumber)?.replace(/\./g, '_') ?? null;
}

export function parseSimpleFlags(argv) {
  const positional = [];
  const flags = new Map();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }

    const keyValue = token.slice(2).split('=');
    const key = keyValue[0];
    if (!key) continue;

    if (keyValue.length > 1) {
      flags.set(key, keyValue.slice(1).join('='));
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      flags.set(key, next);
      i += 1;
      continue;
    }

    flags.set(key, true);
  }

  return { positional, flags };
}
