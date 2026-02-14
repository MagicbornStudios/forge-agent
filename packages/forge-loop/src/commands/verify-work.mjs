import path from 'node:path';

import { PLANNING_FILES, PLANNING_PROMPTS_DIR } from '../lib/paths.mjs';
import { fileExists, readText, writeText } from '../lib/fs-utils.mjs';
import {
  getAutoCommitEnabled,
  getCommitScope,
  getVerificationProfile,
  isStrictVerificationEnabled,
  loadPlanningConfig,
} from '../lib/config.mjs';
import {
  assertCommitResult,
  commitPaths,
  formatVerificationCommitMessage,
  getChangedFilesSinceHead,
  runCommand,
} from '../lib/git.mjs';
import { askLine } from '../lib/prompting.mjs';
import { ensureHeadlessEnvReady, shouldRunHeadlessEnvGate } from '../lib/env-preflight.mjs';
import {
  ensurePhaseDir,
  findPhase,
  listPhasePlanFiles,
  parsePlanFrontmatter,
} from '../lib/planning.mjs';

function collectPlanModifiedFiles(planPaths) {
  const files = new Set();

  for (const planPath of planPaths) {
    const frontmatter = parsePlanFrontmatter(readText(planPath, ''));
    const modified = Array.isArray(frontmatter.files_modified)
      ? frontmatter.files_modified
      : [];
    for (const filePath of modified) {
      files.add(filePath);
    }
  }

  return [...files];
}

function collectMustHaves(planPaths) {
  const truths = [];
  for (const planPath of planPaths) {
    const content = readText(planPath, '');
    const matches = content.match(/truths:\n([\s\S]*?)(?:\n\s{2}[A-Za-z_]+:|\n---|$)/i);
    if (!matches) continue;

    const section = matches[1];
    for (const line of section.split('\n')) {
      const match = line.match(/^\s*-\s*"?(.*?)"?\s*$/);
      if (match && match[1].trim()) truths.push(match[1].trim());
    }
  }

  if (truths.length === 0) {
    return ['Core phase goal is implemented and verifiable.'];
  }

  return truths;
}

function evaluateVerification(automatedChecks, responses) {
  const failedChecks = automatedChecks.filter((check) => !check.ok);
  const failedUat = responses.filter((response) => response.result === 'issue');
  const skippedUat = responses.filter((response) => response.result === 'skipped');

  const status = failedChecks.length > 0 || failedUat.length > 0
    ? 'gaps_found'
    : skippedUat.length > 0
      ? 'human_needed'
      : 'passed';

  const score = `${responses.filter((item) => item.result === 'pass').length}/${responses.length}`;

  return {
    status,
    score,
    failedChecks,
    failedUat,
    skippedUat,
  };
}

function buildUatMarkdown(phase, truths, responses) {
  const tests = truths
    .map((truth, index) => {
      const response = responses[index];
      return `### ${index + 1}. ${truth}\nexpected: ${truth}\nresult: ${response.result}\nnotes: ${response.notes || '-'}\n`;
    })
    .join('\n');

  const totals = responses.reduce(
    (acc, response) => {
      acc[response.result] = (acc[response.result] || 0) + 1;
      return acc;
    },
    { pass: 0, issue: 0, skipped: 0 },
  );

  return `---\nstatus: complete\nphase: ${phase.phaseNumber}-${phase.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}\nupdated: ${new Date().toISOString()}\n---\n\n## Tests\n\n${tests}\n\n## Summary\n\n- total: ${responses.length}\n- pass: ${totals.pass || 0}\n- issue: ${totals.issue || 0}\n- skipped: ${totals.skipped || 0}\n`;
}

