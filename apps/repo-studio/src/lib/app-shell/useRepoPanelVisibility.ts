'use client';

import { useMemo } from 'react';
import { REPO_EDITOR_PANEL_SPECS, panelIdFromVisibilityKey } from './editor-panels';
import { useRepoStudioShellStore } from './store';

export function useRepoPanelVisibility() {
  const hiddenPanelIds = useRepoStudioShellStore((state) => state.hiddenPanelIds);
  const setPanelVisible = useRepoStudioShellStore((state) => state.setPanelVisible);
  const restoreAllPanels = useRepoStudioShellStore((state) => state.restoreAllPanels);

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
    setVisibleByPanelId: setPanelVisible,
    setVisibleByKey: (key: string, visible: boolean) => {
      const panelId = panelIdFromVisibilityKey(key);
      if (!panelId) return;
      setPanelVisible(panelId, visible);
    },
    restoreAllPanels,
  };
}

