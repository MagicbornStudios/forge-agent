import fs from 'node:fs';

import { loadRepoStudioConfig } from '../lib/config.mjs';
import { runCodexExec } from '../lib/codex.mjs';

function readPromptFromStdin() {
  try {
    if (process.stdin.isTTY) return '';
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

export async function runCodexExecCommand(options = {}) {
  const config = await loadRepoStudioConfig();
  const prompt = String(options.prompt || '').trim() || readPromptFromStdin().trim();
  const result = await runCodexExec(config, {
    prompt,
    input: options.input,
  });
  return {
    ...result,
    report: [
      '# RepoStudio Codex Exec',
      '',
      `ok: ${result.ok ? 'true' : 'false'}`,
      result.code != null ? `code: ${result.code}` : null,
      result.command ? `command: ${result.command}` : null,
      result.message ? `message: ${result.message}` : null,
      result.stderr ? `stderr: ${result.stderr}` : null,
    ].filter(Boolean).join('\n') + '\n',
  };
}
