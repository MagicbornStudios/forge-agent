import { stopCodexServer } from '../lib/codex.mjs';

export async function runCodexStop() {
  const result = await stopCodexServer();
  return {
    ...result,
    report: [
      '# RepoStudio Codex Stop',
      '',
      `ok: ${result.ok ? 'true' : 'false'}`,
      `stopped: ${result.stopped ? 'true' : 'false'}`,
      result.runtime?.pid ? `pid: ${result.runtime.pid}` : null,
      result.runtime?.wsUrl ? `ws: ${result.runtime.wsUrl}` : null,
      result.message ? `message: ${result.message}` : null,
    ].filter(Boolean).join('\n') + '\n',
  };
}
