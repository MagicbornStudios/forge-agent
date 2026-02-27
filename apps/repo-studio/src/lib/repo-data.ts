import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveHostWorkspaceRoot } from '@/lib/project-root';

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

export type RepoLoopEntry = {
  id: string;
  name: string;
  planningRoot: string;
  scope: string[];
  profile: string;
  runner: string;
  active: boolean;
};

export type PlanningSnapshot = {
  loopId: string;
  planningRoot: string;
  prdPath: string;
  prdExists: boolean;
  prdContent: string;
  nextAction: string;
  percent: number;
  rows: PlanningPhaseRow[];
  tasks: PlanningTaskRow[];
  openTaskCount: number;
  completeTaskCount: number;
  summaries: number;
  verifications: number;
  decisionOpen: number;
  errorOpen: number;
  docs: PlanningDocEntry[];
  stateContent: string;
  decisionsContent: string;
  errorsContent: string;
};

export type RepoLoopsSnapshot = {
  indexPath: string;
  activeLoopId: string;
  entries: RepoLoopEntry[];
};

export type RepoStudioSnapshot = {
  commands: RepoCommandEntry[];
  planning: PlanningSnapshot;
  loops: RepoLoopsSnapshot;
};

const LOOP_INDEX_RELATIVE_PATH = '.planning/LOOPS.json';

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

function normalizeLoopId(loopId: unknown) {
  return String(loopId || '').trim().toLowerCase();
}

function planningRootForLoop(loopId: string) {
  if (loopId === 'default') return '.planning';
  return `.planning/loops/${loopId}`;
}

function normalizeLoopEntry(entry: any): RepoLoopEntry | null {
  const id = normalizeLoopId(entry?.id);
  if (!id || !/^[a-z0-9][a-z0-9_-]*$/.test(id)) return null;
  const scope: string[] = Array.isArray(entry?.scope)
    ? entry.scope.map((item: unknown) => String(item || '').trim()).filter(Boolean)
    : ['.'];
  return {
    id,
    name: String(entry?.name || id),
    planningRoot: String(entry?.planningRoot || planningRootForLoop(id)).replace(/\\/g, '/'),
    scope: scope.length > 0 ? [...new Set(scope)] : ['.'],
    profile: String(entry?.profile || 'forge-agent'),
    runner: String(entry?.runner || 'codex'),
    active: false,
  };
}

async function loadLoopIndex(repoRoot: string) {
  const indexPath = path.join(repoRoot, LOOP_INDEX_RELATIVE_PATH);
  const onDisk = await readJson<any>(indexPath, null);

  const fallbackDefault: RepoLoopEntry = {
    id: 'default',
    name: 'Default Repo Loop',
    planningRoot: '.planning',
    scope: ['.'],
    profile: 'forge-agent',
    runner: 'codex',
    active: true,
  };

  const entriesRaw = Array.isArray(onDisk?.loops) ? onDisk.loops : [];
  const byId = new Map<string, RepoLoopEntry>();
  for (const entry of entriesRaw) {
    const normalized = normalizeLoopEntry(entry);
    if (!normalized) continue;
    if (!byId.has(normalized.id)) byId.set(normalized.id, normalized);
  }
  if (!byId.has('default')) {
    byId.set('default', { ...fallbackDefault, active: false });
  }

  const activeLoopId = normalizeLoopId(onDisk?.activeLoopId) || 'default';
  const entries = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  const hasActive = entries.some((entry) => entry.id === activeLoopId);
  const resolvedActive = hasActive ? activeLoopId : 'default';

  const withActive = entries.map((entry) => ({
    ...entry,
    active: entry.id === resolvedActive,
  }));

  return {
    indexPath: LOOP_INDEX_RELATIVE_PATH,
    activeLoopId: resolvedActive,
    entries: withActive,
  };
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

function runForgeLoopProgressJson(repoRoot: string, loopId?: string) {
  const hostRoot = resolveHostWorkspaceRoot();
  const cliPath = path.join(hostRoot, 'packages', 'forge-loop', 'src', 'cli.mjs');
  const args = [cliPath, 'progress', '--json'];
  if (loopId && loopId !== 'default') {
    args.push('--loop', loopId);
  }
  const result = spawnSync(process.execPath, args, {
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

async function collectPlanningDocs(repoRoot: string, planningRootRel: string): Promise<PlanningDocEntry[]> {
  const docs: PlanningDocEntry[] = [];
  const planningRoot = path.join(repoRoot, planningRootRel);
  const coreFiles = [
    'PRD.md',
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
      if (!file.isFile() || !file.name.endsWith('.md')) continue;
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
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
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

export async function loadRepoStudioSnapshot(
  repoRoot: string,
  options: { loopId?: string | null } = {},
): Promise<RepoStudioSnapshot> {
  const loops = await loadLoopIndex(repoRoot);
  const requestedLoopId = normalizeLoopId(options.loopId);
  const activeLoopId = requestedLoopId && loops.entries.some((entry) => entry.id === requestedLoopId)
    ? requestedLoopId
    : loops.activeLoopId;
  const activeLoop = loops.entries.find((entry) => entry.id === activeLoopId) || loops.entries[0];
  const planningRootRel = String(activeLoop?.planningRoot || '.planning').replace(/\\/g, '/');
  const planningRoot = path.join(repoRoot, planningRootRel);
  const phasesRoot = path.join(planningRoot, 'phases');
  const prdPath = path.join(planningRoot, 'PRD.md');

  const [stateContent, decisionsContent, errorsContent, taskRegistryContent, docs, commands, prdContent] = await Promise.all([
    readText(path.join(planningRoot, 'STATE.md'), ''),
    readText(path.join(planningRoot, 'DECISIONS.md'), ''),
    readText(path.join(planningRoot, 'ERRORS.md'), ''),
    readText(path.join(planningRoot, 'TASK-REGISTRY.md'), ''),
    collectPlanningDocs(repoRoot, planningRootRel),
    collectWorkspaceScripts(repoRoot),
    readText(prdPath, ''),
  ]);

  const progressPayload = runForgeLoopProgressJson(repoRoot, activeLoopId);
  const parsedProgress = parseProgressPayload(progressPayload || {});

  const [summaries, verifications] = await Promise.all([
    countBySuffix(phasesRoot, '-SUMMARY.md'),
    countBySuffix(phasesRoot, '-VERIFICATION.md'),
  ]);
  const tasks = parseTaskRegistry(taskRegistryContent);
  const completeTaskCount = tasks.filter((task) =>
    String(task.status || '').toLowerCase().replace(/\s+/g, '-') === 'complete').length;
  const openTaskCount = Math.max(0, tasks.length - completeTaskCount);
  let prdExists = false;
  try {
    const stat = await fs.stat(prdPath);
    prdExists = stat.isFile();
  } catch {
    prdExists = false;
  }

  return {
    commands,
    loops: {
      ...loops,
      activeLoopId,
      entries: loops.entries.map((entry) => ({
        ...entry,
        active: entry.id === activeLoopId,
      })),
    },
    planning: {
      loopId: activeLoopId,
      planningRoot: planningRootRel,
      prdPath: path.relative(repoRoot, prdPath).replace(/\\/g, '/'),
      prdExists,
      prdContent,
      nextAction: parsedProgress.nextAction,
      percent: parsedProgress.percent,
      rows: parsedProgress.rows,
      tasks,
      openTaskCount,
      completeTaskCount,
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
