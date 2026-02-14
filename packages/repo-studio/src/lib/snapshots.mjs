import fs from 'node:fs/promises';
import path from 'node:path';

import { runToolCommand } from './command-resolver.mjs';

function readJsonOutput(result) {
  if (!result?.stdout) return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

export function captureEnvDoctor({ profile, mode }) {
  const args = ['doctor', '--json', '--profile', profile, '--mode', mode];
  const result = runToolCommand('forge-env', args);
  const payload = readJsonOutput(result);
  return {
    ok: result.ok && Boolean(payload?.ok !== false),
    command: result.command,
    payload,
    stdout: result.stdout,
    stderr: result.stderr,
    attempts: result.attempts || [],
    resolvedAttempt: result.resolvedAttempt || null,
  };
}

export function captureForgeLoopProgress() {
  const result = runToolCommand('forge-loop', ['progress', '--json']);
  const payload = readJsonOutput(result);
  if (payload) {
    return {
      ok: result.ok && payload?.status !== 'error',
      command: result.command,
      report: payload.report || '',
      payload,
      stderr: result.stderr,
      attempts: result.attempts || [],
      resolvedAttempt: result.resolvedAttempt || null,
    };
  }

  const fallback = runToolCommand('forge-loop', ['progress']);
  return {
    ok: fallback.ok,
    command: fallback.command,
    report: fallback.stdout,
    payload: null,
    stderr: fallback.stderr,
    attempts: fallback.attempts || [],
    resolvedAttempt: fallback.resolvedAttempt || null,
  };
}

async function readPlanningText(cwd, relativePath) {
  try {
    return await fs.readFile(path.join(cwd, relativePath), 'utf8');
  } catch {
    return '';
  }
}

function countChecklist(content) {
  return (content.match(/^\s*-\s*\[( |x)\]/gmi) || []).length;
}

function countOpenChecklist(content) {
  return (content.match(/^\s*-\s*\[\s\]/gmi) || []).length;
}

function countTaskRegistryRows(content) {
  const lines = String(content || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => /^\|\s*FRG-/.test(line));

  const summary = {
    total: 0,
    pending: 0,
    in_progress: 0,
    complete: 0,
  };

  for (const line of lines) {
    const cols = line.split('|').map((value) => value.trim()).filter(Boolean);
    if (cols.length < 4) continue;
    summary.total += 1;
    const status = cols[3].toLowerCase();
    if (status === 'pending') summary.pending += 1;
    else if (status === 'in progress') summary.in_progress += 1;
    else if (status === 'complete') summary.complete += 1;
  }
  return summary;
}

async function countBySuffix(startDir, suffix) {
  const root = path.join(process.cwd(), startDir);
  let count = 0;
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    let entries = [];
    try {
      // eslint-disable-next-line no-await-in-loop
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(next);
      } else if (entry.isFile() && entry.name.endsWith(suffix)) {
        count += 1;
      }
    }
  }

  return count;
}

export async function collectLoopAnalytics(config) {
  const planningRoot = config?.loop?.paths?.planningRoot || '.planning';
  const phasesDir = config?.loop?.paths?.phasesDir || path.join(planningRoot, 'phases');

  const [state, decisions, errors, taskRegistry, summaries, verifications] = await Promise.all([
    readPlanningText(process.cwd(), path.join(planningRoot, 'STATE.md')),
    readPlanningText(process.cwd(), path.join(planningRoot, 'DECISIONS.md')),
    readPlanningText(process.cwd(), path.join(planningRoot, 'ERRORS.md')),
    readPlanningText(process.cwd(), path.join(planningRoot, 'TASK-REGISTRY.md')),
    countBySuffix(phasesDir, '-SUMMARY.md'),
    countBySuffix(phasesDir, '-VERIFICATION.md'),
  ]);

  return {
    stateChecklistTotal: countChecklist(state),
    stateChecklistOpen: countOpenChecklist(state),
    decisionChecklistTotal: countChecklist(decisions),
    decisionChecklistOpen: countOpenChecklist(decisions),
    errorChecklistTotal: countChecklist(errors),
    errorChecklistOpen: countOpenChecklist(errors),
    summaries,
    verifications,
    tasks: countTaskRegistryRows(taskRegistry),
  };
}

async function readDocsFrom(dirPath, prefix) {
  const abs = path.join(process.cwd(), dirPath);
  let entries = [];
  try {
    entries = await fs.readdir(abs, { withFileTypes: true });
  } catch {
    return [];
  }

  const docs = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const fullPath = path.join(abs, entry.name);
    const content = await fs.readFile(fullPath, 'utf8').catch(() => '');
    docs.push({
      id: `${prefix}/${entry.name}`,
      title: entry.name,
      content,
      path: path.join(dirPath, entry.name).replace(/\\/g, '/'),
    });
  }
  return docs.sort((a, b) => a.title.localeCompare(b.title));
}

export async function collectRunbookDocs(config) {
  const docsConfig = config?.docs?.paths || {};
  const buckets = [
    ['forge-loop', docsConfig.forgeLoop || 'packages/forge-loop/docs'],
    ['forge-env', docsConfig.forgeEnv || 'packages/forge-env/docs'],
    ['repo-studio', docsConfig.repoStudio || 'packages/repo-studio/docs'],
  ];

  const docs = [];
  for (const [prefix, dirPath] of buckets) {
    docs.push(...await readDocsFrom(dirPath, prefix));
  }
  return docs;
}
