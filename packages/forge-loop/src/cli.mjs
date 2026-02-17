#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT_PLANNING_DIR = '.planning';
const LOOP_AWARE_COMMANDS = new Set([
  'progress',
  'discuss-phase',
  'plan-phase',
  'execute-phase',
  'verify-work',
  'doctor',
  'sync-legacy',
  'interactive',
]);

function parseSimpleFlags(argv) {
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

function defaultLoopIndex() {
  return {
    version: 1,
    activeLoopId: 'default',
    loops: [
      {
        id: 'default',
        name: 'Default Repo Loop',
        planningRoot: '.planning',
        scope: ['.'],
        profile: 'forge-agent',
        runner: 'codex',
      },
    ],
  };
}

function loadLoopIndexFromDisk() {
  const indexPath = path.join(process.cwd(), ROOT_PLANNING_DIR, 'LOOPS.json');
  if (!fs.existsSync(indexPath)) return defaultLoopIndex();
  try {
    const raw = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    if (!raw || typeof raw !== 'object') return defaultLoopIndex();
    const loops = Array.isArray(raw.loops) ? raw.loops : [];
    if (!loops.some((item) => String(item?.id || '') === 'default')) {
      loops.push(defaultLoopIndex().loops[0]);
    }
    const activeLoopId = String(raw.activeLoopId || 'default');
    return {
      version: 1,
      activeLoopId: loops.some((item) => String(item?.id || '') === activeLoopId) ? activeLoopId : 'default',
      loops: loops.map((item) => ({
        id: String(item?.id || '').trim().toLowerCase(),
        name: String(item?.name || item?.id || 'loop'),
        planningRoot: String(item?.planningRoot || '.planning').replace(/\\/g, '/'),
        scope: Array.isArray(item?.scope) ? item.scope.map((value) => String(value || '')).filter(Boolean) : ['.'],
        profile: String(item?.profile || 'forge-agent'),
        runner: String(item?.runner || 'codex'),
      })),
    };
  } catch {
    return defaultLoopIndex();
  }
}

function resolveLoopContext(command, requestedLoopId) {
  if (!LOOP_AWARE_COMMANDS.has(command)) return null;

  const index = loadLoopIndexFromDisk();
  const requested = String(requestedLoopId || '').trim().toLowerCase();
  const loopId = requested || String(index.activeLoopId || 'default').trim().toLowerCase() || 'default';
  const loop = index.loops.find((item) => item.id === loopId);

  if (!loop) {
    throw new Error(`Loop "${loopId}" is not defined. Run "forge-loop loop:new ${loopId}" first.`);
  }

  const planningRoot = String(loop.planningRoot || '.planning').replace(/\\/g, '/');
  process.env.FORGE_LOOP_LOOP_ID = loop.id;
  process.env.FORGE_LOOP_PLANNING_DIR = planningRoot;

  return {
    loopId: loop.id,
    planningRoot,
  };
}

function printUsage() {
  console.log(`forge-loop v1.6\n\nUsage:\n  forge-loop <command> [options]\n\nFirst run:\n  forge-loop new-project --fresh --profile forge-loop\n  forge-loop doctor\n\nCommands:\n  new-project [--fresh] [--profile forge-agent|forge-loop|custom]\n  migrate-legacy\n  discuss-phase <phase> [--notes "..."] [--runner auto|prompt-pack|codex] [--loop <id>]\n  plan-phase <phase> [--skip-research] [--gaps] [--runner auto|prompt-pack|codex] [--loop <id>]\n  execute-phase <phase> [--gaps-only] [--non-interactive] [--headless] [--runner auto|prompt-pack|codex] [--loop <id>]\n  verify-work <phase> [--non-interactive] [--strict] [--headless] [--loop <id>]\n  interactive [--phase <n>] [--mode discuss|plan|execute|verify|full] [--runner auto|prompt-pack|codex] [--loop <id>] [--json]\n  progress [--json] [--loop <id>]\n  sync-legacy [--loop <id>]\n  doctor [--headless] [--runner auto|prompt-pack|codex] [--loop <id>]\n  loop:list\n  loop:new <loop-id> [--name "..."] [--scope "apps/platform,packages/ui"] [--profile forge-agent|forge-loop|custom] [--runner codex|openrouter|custom]\n  loop:use <loop-id>\n\nGlobal:\n  --json  Print machine-readable command output.\n\nRunbooks:\n  packages/forge-loop/docs/01-quickstart.md (repo)\n  docs/01-quickstart.md (published package)\n\nGUI companion:\n  forge-repo-studio open --view env --mode headless\n`);
}

function printResult(result, asJson = false) {
  if (!result) return;

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (result.message) console.log(result.message);
  if (result.report) {
    if (typeof result.report === 'string') {
      console.log(result.report);
    } else {
      console.log(JSON.stringify(result.report, null, 2));
    }
  }

  if (result.phase) {
    console.log(`Phase: ${result.phase.phaseNumber} - ${result.phase.name}`);
  }

  if (result.written?.length) {
    console.log('Written:');
    for (const filePath of result.written) {
      console.log(`- ${filePath}`);
    }
  }

  if (result.touched?.length) {
    console.log('Updated legacy artifacts:');
    for (const filePath of result.touched) {
      console.log(`- ${filePath}`);
    }
  }

  if (result.nextAction) {
    console.log(`Next action: ${result.nextAction}`);
  }

  if (result.checks?.length) {
    console.log('Checks:');
    for (const check of result.checks) {
      const label = check.command || check.name || 'check';
      console.log(`- ${label}: ${check.ok ? 'PASS' : 'FAIL'}`);
    }
  }
}

async function main() {
  const rawArgv = process.argv.slice(2);
  const argv = rawArgv[0] === '--' ? rawArgv.slice(1) : rawArgv;
  const command = argv[0];

  if (!command || ['-h', '--help', 'help'].includes(command)) {
    printUsage();
    return;
  }

  const { positional, flags } = parseSimpleFlags(argv.slice(1));
  const asJson = flags.has('json');
  const loopContext = resolveLoopContext(command, flags.get('loop'));

  let result = null;

  switch (command) {
    case 'new-project': {
      const { runNewProject } = await import('./commands/new-project.mjs');
      result = await runNewProject({
        fresh: flags.has('fresh'),
        profile: flags.get('profile'),
      });
      break;
    }
    case 'migrate-legacy': {
      const { runMigrateLegacy } = await import('./commands/migrate-legacy.mjs');
      result = await runMigrateLegacy();
      break;
    }
    case 'discuss-phase': {
      const { runDiscussPhase } = await import('./commands/discuss-phase.mjs');
      result = await runDiscussPhase(positional[0], {
        notes: flags.get('notes'),
        runner: flags.get('runner'),
      });
      break;
    }
    case 'plan-phase': {
      const { runPlanPhase } = await import('./commands/plan-phase.mjs');
      result = await runPlanPhase(positional[0], {
        skipResearch: flags.has('skip-research'),
        gaps: flags.has('gaps'),
        runner: flags.get('runner'),
      });
      break;
    }
    case 'execute-phase': {
      const { runExecutePhase } = await import('./commands/execute-phase.mjs');
      result = await runExecutePhase(positional[0], {
        gapsOnly: flags.has('gaps-only'),
        nonInteractive: flags.has('non-interactive'),
        headless: flags.has('headless'),
        runner: flags.get('runner'),
        allowOutOfScope: flags.has('allow-out-of-scope'),
      });
      break;
    }
    case 'verify-work': {
      const { runVerifyWork } = await import('./commands/verify-work.mjs');
      result = await runVerifyWork(positional[0], {
        nonInteractive: flags.has('non-interactive'),
        headless: flags.has('headless'),
        strict: flags.has('strict') ? true : undefined,
        allowOutOfScope: flags.has('allow-out-of-scope'),
      });
      break;
    }
    case 'progress': {
      const { runProgress } = await import('./commands/progress.mjs');
      result = await runProgress();
      break;
    }
    case 'sync-legacy': {
      const { runSyncLegacy } = await import('./commands/sync-legacy.mjs');
      result = await runSyncLegacy({
        force: flags.has('force'),
        allowOutOfScope: flags.has('allow-out-of-scope'),
      });
      break;
    }
    case 'doctor': {
      const { runDoctor } = await import('./commands/doctor.mjs');
      result = await runDoctor({
        headless: flags.has('headless'),
        runner: flags.get('runner'),
      });
      break;
    }
    case 'interactive': {
      const { runInteractive } = await import('./commands/interactive.mjs');
      result = await runInteractive({
        phase: flags.get('phase'),
        mode: flags.get('mode'),
        runner: flags.get('runner'),
        notes: flags.get('notes'),
        skipResearch: flags.has('skip-research'),
        gaps: flags.has('gaps'),
        gapsOnly: flags.has('gaps-only'),
        strict: flags.has('strict') ? true : undefined,
        headless: flags.has('headless'),
        forceSync: flags.has('force'),
        allowOutOfScope: flags.has('allow-out-of-scope'),
        json: asJson,
      });
      break;
    }
    case 'loop:list': {
      const { runLoopList } = await import('./commands/loop-list.mjs');
      result = await runLoopList();
      break;
    }
    case 'loop:new': {
      const { runLoopNew } = await import('./commands/loop-new.mjs');
      result = await runLoopNew(positional[0], {
        name: flags.get('name'),
        scope: flags.get('scope'),
        profile: flags.get('profile'),
        runner: flags.get('runner'),
      });
      break;
    }
    case 'loop:use': {
      const { runLoopUse } = await import('./commands/loop-use.mjs');
      result = await runLoopUse(positional[0]);
      break;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }

  if (loopContext && result && typeof result === 'object') {
    result.loopId = loopContext.loopId;
    result.planningRoot = loopContext.planningRoot;
  }

  printResult(result, asJson);
  if (result?.ok === false) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`forge-loop error: ${error.message}`);
  process.exitCode = 1;
});
