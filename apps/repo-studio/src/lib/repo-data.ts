import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export type RepoCommandEntry = {
  id: string;
  source: 'root-scripts' | 'workspace-scripts' | 'forge-builtins';
  packageName: string;
  scriptName: string;
  command: string;
};

export type PlanningPhaseRow = {
  phaseNumber: string;
  phaseName: string;
  status: string;
  plans: number;
  summaries: number;
};

export type PlanningTaskRow = {
  id: string;
  title: string;
  area: string;
  status: string;
};

export type PlanningDocEntry = {
  id: string;
  title: string;
  filePath: string;
  content: string;
  category: 'core' | 'phase';
};

export type PlanningSnapshot = {
  nextAction: string;
  percent: number;
  rows: PlanningPhaseRow[];
  tasks: PlanningTaskRow[];
  summaries: number;
  verifications: number;
  decisionOpen: number;
  errorOpen: number;
  docs: PlanningDocEntry[];
  stateContent: string;
  decisionsContent: string;
  errorsContent: string;
};

export type RepoStudioSnapshot = {
  commands: RepoCommandEntry[];
  planning: PlanningSnapshot;
};

async function readText(filePath: string, fallback = '') {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return fallback;
  }
}

async function readJson<T = unknown>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function parseTaskRegistry(content: string): PlanningTaskRow[] {
  const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');
  const rows: PlanningTaskRow[] = [];
  for (const line of lines) {
    if (!/^\|\s*FRG-/.test(line)) continue;
    const cols = line.split('|').map((value) => value.trim()).filter(Boolean);
    if (cols.length < 4) continue;
    rows.push({
      id: cols[0],
      title: cols[1] || '',
      area: cols[2] || '',
      status: cols[3] || '',
    });
  }
  return rows;
}

function countChecklistOpen(content: string) {
  return (String(content || '').match(/^\s*-\s*\[\s\]/gmi) || []).length;
}

async function countBySuffix(rootDir: string, suffix: string): Promise<number> {
  const stack = [rootDir];
  let count = 0;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) break;
    let entries: Array<{ isDirectory: () => boolean; isFile: () => boolean; name: string }> = [];
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

function parseProgressPayload(payload: any): { nextAction: string; percent: number; rows: PlanningPhaseRow[] } {
  const rows = Array.isArray(payload?.rows)
    ? payload.rows.map((row: any) => ({
      phaseNumber: String(row.phaseNumber || ''),
      phaseName: String(row.phaseName || ''),
      status: String(row.status || 'unknown'),
      plans: Number(row.plans || 0),
      summaries: Number(row.summaries || 0),
    }))
    : [];

  return {
    nextAction: String(payload?.nextAction || 'forge-loop progress'),
    percent: Number(payload?.percent || 0),
    rows,
  };
}

