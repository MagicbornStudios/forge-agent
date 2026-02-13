#!/usr/bin/env node

import { parseSimpleFlags } from './lib/paths.mjs';
import { runMigrateLegacy } from './commands/migrate-legacy.mjs';
import { runNewProject } from './commands/new-project.mjs';
import { runDiscussPhase } from './commands/discuss-phase.mjs';
import { runPlanPhase } from './commands/plan-phase.mjs';
import { runExecutePhase } from './commands/execute-phase.mjs';
import { runVerifyWork } from './commands/verify-work.mjs';
import { runProgress } from './commands/progress.mjs';
import { runSyncLegacy } from './commands/sync-legacy.mjs';
import { runDoctor } from './commands/doctor.mjs';

function printUsage() {
  console.log(`forge-loop v1.1\n\nUsage:\n  forge-loop <command> [options]\n\nFirst run:\n  forge-loop new-project --fresh --profile generic\n  forge-loop doctor\n\nCommands:\n  new-project [--fresh] [--profile forge-agent|generic]\n  migrate-legacy\n  discuss-phase <phase> [--notes "..."]\n  plan-phase <phase> [--skip-research] [--gaps]\n  execute-phase <phase> [--gaps-only] [--non-interactive]\n  verify-work <phase> [--non-interactive] [--strict]\n  progress\n  sync-legacy\n  doctor\n\nRunbooks:\n  docs/01-quickstart.md\n`);
}

function printResult(result) {
  if (!result) return;

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
      console.log(`- ${check.command}: ${check.ok ? 'PASS' : 'FAIL'}`);
    }
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];

  if (!command || ['-h', '--help', 'help'].includes(command)) {
    printUsage();
    return;
  }

  const { positional, flags } = parseSimpleFlags(argv.slice(1));

  let result = null;

  switch (command) {
    case 'new-project':
      result = await runNewProject({
        fresh: flags.has('fresh'),
        profile: flags.get('profile'),
      });
      break;
    case 'migrate-legacy':
      result = await runMigrateLegacy();
      break;
    case 'discuss-phase':
      result = await runDiscussPhase(positional[0], { notes: flags.get('notes') });
      break;
    case 'plan-phase':
      result = await runPlanPhase(positional[0], {
        skipResearch: flags.has('skip-research'),
        gaps: flags.has('gaps'),
      });
      break;
    case 'execute-phase':
      result = await runExecutePhase(positional[0], {
        gapsOnly: flags.has('gaps-only'),
        nonInteractive: flags.has('non-interactive'),
        allowOutOfScope: flags.has('allow-out-of-scope'),
      });
      break;
    case 'verify-work':
      result = await runVerifyWork(positional[0], {
        nonInteractive: flags.has('non-interactive'),
        strict: flags.has('strict') ? true : undefined,
        allowOutOfScope: flags.has('allow-out-of-scope'),
      });
      break;
    case 'progress':
      result = await runProgress();
      break;
    case 'sync-legacy':
      result = await runSyncLegacy({
        force: flags.has('force'),
        allowOutOfScope: flags.has('allow-out-of-scope'),
      });
      break;
    case 'doctor':
      result = await runDoctor();
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }

  printResult(result);
}

main().catch((error) => {
  console.error(`forge-loop error: ${error.message}`);
  process.exitCode = 1;
});
