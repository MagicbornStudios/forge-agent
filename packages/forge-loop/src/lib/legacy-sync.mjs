import { updateGeneratedBlock } from './markdown.mjs';
import { readText, writeText } from './fs-utils.mjs';
import {
  LEGACY_DECISIONS_PATH,
  LEGACY_ERRORS_PATH,
  LEGACY_STATUS_PATH,
  LEGACY_TASK_REGISTRY_PATH,
  LEGACY_SYNC_TARGETS,
  PLANNING_FILES,
  toAbsPath,
} from './paths.mjs';

function statusSnapshot() {
  const project = readText(PLANNING_FILES.project, '').trim();
  const state = readText(PLANNING_FILES.state, '').trim();
  const roadmap = readText(PLANNING_FILES.roadmap, '').trim();

  const lines = [
    '## Forge Loop Snapshot',
    '',
    'Source of truth: `.planning/`',
    '',
    '### PROJECT',
    project ? project.split('\n').slice(0, 20).join('\n') : '_Missing PROJECT.md_',
    '',
    '### STATE',
    state ? state.split('\n').slice(0, 30).join('\n') : '_Missing STATE.md_',
    '',
    '### ROADMAP',
    roadmap ? roadmap.split('\n').slice(0, 40).join('\n') : '_Missing ROADMAP.md_',
  ];

  return `${lines.join('\n').trim()}\n`;
}

function taskRegistrySnapshot() {
  const content = readText(PLANNING_FILES.taskRegistry, '').trim();
  if (!content) {
    return '## Forge Loop Snapshot\n\n_No TASK-REGISTRY.md found under `.planning/`._\n';
  }

  return `## Forge Loop Snapshot\n\n${content}\n`;
}

function decisionsSnapshot() {
  const content = readText(PLANNING_FILES.decisions, '').trim();
  if (!content) {
    return '## Forge Loop Snapshot\n\n_No DECISIONS.md found under `.planning/`._\n';
  }
  return `## Forge Loop Snapshot\n\n${content}\n`;
}

function errorsSnapshot() {
  const content = readText(PLANNING_FILES.errors, '').trim();
  if (!content) {
    return '## Forge Loop Snapshot\n\n_No ERRORS.md found under `.planning/`._\n';
  }
  return `## Forge Loop Snapshot\n\n${content}\n`;
}

function applySnapshot(relPath, generatedContent) {
  const absPath = toAbsPath(relPath);
  const current = readText(absPath, '');
  const updated = updateGeneratedBlock(current, generatedContent);
  writeText(absPath, updated);
  return absPath;
}

export function syncLegacyFromPlanning(options = {}) {
  const targets = Array.isArray(options.targets) && options.targets.length > 0
    ? options.targets
    : LEGACY_SYNC_TARGETS;
  const touched = [];

  if (targets.includes(LEGACY_STATUS_PATH)) {
    touched.push(applySnapshot(LEGACY_STATUS_PATH, statusSnapshot()));
  }
  if (targets.includes(LEGACY_TASK_REGISTRY_PATH)) {
    touched.push(applySnapshot(LEGACY_TASK_REGISTRY_PATH, taskRegistrySnapshot()));
  }
  if (targets.includes(LEGACY_DECISIONS_PATH)) {
    touched.push(applySnapshot(LEGACY_DECISIONS_PATH, decisionsSnapshot()));
  }
  if (targets.includes(LEGACY_ERRORS_PATH)) {
    touched.push(applySnapshot(LEGACY_ERRORS_PATH, errorsSnapshot()));
  }

  return touched;
}