function runForgeLoopProgressJson(repoRoot: string) {
  const cliPath = path.join(repoRoot, 'packages', 'forge-loop', 'src', 'cli.mjs');
  const result = spawnSync(process.execPath, [cliPath, 'progress', '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  if ((result.status ?? 1) !== 0) {
    return null;
  }
  try {
    return JSON.parse(String(result.stdout || '{}'));
  } catch {
    return null;
  }
}

async function collectPlanningDocs(repoRoot: string): Promise<PlanningDocEntry[]> {
  const docs: PlanningDocEntry[] = [];
  const planningRoot = path.join(repoRoot, '.planning');
  const coreFiles = [
    'PROJECT.md',
    'REQUIREMENTS.md',
    'ROADMAP.md',
    'STATE.md',
    'DECISIONS.md',
    'ERRORS.md',
    'TASK-REGISTRY.md',
  ];

  for (const fileName of coreFiles) {
    const filePath = path.join(planningRoot, fileName);
    const content = await readText(filePath, '');
    if (!content.trim()) continue;
    docs.push({
      id: `core:${fileName}`,
      title: fileName,
      filePath: path.relative(repoRoot, filePath).replace(/\\/g, '/'),
      content,
      category: 'core',
    });
  }

  const phasesRoot = path.join(planningRoot, 'phases');
  let phaseDirs: Array<{ isDirectory: () => boolean; isFile: () => boolean; name: string }> = [];
  try {
    phaseDirs = await fs.readdir(phasesRoot, { withFileTypes: true });
  } catch {
    phaseDirs = [];
  }

  for (const phaseDir of phaseDirs) {
    if (!phaseDir.isDirectory()) continue;
    const phasePath = path.join(phasesRoot, phaseDir.name);
    let files: Array<{ isDirectory: () => boolean; isFile: () => boolean; name: string }> = [];
    try {
      // eslint-disable-next-line no-await-in-loop
      files = await fs.readdir(phasePath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.isFile()) continue;
      if (!file.name.endsWith('.md')) continue;
      const filePath = path.join(phasePath, file.name);
      // eslint-disable-next-line no-await-in-loop
      const content = await readText(filePath, '');
      docs.push({
        id: `phase:${phaseDir.name}/${file.name}`,
        title: `${phaseDir.name}/${file.name}`,
        filePath: path.relative(repoRoot, filePath).replace(/\\/g, '/'),
        content,
        category: 'phase',
      });
    }
  }

  return docs.sort((a, b) => a.title.localeCompare(b.title));
}

async function collectWorkspaceScripts(repoRoot: string): Promise<RepoCommandEntry[]> {
  const rootPackage = await readJson<{ scripts?: Record<string, string> }>(path.join(repoRoot, 'package.json'), {});
  const rootScripts = rootPackage?.scripts || {};

  const rootEntries: RepoCommandEntry[] = Object.keys(rootScripts)
    .sort()
    .map((scriptName) => ({
      id: `root:${scriptName}`,
      source: 'root-scripts',
      packageName: 'root',
      scriptName,
      command: `pnpm run ${scriptName}`,
    }));

  const forgeEntries: RepoCommandEntry[] = Object.keys(rootScripts)
    .filter((name) => name.startsWith('forge-'))
    .sort()
    .map((scriptName) => ({
      id: `forge:${scriptName}`,
      source: 'forge-builtins',
      packageName: 'root',
      scriptName,
      command: `pnpm run ${scriptName}`,
    }));

  const workspaceYaml = await readText(path.join(repoRoot, 'pnpm-workspace.yaml'), '');
  const globs = (workspaceYaml.match(/-\s*["']?([^"'\n]+)["']?/g) || [])
    .map((line) => line.replace(/-\s*["']?/, '').replace(/["']$/, '').trim())
    .filter(Boolean);
  const defaults = ['apps/*', 'packages/*'];
  const workspaceGlobs = globs.length > 0 ? globs : defaults;

  const workspaceDirs = new Set<string>();
  for (const glob of workspaceGlobs) {
    const normalized = glob.replace(/\\/g, '/');
    if (!normalized.endsWith('/*')) continue;
    const base = normalized.slice(0, -2);
    const baseAbs = path.join(repoRoot, base);
    let entries: Array<{ isDirectory: () => boolean; isFile: () => boolean; name: string }> = [];
    try {
      // eslint-disable-next-line no-await-in-loop
      entries = await fs.readdir(baseAbs, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.')) continue;
      workspaceDirs.add(path.join(base, entry.name));
    }
  }

  const workspaceEntries: RepoCommandEntry[] = [];
  for (const relDir of [...workspaceDirs].sort()) {
    const packagePath = path.join(repoRoot, relDir, 'package.json');
    const pkg = await readJson<{ name?: string; scripts?: Record<string, string> }>(packagePath, {});
    const pkgName = String(pkg?.name || relDir.replace(/\\/g, '/'));
    const scripts = pkg?.scripts || {};
    for (const scriptName of Object.keys(scripts).sort()) {
      workspaceEntries.push({
        id: `workspace:${pkgName.replace(/^@/, '').replace(/\//g, '--')}:${scriptName}`,
        source: 'workspace-scripts',
        packageName: pkgName,
        scriptName,
        command: `pnpm --filter ${pkgName} run ${scriptName}`,
      });
    }
  }

  const deduped = new Map<string, RepoCommandEntry>();
  for (const entry of [...forgeEntries, ...rootEntries, ...workspaceEntries]) {
    const key = `${entry.source}::${entry.command}`;
    if (deduped.has(key)) continue;
    deduped.set(key, entry);
  }

  return [...deduped.values()];
}

export async function loadRepoStudioSnapshot(repoRoot: string): Promise<RepoStudioSnapshot> {
  const planningRoot = path.join(repoRoot, '.planning');
  const phasesRoot = path.join(planningRoot, 'phases');

  const [stateContent, decisionsContent, errorsContent, taskRegistryContent, docs, commands] = await Promise.all([
    readText(path.join(planningRoot, 'STATE.md'), ''),
    readText(path.join(planningRoot, 'DECISIONS.md'), ''),
    readText(path.join(planningRoot, 'ERRORS.md'), ''),
    readText(path.join(planningRoot, 'TASK-REGISTRY.md'), ''),
    collectPlanningDocs(repoRoot),
    collectWorkspaceScripts(repoRoot),
  ]);

  const progressPayload = runForgeLoopProgressJson(repoRoot);
  const parsedProgress = parseProgressPayload(progressPayload || {});

  const [summaries, verifications] = await Promise.all([
    countBySuffix(phasesRoot, '-SUMMARY.md'),
    countBySuffix(phasesRoot, '-VERIFICATION.md'),
  ]);

  return {
    commands,
    planning: {
      nextAction: parsedProgress.nextAction,
      percent: parsedProgress.percent,
      rows: parsedProgress.rows,
      tasks: parseTaskRegistry(taskRegistryContent),
      summaries,
      verifications,
      decisionOpen: countChecklistOpen(decisionsContent),
      errorOpen: countChecklistOpen(errorsContent),
      docs,
      stateContent,
      decisionsContent,
      errorsContent,
    },
  };
}