function buildVerificationMarkdown({ phase, goal, automatedChecks, responses }) {
  const evaluation = evaluateVerification(automatedChecks, responses);
  const automatedTable = automatedChecks
    .map((check) => `| ${check.command} | ${check.ok ? 'PASS' : 'FAIL'} | ${check.stderr || check.stdout || '-'} |`)
    .join('\n');

  const truthsTable = responses
    .map((response, index) => `| ${index + 1} | ${response.truth} | ${response.result.toUpperCase()} | ${response.notes || '-'} |`)
    .join('\n');

  return `---\nphase: ${phase.phaseNumber}-${phase.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}\nverified: ${new Date().toISOString()}\nstatus: ${evaluation.status}\nscore: ${evaluation.score}\n---\n\n# Phase ${phase.phaseNumber}: ${phase.name} Verification Report\n\n**Phase Goal:** ${goal || 'N/A'}\n**Status:** ${evaluation.status}\n\n## Automated Checks\n\n| Check | Status | Details |\n|---|---|---|\n${automatedTable}\n\n## UAT Truths\n\n| # | Truth | Status | Notes |\n|---|---|---|---|\n${truthsTable}\n\n## Gap Summary\n\n${evaluation.status === 'gaps_found' ? '- Gaps found. Run `forge-loop plan-phase ' + phase.phaseNumber + ' --gaps` and then `forge-loop execute-phase ' + phase.phaseNumber + ' --gaps-only`.' : '- No blocking gaps found.'}\n`;
}

async function collectUatResponses(phase, truths, options = {}) {
  const responses = [];

  for (const truth of truths) {
    if (options.nonInteractive || !process.stdin.isTTY) {
      responses.push({ truth, result: 'skipped', notes: 'Skipped in non-interactive mode.' });
      continue;
    }

    const answer = (await askLine(`UAT: ${truth}\nType 'pass', 'skip', or describe issue: `, 'pass')).trim();
    if (!answer || /^(pass|ok|yes|y)$/i.test(answer)) {
      responses.push({ truth, result: 'pass', notes: 'Confirmed by user.' });
    } else if (/^(skip|n\/a|na)$/i.test(answer)) {
      responses.push({ truth, result: 'skipped', notes: 'Skipped by user.' });
    } else {
      responses.push({ truth, result: 'issue', notes: answer });
    }
  }

  return responses;
}

function shouldRunPlatformBuild(changedFiles) {
  return changedFiles.some(
    (filePath) => filePath.startsWith('apps/platform/') || filePath.startsWith('apps/platform/content/docs/'),
  );
}

function shouldRunStudioBuild(changedFiles) {
  return changedFiles.some((filePath) => filePath.startsWith('apps/studio/') || filePath.startsWith('packages/'));
}

function parseConfigCommand(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') {
    const [command, ...args] = entry.split(' ').map((value) => value.trim()).filter(Boolean);
    if (!command) return null;
    return { command, args };
  }

  if (typeof entry === 'object' && typeof entry.command === 'string') {
    return {
      command: entry.command,
      args: Array.isArray(entry.args) ? entry.args.map((value) => String(value)) : [],
    };
  }

  return null;
}

export function buildVerificationCommandPlan(config, changedFiles) {
  const commands = [];
  const profile = getVerificationProfile(config);

  if (profile === 'forge-loop') {
    if (config?.verification?.tests !== false) {
      commands.push({ command: 'pnpm', args: ['forge-loop:test'] });
    }

    const extra = Array.isArray(config?.verification?.genericCommands)
      ? config.verification.genericCommands
      : [];

    for (const entry of extra) {
      const parsed = parseConfigCommand(entry);
      if (parsed) commands.push(parsed);
    }

    return commands;
  }

  if (config?.verification?.docs !== false) {
    commands.push({ command: 'pnpm', args: ['docs:platform:doctor'] });
    commands.push({ command: 'pnpm', args: ['docs:showcase:doctor'] });
    commands.push({ command: 'pnpm', args: ['docs:runtime:doctor'] });
  }

  if (config?.verification?.build !== false && shouldRunPlatformBuild(changedFiles)) {
    commands.push({ command: 'pnpm', args: ['--filter', '@forge/platform', 'build'] });
  }

  if (config?.verification?.build !== false && shouldRunStudioBuild(changedFiles)) {
    commands.push({ command: 'pnpm', args: ['--filter', '@forge/studio', 'build'] });
  }

  if (config?.verification?.tests !== false && shouldRunStudioBuild(changedFiles)) {
    commands.push({ command: 'pnpm', args: ['--filter', '@forge/studio', 'test', '--', '--runInBand'] });
  }

  commands.push({ command: 'pnpm', args: ['forge-loop:test'] });
  return commands;
}

