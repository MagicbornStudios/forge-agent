import {
  detectRuntimeByPort,
  loadActiveRuntimeState,
  runtimeUrlFor,
  writeRuntimeState,
} from '../lib/runtime-manager.mjs';

export async function runStatus() {
  const runtime = await loadActiveRuntimeState({ cleanupStale: true });
  if (!runtime.running || !runtime.state) {
    const detectedApp = await detectRuntimeByPort({ mode: 'app' });
    const detectedPackage = detectedApp ? null : await detectRuntimeByPort({ mode: 'package' });
    const detected = detectedApp || detectedPackage;
    if (!detected) {
      return {
        ok: true,
        running: false,
        message: 'RepoStudio runtime is not running.',
        report: '# RepoStudio Status\n\nstate: stopped\n',
      };
    }

    await writeRuntimeState(detected);
    const url = runtimeUrlFor(detected);
    const report = [
      '# RepoStudio Status',
      '',
      'state: running (recovered)',
      `mode: ${detected.mode}`,
      `pid: ${detected.pid}`,
      `port: ${detected.port}`,
      `url: ${url || 'n/a'}`,
      'source: detected by listening port',
    ].join('\n');

    return {
      ok: true,
      running: true,
      mode: detected.mode,
      pid: detected.pid,
      port: detected.port,
      url,
      state: detected,
      message: `RepoStudio runtime detected on port ${detected.port} (pid ${detected.pid}).`,
      report: `${report}\n`,
    };
  }

  const state = runtime.state;
  const url = runtimeUrlFor(state);
  const report = [
    '# RepoStudio Status',
    '',
    'state: running',
    `mode: ${state.mode}`,
    `pid: ${state.pid}`,
    `port: ${state.port}`,
    `url: ${url || 'n/a'}`,
    `startedAt: ${state.startedAt || 'unknown'}`,
    `workspaceRoot: ${state.workspaceRoot || process.cwd()}`,
  ].join('\n');

  return {
    ok: true,
    running: true,
    mode: state.mode,
    pid: state.pid,
    port: state.port,
    url,
    startedAt: state.startedAt,
    workspaceRoot: state.workspaceRoot,
    state,
    message: `RepoStudio runtime (${state.mode}) is running at ${url} (pid ${state.pid}).`,
    report: `${report}\n`,
  };
}
