import path from 'node:path';

import { DEFAULT_CONFIG } from '../lib/paths.mjs';
import { ensureDir, fileExists, writeJson, writeText } from '../lib/fs-utils.mjs';
import {
  LOOPS_INDEX_RELATIVE_PATH,
  ensureLoopIndex,
  isValidLoopId,
  loadLoopIndex,
  planningRootForLoop,
  upsertLoop,
  writeLoopIndex,
} from '../lib/loops.mjs';

function normalizeProfile(profile) {
  const raw = String(profile || '').trim().toLowerCase();
  if (raw === 'generic') {
    return { profile: 'forge-loop', deprecatedAliasUsed: true };
  }
  if (raw === 'forge-loop') return { profile: 'forge-loop', deprecatedAliasUsed: false };
  if (raw === 'custom') return { profile: 'custom', deprecatedAliasUsed: false };
  return { profile: 'forge-agent', deprecatedAliasUsed: false };
}

function normalizeRunner(runner) {
  const raw = String(runner || '').trim().toLowerCase();
  if (raw === 'openrouter' || raw === 'custom') return raw;
  return 'codex';
}

function normalizeScope(scopeInput) {
  if (!scopeInput) return ['.'];
  const values = String(scopeInput)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length > 0 ? [...new Set(values)] : ['.'];
}

function loopPaths(planningRoot) {
  const root = String(planningRoot).replace(/\\/g, '/');
  return {
    root,
    phases: `${root}/phases`,
    prompts: `${root}/prompts`,
    project: `${root}/PROJECT.md`,
    requirements: `${root}/REQUIREMENTS.md`,
    roadmap: `${root}/ROADMAP.md`,
    state: `${root}/STATE.md`,
    decisions: `${root}/DECISIONS.md`,
    errors: `${root}/ERRORS.md`,
    taskRegistry: `${root}/TASK-REGISTRY.md`,
    tempRefactorBacklog: `${root}/TEMP-REFACTOR-BACKLOG.md`,
    config: `${root}/config.json`,
    migrationReport: `${root}/migration-report.json`,
  };
}

function buildPlanningConfig(profile, runner) {
  return {
    ...DEFAULT_CONFIG,
    verification: {
      ...DEFAULT_CONFIG.verification,
      profile: profile === 'forge-agent' ? 'forge-agent' : 'forge-loop',
    },
    env: {
      ...DEFAULT_CONFIG.env,
      profile,
      runner,
    },
  };
}

