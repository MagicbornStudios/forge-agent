'use client';

import { useMemo } from 'react';
import { REPO_EDITOR_PANEL_SPECS, panelIdFromVisibilityKey } from './editor-panels';
import { useRepoStudioShellStore } from './store';
import { getWorkspaceHiddenPanelIds } from './workspace-presets';

export function useRepoPanelVisibility() {
  const activeWorkspaceId = useRepoStudioShellStore((state) => state.route.activeWorkspaceId);
  const workspaceHiddenPanelIds = useRepoStudioShellStore((state) => state.workspaceHiddenPanelIds);
  const setPanelVisibleForWorkspace = useRepoStudioShellStore((state) => state.setPanelVisibleForWorkspace);
  const restoreWorkspacePanels = useRepoStudioShellStore((state) => state.restoreWorkspacePanels);

  const hiddenPanelIds = workspaceHiddenPanelIds[activeWorkspaceId] || getWorkspaceHiddenPanelIds(activeWorkspaceId);

  const visibility = useMemo(() => {
    const hidden = new Set(hiddenPanelIds);
    const map: Record<string, boolean> = {};
    for (const spec of REPO_EDITOR_PANEL_SPECS) {
      map[spec.key] = !hidden.has(spec.id);
    }
    return map;
  }, [hiddenPanelIds]);

  return {
    panelSpecs: REPO_EDITOR_PANEL_SPECS,
    visibility,
    setVisibleByPanelId: (panelId: string, visible: boolean) => {
      setPanelVisibleForWorkspace(activeWorkspaceId, panelId, visible);
    },
    setVisibleByKey: (key: string, visible: boolean) => {
      const panelId = panelIdFromVisibilityKey(key);
      if (!panelId) return;
      setPanelVisibleForWorkspace(activeWorkspaceId, panelId, visible);
    },
    restoreAllPanels: () => restoreWorkspacePanels(activeWorkspaceId),
  };
}
