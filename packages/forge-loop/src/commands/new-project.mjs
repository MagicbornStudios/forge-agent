import path from 'node:path';

import {
  DEFAULT_CONFIG,
  LEGACY_DECISIONS_PATH,
  LEGACY_ERRORS_PATH,
  LEGACY_STATUS_PATH,
  LEGACY_TASK_REGISTRY_PATH,
  PLANNING_FILES,
  PLANNING_PATH,
  PLANNING_PHASES_DIR,
  PLANNING_PROMPTS_DIR,
  toAbsPath,
} from '../lib/paths.mjs';
import { ensureDir, fileExists, writeJson, writeText } from '../lib/fs-utils.mjs';
import { assertCommitResult, commitPaths, formatArtifactCommitMessage } from '../lib/git.mjs';
import { ensureLoopIndex, writeLoopIndex } from '../lib/loops.mjs';
import { runMigrateLegacy } from './migrate-legacy.mjs';

const REQUIRED_PLANNING_FILES = [
  PLANNING_FILES.project,
  PLANNING_FILES.requirements,
  PLANNING_FILES.roadmap,
  PLANNING_FILES.state,
  PLANNING_FILES.decisions,
  PLANNING_FILES.errors,
  PLANNING_FILES.taskRegistry,
  PLANNING_FILES.tempRefactorBacklog,
  PLANNING_FILES.config,
];

function legacyFilesAvailable() {
  return [LEGACY_STATUS_PATH, LEGACY_TASK_REGISTRY_PATH, LEGACY_DECISIONS_PATH, LEGACY_ERRORS_PATH].every((item) => fileExists(toAbsPath(item)));
}

function normalizeProfile(profile) {
  const raw = String(profile || '').trim().toLowerCase();
  if (raw === 'generic') {
    return {
      profile: 'forge-loop',
      deprecatedAliasUsed: true,
    };
  }
  if (raw === 'forge-loop') {
    return {
      profile: 'forge-loop',
      deprecatedAliasUsed: false,
    };
  }
  if (raw === 'custom') {
    return {
      profile: 'custom',
      deprecatedAliasUsed: false,
    };
  }
  return {
    profile: 'forge-agent',
    deprecatedAliasUsed: false,
  };
}

function createFreshPlanning(profile = 'forge-agent') {
  const profileInfo = normalizeProfile(profile);
  const normalizedProfile = profileInfo.profile;
  const projectName = normalizedProfile === 'forge-agent' ? 'Forge Agent' : 'Project';
  const phaseTitle = normalizedProfile === 'forge-agent' ? 'Forge Loop bootstrap' : 'Initial product baseline';
  const phaseGoal = normalizedProfile === 'forge-agent'
    ? 'Establish lifecycle command baseline'
    : 'Establish lifecycle command baseline and first shippable phase.';

  ensureDir(PLANNING_PATH);
  ensureDir(PLANNING_PHASES_DIR);
  ensureDir(PLANNING_PROMPTS_DIR);

  writeText(
    PLANNING_FILES.project,
    `# ${projectName}\n\n## What This Is\n\nPlanning workspace initialized by forge-loop.\n\n## Core Value\n\nShip tested, traceable slices.\n\n## Requirements\n\n### Validated\n\nNone yet.\n\n### Active\n\n- [ ] Define migration baseline\n- [ ] Plan first implementation slice\n\n### Out of Scope\n\n- Full GSD parity in v1\n\n---\n*Last updated: ${new Date().toISOString()} after fresh initialization*\n`,
  );

  writeText(
    PLANNING_FILES.requirements,
    `# Requirements: ${projectName}\n\n## v1 Requirements\n\n- [ ] **REQ-01**: Initialize Forge Loop planning lifecycle\n- [ ] **REQ-02**: Create first phase plan and execution summary\n\n## Traceability\n\n| Requirement | Phase | Status |\n|---|---|---|\n| REQ-01 | Phase 01 | Pending |\n| REQ-02 | Phase 01 | Pending |\n`,
  );

  writeText(
    PLANNING_FILES.roadmap,
    `# Roadmap: ${projectName}\n\n## Overview\n\nInitial roadmap for Forge Loop lifecycle adoption.\n\n## Phases\n\n- [ ] **Phase 01: ${phaseTitle}** - ${phaseGoal}\n\n## Phase Details\n\n### Phase 01: ${phaseTitle}\n**Goal:** ${phaseGoal}\n**Depends on:** Nothing\n**Requirements:** [REQ-01, REQ-02]\n**Plans:** 0 plans\n\nPlans:\n- [ ] 01-01: TBD (run \`forge-loop plan-phase 01\`)\n\n## Progress\n\n| Phase | Plans Complete | Status | Completed |\n|---|---|---|---|\n| 01. ${phaseTitle} | 0/0 | Not started | - |\n`,
  );

  writeText(
    PLANNING_FILES.state,
    `# Project State\n\n## Current Position\n\nPhase: 01 of 01\nPlan: 00 of 00\nStatus: Ready to discuss\nLast activity: ${new Date().toISOString()} - Fresh initialization\n\nProgress: [..........] 0%\n`,
  );

  writeText(PLANNING_FILES.decisions, '# Decisions\n\nNo decisions recorded yet.\n');
  writeText(PLANNING_FILES.errors, '# Errors and Attempts\n\nNo errors recorded yet.\n');
  writeText(PLANNING_FILES.taskRegistry, '# Task Registry\n\nNo tasks recorded yet.\n');
  writeText(
    PLANNING_FILES.tempRefactorBacklog,
    `# Temporary Migration and Refactor Backlog

Use this temporary queue while migrating into Forge Loop.

## Immediate Refactors

- [ ] Inventory unstable modules and link to impacted plans
- [ ] List ownership per area (\`apps/studio\`, \`apps/platform\`, \`packages/*\`)
- [ ] Capture blocking technical debt that must be resolved before phase execution

## Migration Tasks

- [ ] Validate legacy import quality and parsing gaps
- [ ] Document source-of-truth transitions to \`.planning\`
- [ ] Track one-way legacy sync checkpoints

## Notes

- Keep this file short and actionable.
- Move completed work into phase summaries and decisions.
`,
  );
  const config = {
    ...DEFAULT_CONFIG,
    verification: {
      ...DEFAULT_CONFIG.verification,
      profile: normalizedProfile === 'forge-agent' ? 'forge-agent' : 'forge-loop',
    },
    env: {
      ...DEFAULT_CONFIG.env,
      profile: normalizedProfile,
    },
  };
  writeJson(PLANNING_FILES.config, config);
  writeText(path.join(PLANNING_PROMPTS_DIR, 'README.md'), '# Forge Loop Prompt Packs\n\nGenerated prompts appear here.\n');

  writeJson(PLANNING_FILES.migrationReport, {
    migratedAt: new Date().toISOString(),
    mode: 'fresh',
    warnings: [],
    sources: {},
  });

  return {
    profileInfo,
    written: REQUIRED_PLANNING_FILES.concat([PLANNING_FILES.migrationReport, path.join(PLANNING_PROMPTS_DIR, 'README.md')]),
  };
}