export async function runVerifyWork(phaseNumber, options = {}) {
  if (!fileExists(PLANNING_FILES.roadmap)) {
    throw new Error('ROADMAP.md not found. Run forge-loop new-project first.');
  }

  const roadmap = readText(PLANNING_FILES.roadmap, '');
  const phase = findPhase(roadmap, phaseNumber);
  if (!phase) {
    throw new Error(`Phase ${phaseNumber} not found in .planning/ROADMAP.md`);
  }

  const phaseDir = ensurePhaseDir(phase.phaseNumber, phase.name);
  const planPaths = listPhasePlanFiles(phaseDir.fullPath);
  if (planPaths.length === 0) {
    throw new Error(`No plan files found for phase ${phase.phaseNumber}.`);
  }

  const config = loadPlanningConfig();
  if (shouldRunHeadlessEnvGate(config, options)) {
    ensureHeadlessEnvReady(config, {
      headless: options.headless === true,
      nonInteractive: options.nonInteractive === true,
    });
  }
  const autoCommit = options.autoCommit ?? getAutoCommitEnabled(config);
  const commitScope = getCommitScope(config);
  const strictMode = isStrictVerificationEnabled(config, options.strict);

  const planFiles = collectPlanModifiedFiles(planPaths);
  const gitChangedFiles = getChangedFilesSinceHead(process.cwd());
  const changedFiles = [...new Set([...planFiles, ...gitChangedFiles])];

  const commandPlan = buildVerificationCommandPlan(config, changedFiles);
  const checks = commandPlan.map((item) => runCommand(process.cwd(), item.command, item.args));

  const truths = collectMustHaves(planPaths);
  const responses = await collectUatResponses(phase, truths, { nonInteractive: options.nonInteractive });

  const uatPath = path.join(phaseDir.fullPath, `${phase.phaseNumber}-UAT.md`);
  writeText(uatPath, buildUatMarkdown(phase, truths, responses));

  const verificationPath = path.join(phaseDir.fullPath, `${phase.phaseNumber}-VERIFICATION.md`);
  writeText(
    verificationPath,
    buildVerificationMarkdown({
      phase,
      goal: phase.goal,
      automatedChecks: checks,
      responses,
    }),
  );

  const promptPath = path.join(PLANNING_PROMPTS_DIR, `${phase.phaseNumber}-verify-prompt.md`);
  writeText(
    promptPath,
    `# Forge Loop Verify Prompt - Phase ${phase.phaseNumber}\n\nUse this prompt to manually inspect verification artifacts:\n- ${path.relative(process.cwd(), verificationPath).replace(/\\/g, '/')}\n- ${path.relative(process.cwd(), uatPath).replace(/\\/g, '/')}\n\nIf status is gaps_found:\n1. Run forge-loop plan-phase ${phase.phaseNumber} --gaps\n2. Run forge-loop execute-phase ${phase.phaseNumber} --gaps-only\n`,
  );

  if (autoCommit) {
    const commitFiles = [verificationPath, uatPath, promptPath].map((item) => path.relative(process.cwd(), item).replace(/\\/g, '/'));
    const commitResult = commitPaths(process.cwd(), formatVerificationCommitMessage(phase.phaseNumber), commitFiles, {
      commitScope,
      allowOutOfScope: options.allowOutOfScope === true,
    });
    assertCommitResult(commitResult, `verify-work ${phase.phaseNumber}`);
  }

  const evaluation = evaluateVerification(checks, responses);
  const nextAction = evaluation.status === 'gaps_found'
    ? `forge-loop plan-phase ${phase.phaseNumber} --gaps`
    : evaluation.status === 'human_needed'
      ? `forge-loop verify-work ${phase.phaseNumber}`
      : 'forge-loop progress';

  const summary = {
    status: evaluation.status,
    nextAction,
    blockingGaps: [
      ...evaluation.failedChecks.map((check) => check.command),
      ...evaluation.failedUat.map((item) => item.truth),
    ],
    skippedTruths: evaluation.skippedUat.map((item) => item.truth),
  };

  if (strictMode && (evaluation.failedChecks.length > 0 || evaluation.failedUat.length > 0)) {
    throw new Error(
      `Verification failed in strict mode: ${evaluation.failedChecks.length} automated check(s) failed, ${evaluation.failedUat.length} UAT issue(s) reported. Next: ${nextAction}`,
    );
  }

  return {
    phase,
    checks,
    responses,
    verificationPath,
    uatPath,
    strictMode,
    status: evaluation.status,
    summary,
    nextAction: summary.nextAction,
  };
}
