import { stopRuntime } from '../lib/runtime-manager.mjs';

export async function runStop(options = {}) {
  const mode = options.desktopRuntime === true
    ? 'desktop'
    : options.appRuntime === true
      ? 'app'
      : options.packageRuntime === true
        ? 'package'
        : undefined;

  const result = await stopRuntime({ mode });
  const report = [
    '# RepoStudio Stop',
    '',
    `ok: ${result.ok ? 'true' : 'false'}`,
    `stopped: ${result.stopped ? 'true' : 'false'}`,
    result.state?.mode ? `mode: ${result.state.mode}` : null,
    result.state?.pid ? `pid: ${result.state.pid}` : null,
    result.state?.desktop?.electronPid ? `desktop.electronPid: ${result.state.desktop.electronPid}` : null,
    result.state?.desktop?.serverPid ? `desktop.serverPid: ${result.state.desktop.serverPid}` : null,
    result.message ? `message: ${result.message}` : null,
  ].filter(Boolean).join('\n');

  return {
    ...result,
    report: `${report}\n`,
  };
}