function validatePlanningTree() {
  const missing = REQUIRED_PLANNING_FILES.filter((filePath) => !fileExists(filePath));
  return {
    valid: missing.length === 0,
    missing,
  };
}

export async function runNewProject(options = {}) {
  const { fresh = false, autoCommit = true, profile = 'forge-agent' } = options;
  const profileInfo = normalizeProfile(profile);

  if (fileExists(PLANNING_PATH)) {
    ensureLoopIndex();
    const validation = validatePlanningTree();
    return {
      alreadyExists: true,
      validation,
      message: validation.valid
        ? '.planning already exists and is valid. Use forge-loop progress.'
        : '.planning exists but is missing required files. Run forge-loop migrate-legacy or repair manually.',
    };
  }

  let written = [];
  let migrationReport = null;

  if (!fresh && legacyFilesAvailable()) {
    const migration = await runMigrateLegacy();
    written = migration.written;
    migrationReport = migration.report;
  } else {
    const freshResult = createFreshPlanning(profileInfo.profile);
    written = freshResult.written;
  }

  const createdLoopIndex = ensureLoopIndex();
  if (createdLoopIndex) {
    writeLoopIndex({
      activeLoopId: 'default',
      loops: [
        {
          id: 'default',
          name: 'Default Repo Loop',
          planningRoot: '.planning',
          scope: ['.'],
          profile: profileInfo.profile,
          runner: DEFAULT_CONFIG.env.runner,
        },
      ],
    });
  }
  written.push(path.join('.planning', 'LOOPS.json'));

  if (autoCommit) {
    const commitFiles = written
      .filter((filePath) => fileExists(filePath))
      .map((filePath) => path.relative(process.cwd(), filePath).replace(/\\/g, '/'))
      .filter((filePath) => !filePath.endsWith('/'));

    const commitResult = commitPaths(
      process.cwd(),
      formatArtifactCommitMessage('initialize planning workspace'),
      commitFiles,
      { commitScope: DEFAULT_CONFIG.git.commitScope },
    );
    assertCommitResult(commitResult, 'new-project');
  }

  return {
    alreadyExists: false,
    fresh,
    profile: profileInfo.profile,
    usedMigration: !fresh && legacyFilesAvailable(),
    written,
    migrationReport,
    message: profileInfo.deprecatedAliasUsed
      ? 'Profile alias "generic" is deprecated; using "forge-loop".'
      : undefined,
  };
}
