/**
 * Versioned localStorage keys and get/set helpers for app shell route and last document ids.
 * See docs/architecture/unified-workspace.md and plan: persistence (Slice A).
 */

const APP_SHELL_KEY = 'forge:app-shell:v1';
const LAST_GRAPH_ID_KEY = 'forge:lastGraphId:v1';
const LAST_VIDEO_DOC_ID_KEY = 'forge:lastVideoDocId:v1';

export type PersistedAppShellRoute = {
  activeWorkspaceId: string;
  openWorkspaceIds: string[];
};

const VALID_WORKSPACE_IDS = ['forge', 'video'] as const;

function isValidWorkspaceId(id: string): id is (typeof VALID_WORKSPACE_IDS)[number] {
  return VALID_WORKSPACE_IDS.includes(id as any);
}

export function getAppShellRoute(): PersistedAppShellRoute | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(APP_SHELL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as PersistedAppShellRoute).activeWorkspaceId === 'string' &&
      Array.isArray((parsed as PersistedAppShellRoute).openWorkspaceIds)
    ) {
      const p = parsed as PersistedAppShellRoute;
      const active = isValidWorkspaceId(p.activeWorkspaceId) ? p.activeWorkspaceId : 'forge';
      const open = (p.openWorkspaceIds as string[]).filter((id) => isValidWorkspaceId(id));
      if (open.length === 0) return null;
      return { activeWorkspaceId: active, openWorkspaceIds: open };
    }
    return null;
  } catch {
    return null;
  }
}

export function setAppShellRoute(route: PersistedAppShellRoute): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APP_SHELL_KEY, JSON.stringify(route));
  } catch {
    // ignore
  }
}

export function getLastGraphId(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_GRAPH_ID_KEY);
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function setLastGraphId(id: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_GRAPH_ID_KEY, String(id));
  } catch {
    // ignore
  }
}

export function getLastVideoDocId(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_VIDEO_DOC_ID_KEY);
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function setLastVideoDocId(id: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_VIDEO_DOC_ID_KEY, String(id));
  } catch {
    // ignore
  }
}