function createLoopScaffold({ loopId, name, planningRoot, profile, runner }) {
  const now = new Date().toISOString();
  const files = loopPaths(planningRoot);

  ensureDir(path.join(process.cwd(), files.root));
  ensureDir(path.join(process.cwd(), files.phases));
  ensureDir(path.join(process.cwd(), files.prompts));

  writeText(
    path.join(process.cwd(), files.project),
    `# ${name}\n\n## What This Is\n\nDedicated Forge Loop track for \`${loopId}\`.\n\n## Core Value\n\nShip tested, traceable slices for this loop scope.\n\n## Requirements\n\n### Validated\n\nNone yet.\n\n### Active\n\n- [ ] Define loop-specific migration baseline\n- [ ] Plan first loop slice\n\n### Out of Scope\n\n- Cross-loop artifact mutation without explicit synchronization\n\n---\n*Last updated: ${now} after loop initialization*\n`,
  );

  writeText(
    path.join(process.cwd(), files.requirements),
    `# Requirements: ${name}\n\n## v1 Requirements\n\n- [ ] **REQ-01**: Initialize loop lifecycle artifacts\n- [ ] **REQ-02**: Produce first plan + execution summary\n\n## Traceability\n\n| Requirement | Phase | Status |\n|---|---|---|\n| REQ-01 | Phase 01 | Pending |\n| REQ-02 | Phase 01 | Pending |\n`,
  );

  writeText(
    path.join(process.cwd(), files.roadmap),
    `# Roadmap: ${name}\n\n## Overview\n\nLoop-specific roadmap for \`${loopId}\`.\n\n## Phases\n\n- [ ] **Phase 01: Loop bootstrap** - Establish lifecycle command baseline for this loop scope\n\n## Phase Details\n\n### Phase 01: Loop bootstrap\n**Goal:** Establish lifecycle command baseline for this loop scope.\n**Depends on:** Nothing\n**Requirements:** [REQ-01, REQ-02]\n**Plans:** 0 plans\n\nPlans:\n- [ ] 01-01: TBD (run \`forge-loop plan-phase 01 --loop ${loopId}\`)\n\n## Progress\n\n| Phase | Plans Complete | Status | Completed |\n|---|---|---|---|\n| 01. Loop bootstrap | 0/0 | Not started | - |\n`,
  );

  writeText(
    path.join(process.cwd(), files.state),
    `# Project State\n\n## Current Position\n\nPhase: 01 of 01\nPlan: 00 of 00\nStatus: Ready to discuss\nLast activity: ${now} - Loop initialized\n\nProgress: [..........] 0%\n`,
  );

  writeText(path.join(process.cwd(), files.decisions), '# Decisions\n\nNo decisions recorded yet.\n');
  writeText(path.join(process.cwd(), files.errors), '# Errors and Attempts\n\nNo errors recorded yet.\n');
  writeText(path.join(process.cwd(), files.taskRegistry), '# Task Registry\n\nNo tasks recorded yet.\n');
  writeText(
    path.join(process.cwd(), files.tempRefactorBacklog),
    `# Temporary Migration and Refactor Backlog\n\nUse this queue while stabilizing loop \`${loopId}\`.\n\n## Immediate Refactors\n\n- [ ] Inventory unstable modules for this loop scope\n- [ ] Capture blocking technical debt\n\n## Migration Tasks\n\n- [ ] Validate source artifacts imported into this loop\n- [ ] Track sync checkpoints for shared docs\n`,
  );
  writeJson(path.join(process.cwd(), files.config), buildPlanningConfig(profile, runner));
  writeText(path.join(process.cwd(), files.prompts, 'README.md'), '# Forge Loop Prompt Packs\n\nGenerated prompts appear here.\n');
  writeJson(path.join(process.cwd(), files.migrationReport), {
    migratedAt: now,
    mode: 'loop-new',
    warnings: [],
    sources: {},
  });

  return [
    files.project,
    files.requirements,
    files.roadmap,
    files.state,
    files.decisions,
    files.errors,
    files.taskRegistry,
    files.tempRefactorBacklog,
    files.config,
    files.migrationReport,
    `${files.prompts}/README.md`,
  ];
}

export async function runLoopNew(loopId, options = {}) {
  const normalizedId = String(loopId || '').trim().toLowerCase();
  if (!isValidLoopId(normalizedId)) {
    throw new Error('loop:new requires a valid loop id (lowercase letters, numbers, "-", "_").');
  }

  ensureLoopIndex();
  const current = loadLoopIndex();
  if (current.loops.some((loop) => loop.id === normalizedId)) {
    throw new Error(`Loop "${normalizedId}" already exists. Use "forge-loop loop:use ${normalizedId}".`);
  }

  const profileInfo = normalizeProfile(options.profile);
  const runner = normalizeRunner(options.runner);
  const planningRoot = planningRootForLoop(normalizedId);
  const rootAbs = path.join(process.cwd(), planningRoot);
  if (fileExists(rootAbs)) {
    throw new Error(`Planning root already exists at ${planningRoot}. Pick a different loop id or remove the directory.`);
  }

  const name = String(options.name || normalizedId).trim() || normalizedId;
  const scope = normalizeScope(options.scope);
  const written = createLoopScaffold({
    loopId: normalizedId,
    name,
    planningRoot,
    profile: profileInfo.profile,
    runner,
  });

  const updated = upsertLoop(current, {
    id: normalizedId,
    name,
    planningRoot,
    scope,
    profile: profileInfo.profile,
    runner,
  });
  const nextIndex = writeLoopIndex({
    ...updated,
    activeLoopId: normalizedId,
  });

  return {
    ok: true,
    loopId: normalizedId,
    activeLoopId: nextIndex.activeLoopId,
    planningRoot,
    profile: profileInfo.profile,
    runner,
    scope,
    written,
    indexPath: LOOPS_INDEX_RELATIVE_PATH,
    message: profileInfo.deprecatedAliasUsed
      ? 'Profile alias "generic" is deprecated; using "forge-loop".'
      : undefined,
    report: [
      `Created loop "${normalizedId}" with planning root ${planningRoot}.`,
      `Active loop: ${nextIndex.activeLoopId}`,
      `Index: ${LOOPS_INDEX_RELATIVE_PATH}`,
    ].join('\n') + '\n',
  };
}

