import fs from 'node:fs';
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
  normalizePhaseNumber,
} from '../lib/paths.mjs';
import { ensureDir, readText, writeJson, writeText } from '../lib/fs-utils.mjs';
import {
  buildMigrationWarnings,
  parseNextItems,
  parseRalphDoneItems,
  parseStatusSections,
  parseTaskRegistryInitiatives,
} from '../lib/legacy-parsers.mjs';
import { slugify } from '../lib/markdown.mjs';

function sanitizeOneLine(text) {
  return String(text || '')
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\[(.*?)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSentence(currentSection) {
  const oneLine = sanitizeOneLine(currentSection)
    .replace(/^-\s*/gm, '')
    .trim();

  if (!oneLine) return 'Forge Agent planning workspace migrated from legacy artifacts.';

  const sentence = oneLine.split('.').find((item) => item.trim().length > 20);
  return sentence ? `${sentence.trim()}.` : oneLine;
}

function buildProjectMarkdown(parsed, nextItems) {
  const active = (nextItems.length > 0 ? nextItems : [{ title: 'Stabilize migration baseline' }])
    .slice(0, 5)
    .map((item) => `- [ ] ${sanitizeOneLine(item.title)}`)
    .join('\n');

  return `# Forge Agent\n\n## What This Is\n\n${firstSentence(parsed.status.current)}\n\n## Core Value\n\nShip consistent, traceable vertical slices with explicit planning artifacts and verification gates.\n\n## Requirements\n\n### Validated\n\nImported from legacy STATUS history.\n\n### Active\n\n${active}\n\n### Out of Scope\n\n- Full GSD parity in v1 - deferred until Forge Loop core lifecycle is stable\n- Dual-source planning ownership - \`.planning\` is canonical\n\n## Context\n\nThis file was seeded by \`forge-loop migrate-legacy\` from:\n- ${LEGACY_STATUS_PATH}\n- ${LEGACY_TASK_REGISTRY_PATH}\n- ${LEGACY_DECISIONS_PATH}\n- ${LEGACY_ERRORS_PATH}\n\n## Constraints\n\n- **Platform:** Internal CLI inside forge-agent monorepo\n- **Runtime:** Prompt-pack orchestration, no provider API coupling in v1\n- **Safety:** Legacy docs remain available via generated snapshot sync\n\n## Key Decisions\n\n| Decision | Rationale | Outcome |\n|---|---|---|\n| \`.planning\` as source of truth | Reduce drift and consolidate workflow state | Pending |\n| One-way legacy sync via markers | Preserve continuity without dual-write complexity | Pending |\n\n---\n*Last updated: ${new Date().toISOString()} after legacy migration*\n`;
}

function buildRequirementsMarkdown(nextItems) {
  const selected = (nextItems.length > 0 ? nextItems : [{ title: 'Initialize planning artifacts' }]).slice(0, 8);
  const v1Lines = selected
    .map((item, index) => {
      const id = `REQ-${String(index + 1).padStart(2, '0')}`;
      const description = sanitizeOneLine(item.title);
      return `- [ ] **${id}**: ${description}`;
    })
    .join('\n');

  const traceLines = selected
    .map((_, index) => {
      const reqId = `REQ-${String(index + 1).padStart(2, '0')}`;
      const phaseNumber = String(Math.min(index + 1, 5)).padStart(2, '0');
      return `| ${reqId} | Phase ${phaseNumber} | Pending |`;
    })
    .join('\n');

  return `# Requirements: Forge Agent\n\n**Defined:** ${new Date().toISOString().slice(0, 10)}\n\n## v1 Requirements\n\n${v1Lines}\n\n## v2 Requirements\n\n- Structured sub-agent orchestration for each lifecycle stage\n- Extended milestone and backlog automation\n\n## Out of Scope\n\n| Feature | Reason |\n|---|---|\n| Full command parity with GSD | Explicitly deferred for Forge Loop v1 |\n| Direct model-provider execution | Runtime-agnostic prompt-pack approach in v1 |\n\n## Traceability\n\n| Requirement | Phase | Status |\n|---|---|---|\n${traceLines}\n\n---\n*Requirements defined by forge-loop migration*\n`;
}

function buildRoadmapMarkdown(nextItems) {
  const phases = (nextItems.length > 0 ? nextItems : [{ title: 'Bootstrap migration baseline' }])
    .slice(0, 5)
    .map((item, index) => {
      const phaseNumber = String(index + 1).padStart(2, '0');
      const reqId = `REQ-${String(index + 1).padStart(2, '0')}`;
      const title = sanitizeOneLine(item.title) || `Phase ${phaseNumber}`;
      const goal = sanitizeOneLine(item.description) || `Deliver ${title.toLowerCase()} with clear implementation and verification artifacts.`;
      return { phaseNumber, reqId, title, goal };
    });

  const phaseChecklist = phases.map((phase) => `- [ ] **Phase ${phase.phaseNumber}: ${phase.title}** - ${phase.goal}`).join('\n');
  const details = phases
    .map((phase, index) => {
      const depends = index === 0 ? 'Nothing' : `Phase ${phases[index - 1].phaseNumber}`;
      return `### Phase ${phase.phaseNumber}: ${phase.title}\n**Goal:** ${phase.goal}\n**Depends on:** ${depends}\n**Requirements:** [${phase.reqId}]\n**Plans:** 0 plans\n\nPlans:\n- [ ] ${phase.phaseNumber}-01: TBD (run \`forge-loop plan-phase ${phase.phaseNumber}\`)`;
    })
    .join('\n\n');

  const progressRows = phases
    .map((phase) => `| ${phase.phaseNumber}. ${phase.title} | 0/0 | Not started | - |`)
    .join('\n');

  return `# Roadmap: Forge Agent\n\n## Overview\n\nRoadmap generated from legacy STATUS Next items. This plan is the operating baseline for Forge Loop v1.\n\n## Phases\n\n${phaseChecklist}\n\n## Phase Details\n\n${details}\n\n## Progress\n\n| Phase | Plans Complete | Status | Completed |\n|---|---|---|---|\n${progressRows}\n`;
}

function buildStateMarkdown(doneItems) {
  const donePreview = doneItems.length > 0 ? doneItems.slice(0, 8).map((item) => `- ${sanitizeOneLine(item)}`).join('\n') : '- None imported.';

  return `# Project State\n\n## Project Reference\n\nSee: .planning/PROJECT.md (updated ${new Date().toISOString().slice(0, 10)})\n\n**Core value:** Ship traceable slices with artifact-first planning.\n**Current focus:** Phase 01 planning\n\n## Current Position\n\nPhase: 01 of 05\nPlan: 00 of 00\nStatus: Ready to discuss\nLast activity: ${new Date().toISOString().slice(0, 10)} - Migration initialized\n\nProgress: [..........] 0%\n\n## Accumulated Context\n\n### Imported Ralph Wiggum Done\n${donePreview}\n\n### Pending Todos\n\nNone yet.\n\n### Blockers/Concerns\n\nNone recorded during migration.\n\n## Session Continuity\n\nLast session: ${new Date().toISOString()}\nStopped at: Migration complete\nResume file: None\n`;
}

function buildPromptPackReadme() {
  return `# Forge Loop Prompt Packs\n\nRuntime-agnostic prompt packs generated by CLI commands for coding-agent or manual runs.\n\nExpected generated files:\n- phase discuss prompts\n- phase execution prompts\n- verification prompts\n\nThese prompts are guidance artifacts, not executable code.\n`;
}

function buildTempRefactorBacklogMarkdown(nextItems, doneItems) {
  const nextLines = (nextItems.length > 0 ? nextItems : [{ title: 'Stabilize migration baseline' }])
    .slice(0, 6)
    .map((item) => `- [ ] ${sanitizeOneLine(item.title)}`)
    .join('\n');

  const historyLines = (doneItems.length > 0 ? doneItems : ['No done history imported.'])
    .slice(0, 5)
    .map((item) => `- ${sanitizeOneLine(item)}`)
    .join('\n');

  return `# Temporary Migration and Refactor Backlog

This queue exists for migration-era refactors before they are distributed into phase plans.

## Pending Refactors

${nextLines}

## Imported Done Context

${historyLines}

## Operating Rules

- Treat this as a temporary queue, not a long-term tracker.
- Promote accepted items into phase plan files under \`.planning/phases/\`.
- Record outcomes in \`.planning/DECISIONS.md\` and \`.planning/ERRORS.md\`.
`;
}

function buildPlanningTaskRegistryMarkdown(legacyTaskRegistry) {
  return `# Task Registry\n\nImported snapshot from ${LEGACY_TASK_REGISTRY_PATH}.\n\n${legacyTaskRegistry.trim()}\n`;
}

function buildPlanningDecisionsMarkdown(legacyDecisions) {
  return `# Decisions\n\nImported snapshot from ${LEGACY_DECISIONS_PATH}.\n\n${legacyDecisions.trim()}\n`;
}

function buildPlanningErrorsMarkdown(legacyErrors) {
  return `# Errors and Attempts\n\nImported snapshot from ${LEGACY_ERRORS_PATH}.\n\n${legacyErrors.trim()}\n`;
}

function toRelativeList(files) {
  return files.map((filePath) => path.relative(process.cwd(), filePath).replace(/\\/g, '/'));
}

function statMtimeIso(filePath) {
  try {
    return fs.statSync(filePath).mtime.toISOString();
  } catch {
    return null;
  }
}

export async function runMigrateLegacy() {
  const legacyStatus = readText(toAbsPath(LEGACY_STATUS_PATH), '');
  const legacyTaskRegistry = readText(toAbsPath(LEGACY_TASK_REGISTRY_PATH), '');
  const legacyDecisions = readText(toAbsPath(LEGACY_DECISIONS_PATH), '');
  const legacyErrors = readText(toAbsPath(LEGACY_ERRORS_PATH), '');

  if (!legacyStatus.trim() || !legacyTaskRegistry.trim() || !legacyDecisions.trim() || !legacyErrors.trim()) {
    throw new Error('Missing one or more legacy artifacts required for migration.');
  }

  const statusSections = parseStatusSections(legacyStatus);
  const doneItems = parseRalphDoneItems(statusSections.ralphLoop);
  const nextItems = parseNextItems(statusSections.next);
  const initiatives = parseTaskRegistryInitiatives(legacyTaskRegistry);

  const parsed = {
    status: statusSections,
    doneItems,
    nextItems,
    initiatives,
  };

  const warnings = buildMigrationWarnings(parsed);

  ensureDir(PLANNING_PATH);
  ensureDir(PLANNING_PHASES_DIR);
  ensureDir(PLANNING_PROMPTS_DIR);

  const written = [];

  writeText(PLANNING_FILES.project, buildProjectMarkdown(parsed, nextItems));
  written.push(PLANNING_FILES.project);

  writeText(PLANNING_FILES.requirements, buildRequirementsMarkdown(nextItems));
  written.push(PLANNING_FILES.requirements);

  writeText(PLANNING_FILES.roadmap, buildRoadmapMarkdown(nextItems));
  written.push(PLANNING_FILES.roadmap);

  writeText(PLANNING_FILES.state, buildStateMarkdown(doneItems));
  written.push(PLANNING_FILES.state);

  writeText(PLANNING_FILES.decisions, buildPlanningDecisionsMarkdown(legacyDecisions));
  written.push(PLANNING_FILES.decisions);

  writeText(PLANNING_FILES.errors, buildPlanningErrorsMarkdown(legacyErrors));
  written.push(PLANNING_FILES.errors);

  writeText(PLANNING_FILES.taskRegistry, buildPlanningTaskRegistryMarkdown(legacyTaskRegistry));
  written.push(PLANNING_FILES.taskRegistry);

  writeText(PLANNING_FILES.tempRefactorBacklog, buildTempRefactorBacklogMarkdown(nextItems, doneItems));
  written.push(PLANNING_FILES.tempRefactorBacklog);

  writeText(PLANNING_FILES.config, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`);
  written.push(PLANNING_FILES.config);

  writeText(path.join(PLANNING_PROMPTS_DIR, 'README.md'), buildPromptPackReadme());
  written.push(path.join(PLANNING_PROMPTS_DIR, 'README.md'));

  const phaseCandidates = nextItems.slice(0, 5);
  for (let index = 0; index < phaseCandidates.length; index += 1) {
    const phaseNumber = normalizePhaseNumber(String(index + 1));
    const phaseName = phaseCandidates[index].title || `Phase ${index + 1}`;
    const phaseDir = path.join(PLANNING_PHASES_DIR, `${phaseNumber}-${slugify(phaseName)}`);
    ensureDir(phaseDir);
    written.push(phaseDir);
  }

  const report = {
    migratedAt: new Date().toISOString(),
    sources: {
      status: {
        path: LEGACY_STATUS_PATH,
        mtime: statMtimeIso(toAbsPath(LEGACY_STATUS_PATH)),
      },
      taskRegistry: {
        path: LEGACY_TASK_REGISTRY_PATH,
        mtime: statMtimeIso(toAbsPath(LEGACY_TASK_REGISTRY_PATH)),
      },
      decisions: {
        path: LEGACY_DECISIONS_PATH,
        mtime: statMtimeIso(toAbsPath(LEGACY_DECISIONS_PATH)),
      },
      errors: {
        path: LEGACY_ERRORS_PATH,
        mtime: statMtimeIso(toAbsPath(LEGACY_ERRORS_PATH)),
      },
    },
    counts: {
      doneItems: doneItems.length,
      nextItems: nextItems.length,
      initiatives: initiatives.length,
      warnings: warnings.length,
    },
    warnings,
    written: toRelativeList(written),
  };

  writeJson(PLANNING_FILES.migrationReport, report);

  return {
    report,
    written,
  };
}
