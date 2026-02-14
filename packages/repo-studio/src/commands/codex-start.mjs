import { loadRepoStudioConfig } from '../lib/config.mjs';
import { startCodexServer } from '../lib/codex.mjs';

export async function runCodexStart(options = {}) {
  const config = await loadRepoStudioConfig();
  const result = await startCodexServer(config, {
    wsPort: options.wsPort,
    reuse: options.reuse !== false,
  });
  return {
    ...result,
    report: [
      '# RepoStudio Codex Start',
      '',
      `ok: ${result.ok ? 'true' : 'false'}`,
      `reused: ${result.reused ? 'true' : 'false'}`,
      result.pid ? `pid: ${result.pid}` : null,
      result.wsUrl ? `ws: ${result.wsUrl}` : null,
      result.message ? `message: ${result.message}` : null,
    ].filter(Boolean).join('\n') + '\n',
  };
}
