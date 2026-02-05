'use client';

import { useEffect, useRef } from 'react';
import { useAppShellStore } from '@/lib/app-shell/store';
import { getAppShellRoute, setAppShellRoute } from '@/lib/persistence/local-storage';

/** Restores app shell route from localStorage on mount and persists changes (debounced). */
export function AppShellRoutePersistence() {
  const route = useAppShellStore((s) => s.route);
  const setRoute = useAppShellStore((s) => s.setRoute);
  const mounted = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore on mount (client-only)
  useEffect(() => {
    const saved = getAppShellRoute();
    if (saved) {
      setRoute({
        activeWorkspaceId: saved.activeWorkspaceId,
        openWorkspaceIds: saved.openWorkspaceIds,
      });
    }
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, [setRoute]);

  // Persist on route change (debounced)
  useEffect(() => {
    if (!mounted.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setAppShellRoute({
        activeWorkspaceId: route.activeWorkspaceId,
        openWorkspaceIds: route.openWorkspaceIds,
      });
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [route.activeWorkspaceId, route.openWorkspaceIds]);

  return null;
}
