import { spawnSync } from 'node:child_process';
import path from 'node:path';

function runGit(args, cwd) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() ?? '',
  };
}

export function isGitRepo(cwd) {
  const probe = runGit(['rev-parse', '--is-inside-work-tree'], cwd);
  return probe.ok && probe.stdout === 'true';
}

export function hasChanges(cwd, files) {
  if (!isGitRepo(cwd)) return false;
  const args = ['status', '--porcelain'];
  if (files && files.length > 0) {
    args.push('--', ...files);
  }
  const result = runGit(args, cwd);
  return result.ok && result.stdout.length > 0;
}

export function formatTaskCommitMessage(phase, plan, task, taskTitle) {
  return `feat(phase-${phase} plan-${plan} task-${task}): ${taskTitle}`;
}

export function formatArtifactCommitMessage(action) {
  return `docs(forge-loop): ${action}`;
}

export function formatVerificationCommitMessage(phase) {
  return `test(phase-${phase}): verification report`;
}

export function commitPaths(cwd, message, files, options = {}) {
  const {
    allowEmpty = false,
    commitScope = null,
    allowOutOfScope = false,
    failOnStagedOutOfScope = true,
  } = options;

  if (!isGitRepo(cwd)) {
    return { committed: false, skipped: true, reason: 'not-a-git-repo' };
  }

  if (!Array.isArray(files) || files.length === 0) {
    return { committed: false, skipped: true, reason: 'no-files' };
  }

  const normalizedFiles = files
    .map((filePath) => normalizeRelPath(cwd, filePath))
    .filter(Boolean);

  if (normalizedFiles.length === 0) {
    return { committed: false, skipped: true, reason: 'no-files' };
  }

  if (!allowOutOfScope && Array.isArray(commitScope) && commitScope.length > 0) {
    const outOfScope = normalizedFiles.filter((filePath) => !isInCommitScope(filePath, commitScope));
    if (outOfScope.length > 0) {
      return {
        committed: false,
        skipped: false,
        reason: 'out-of-scope-files',
        outOfScope,
        commitScope,
      };
    }

    if (failOnStagedOutOfScope) {
      const stagedFiles = getStagedFiles(cwd);
      const stagedOutOfScope = stagedFiles.filter((filePath) => !isInCommitScope(filePath, commitScope));
      if (stagedOutOfScope.length > 0) {
        return {
          committed: false,
          skipped: false,
          reason: 'staged-out-of-scope-files',
          outOfScope: stagedOutOfScope,
          commitScope,
        };
      }
    }
  }

  if (!allowEmpty && !hasChanges(cwd, normalizedFiles)) {
    return { committed: false, skipped: true, reason: 'no-changes' };
  }

  const addResult = runGit(['add', '--', ...normalizedFiles], cwd);
  if (!addResult.ok) {
    return {
      committed: false,
      skipped: false,
      reason: 'git-add-failed',
      stderr: addResult.stderr,
    };
  }

  const commitArgs = ['commit', '-m', message];
  if (allowEmpty) commitArgs.push('--allow-empty');
  commitArgs.push('--', ...normalizedFiles);

  const commitResult = runGit(commitArgs, cwd);
  if (!commitResult.ok) {
    return {
      committed: false,
      skipped: false,
      reason: 'git-commit-failed',
      stderr: commitResult.stderr,
    };
  }

  return {
    committed: true,
    skipped: false,
    reason: null,
    stdout: commitResult.stdout,
  };
}

function normalizeRelPath(cwd, filePath) {
  if (!filePath) return null;
  const raw = String(filePath).trim();
  if (!raw) return null;

  const absolute = path.isAbsolute(raw) ? raw : path.join(cwd, raw);
  const relative = path.relative(cwd, absolute);
  return relative.replace(/\\/g, '/');
}

function escapeRegexChar(character) {
  return /[\\^$+?.()|{}[\]]/.test(character) ? `\\${character}` : character;
}

function globToRegex(glob) {
  const normalized = String(glob || '').replace(/\\/g, '/');
  let source = '^';

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];

    if (char === '*' && next === '*') {
      source += '.*';
      index += 1;
      continue;
    }

    if (char === '*') {
      source += '[^/]*';
      continue;
    }

    source += escapeRegexChar(char);
  }

  source += '$';
  return new RegExp(source);
}

export function isInCommitScope(filePath, commitScope) {
  const normalizedFile = String(filePath || '').replace(/\\/g, '/');
  return commitScope.some((pattern) => globToRegex(pattern).test(normalizedFile));
}

export function assertCommitResult(result, contextLabel = 'forge-loop commit') {
  if (!result) {
    throw new Error(`${contextLabel}: commit result missing`);
  }

  if (result.committed || result.skipped) {
    return result;
  }

  if (result.reason === 'out-of-scope-files') {
    throw new Error(
      `${contextLabel}: auto-commit blocked by commit scope. Out-of-scope files: ${(result.outOfScope || []).join(', ')}`,
    );
  }

  if (result.reason === 'staged-out-of-scope-files') {
    throw new Error(
      `${contextLabel}: auto-commit blocked by staged out-of-scope files: ${(result.outOfScope || []).join(', ')}`,
    );
  }

  throw new Error(`${contextLabel}: ${result.reason || 'unknown commit failure'}${result.stderr ? ` (${result.stderr})` : ''}`);
}

export function getChangedFilesSinceHead(cwd) {
  if (!isGitRepo(cwd)) return [];
  const result = runGit(['diff', '--name-only', 'HEAD', '--'], cwd);
  if (!result.ok) return [];
  if (!result.stdout) return [];
  return result.stdout.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function getStagedFiles(cwd) {
  if (!isGitRepo(cwd)) return [];
  const result = runGit(['diff', '--cached', '--name-only', '--'], cwd);
  if (!result.ok || !result.stdout) return [];
  return result.stdout.split('\n').map((line) => line.trim()).filter(Boolean);
}

export function runCommand(cwd, command, args = []) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return {
    command: `${command} ${args.join(' ')}`.trim(),
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() ?? '',
  };
}
