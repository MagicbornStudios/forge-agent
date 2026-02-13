import fs from 'node:fs';
import path from 'node:path';

import { normalizePhaseNumber, phaseFilePrefix, PLANNING_FILES, PLANNING_PHASES_DIR } from './paths.mjs';
import { readText } from './fs-utils.mjs';
import { slugify } from './markdown.mjs';
import { parsePlanFrontmatterYaml } from './validators.mjs';

export function parseRoadmapPhases(roadmapMarkdown) {
  const text = String(roadmapMarkdown || '');
  const lines = text.split('\n');
  const phases = [];

  let current = null;

  for (const line of lines) {
    const headingMatch = line.match(/^###\s+Phase\s+([0-9]+(?:\.[0-9]+)?)\s*:\s*(.+)$/);
    if (headingMatch) {
      if (current) phases.push(current);
      const phaseNumber = normalizePhaseNumber(headingMatch[1]);
      current = {
        phaseNumber,
        phaseRaw: headingMatch[1],
        name: headingMatch[2].trim(),
        goal: '',
        requirements: [],
      };
      continue;
    }

    if (!current) continue;

    const goalMatch = line.match(/^\*\*Goal:\*\*\s*(.+)$/);
    if (goalMatch) {
      current.goal = goalMatch[1].trim();
      continue;
    }

    const reqMatch = line.match(/^\*\*Requirements:\*\*\s*\[(.*)\]\s*$/);
    if (reqMatch) {
      current.requirements = reqMatch[1]
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  if (current) phases.push(current);
  return phases;
}

export function findPhase(roadmapMarkdown, rawPhase) {
  const normalized = normalizePhaseNumber(rawPhase);
  if (!normalized) return null;

  const phases = parseRoadmapPhases(roadmapMarkdown);
  return phases.find((phase) => phase.phaseNumber === normalized) || null;
}

export function phaseDirName(phaseNumber, phaseName = 'phase') {
  const normalized = normalizePhaseNumber(phaseNumber);
  if (!normalized) return null;
  return `${normalized}-${slugify(phaseName) || 'phase'}`;
}

export function ensurePhaseDir(phaseNumber, phaseName) {
  const dirName = phaseDirName(phaseNumber, phaseName);
  if (!dirName) return null;
  const fullPath = path.join(PLANNING_PHASES_DIR, dirName);
  fs.mkdirSync(fullPath, { recursive: true });
  return { dirName, fullPath };
}

export function listPhasePlanFiles(phaseDirPath) {
  if (!phaseDirPath || !fs.existsSync(phaseDirPath)) return [];
  return fs
    .readdirSync(phaseDirPath)
    .filter((file) => /-PLAN\.md$/i.test(file))
    .sort()
    .map((file) => path.join(phaseDirPath, file));
}

export function listPhaseSummaryFiles(phaseDirPath) {
  if (!phaseDirPath || !fs.existsSync(phaseDirPath)) return [];
  return fs
    .readdirSync(phaseDirPath)
    .filter((file) => /-SUMMARY\.md$/i.test(file))
    .sort()
    .map((file) => path.join(phaseDirPath, file));
}

export function nextPlanNumber(phaseDirPath) {
  const planFiles = listPhasePlanFiles(phaseDirPath);
  const numbers = planFiles
    .map((filePath) => path.basename(filePath))
    .map((name) => {
      const match = name.match(/-(\d{2})-PLAN\.md$/i);
      return match ? Number(match[1]) : 0;
    })
    .filter((value) => Number.isFinite(value));

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return String(next).padStart(2, '0');
}

export function getConfig() {
  const content = readText(PLANNING_FILES.config, '');
  if (!content.trim()) return null;

  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function parsePlanTasks(planMarkdown) {
  const tasks = [];
  const taskBlocks = String(planMarkdown || '').match(/<task[\s\S]*?<\/task>/g) || [];

  for (const block of taskBlocks) {
    const nameMatch = block.match(/<name>([\s\S]*?)<\/name>/i);
    const taskName = (nameMatch?.[1] || 'Unnamed task').replace(/\s+/g, ' ').trim();
    tasks.push(taskName);
  }

  return tasks;
}

export function parsePlanFrontmatter(planMarkdown) {
  const parsed = parsePlanFrontmatterYaml(planMarkdown);
  return parsed.data || {};
}

export function resolvePhaseDirFromRoadmap(roadmapMarkdown, phaseNumber) {
  const phase = findPhase(roadmapMarkdown, phaseNumber);
  if (!phase) return null;
  return ensurePhaseDir(phase.phaseNumber, phase.name);
}

export function getPhaseExecutionState(phaseDirPath) {
  const plans = listPhasePlanFiles(phaseDirPath);
  const summaries = listPhaseSummaryFiles(phaseDirPath);
  const summaryNames = new Set(summaries.map((item) => path.basename(item).replace('-SUMMARY.md', '')));

  const incompletePlans = plans.filter((planFile) => {
    const key = path.basename(planFile).replace('-PLAN.md', '');
    return !summaryNames.has(key);
  });

  return {
    planCount: plans.length,
    summaryCount: summaries.length,
    incompletePlans,
    complete: plans.length > 0 && incompletePlans.length === 0,
  };
}

export function collectRoadmapOverview(roadmapMarkdown) {
  const phases = parseRoadmapPhases(roadmapMarkdown);
  return phases.map((phase) => ({
    ...phase,
    phaseFilePrefix: phaseFilePrefix(phase.phaseNumber),
  }));
}
