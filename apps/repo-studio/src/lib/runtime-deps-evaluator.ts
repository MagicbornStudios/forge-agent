import type { DependencyHealth } from '@/lib/api/types';

export function evaluateRuntimeDepsSnapshot(input: {
  deps: DependencyHealth;
  desktop: Record<string, unknown> | null;
}) {
  const deps = input.deps;
  const desktop = input.desktop;
  const depsReady = deps.dockviewPackageResolved
    && deps.dockviewCssResolved
    && deps.sharedStylesResolved
    && deps.cssPackagesResolved
    && deps.runtimePackagesResolved;
  const desktopRuntimeReady = desktop
    ? Boolean(
      desktop.electronInstalled
      && desktop.sqlitePathWritable
      && desktop.watcherAvailable,
    )
    : false;
  const desktopStandaloneReady = desktop
    ? Boolean(desktop.nextStandalonePresent)
    : false;
  const ok = depsReady && desktopRuntimeReady;
  const severity = !depsReady || !desktopRuntimeReady
    ? 'fail'
    : desktopStandaloneReady
      ? 'ok'
      : 'warn';

  return {
    ok,
    severity,
    desktopRuntimeReady,
    desktopStandaloneReady,
  } as const;
}
