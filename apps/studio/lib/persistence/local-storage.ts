/**
 * Versioned localStorage: app session (route, last doc ids) and drafts are persisted via
 * Zustand persist middleware (app-shell store, graph/video stores). See docs/agent-artifacts/core/decisions.md.
 * Add any other versioned keys here if needed.
 *
 * Legacy: getAppShellRoute/setAppShellRoute exist for AppShellRoutePersistence (unused);
 * route persistence is handled by the app-shell store's persist middleware.
 */

import type { EditorId } from '@/lib/app-shell/store';

const APP_SHELL_ROUTE_KEY = 'forge-app-shell-route';

export interface AppShellRouteSaved {
  activeWorkspaceId: EditorId;
  openWorkspaceIds: EditorId[];
}

export function getAppShellRoute(): AppShellRouteSaved | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(APP_SHELL_ROUTE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppShellRouteSaved;
  } catch {
    return null;
  }
}

export function setAppShellRoute(route: AppShellRouteSaved): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APP_SHELL_ROUTE_KEY, JSON.stringify(route));
  } catch {
    // ignore
  }
}
