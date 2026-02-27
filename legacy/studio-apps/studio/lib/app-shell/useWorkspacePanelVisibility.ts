'use client';

import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import type { WorkspacePanelSpec } from '@forge/shared';
import { useSettingsStore } from '@/lib/settings/store';
import { getWorkspacePanelSpecs } from './app-spec.generated';

/**
 * Panel visibility for one workspace. Keys are app-scoped (panel.visible.{workspace}-{panelId}).
 */
export function useWorkspacePanelVisibility(workspaceId: string): {
  visibility: Record<string, boolean>;
  setVisible: (key: string, value: boolean) => void;
  restoreAll: () => void;
  panelSpecs: WorkspacePanelSpec[];
} {
  const setSetting = useSettingsStore((s) => s.setSetting);
  const specs = useMemo(() => getWorkspacePanelSpecs(workspaceId), [workspaceId]);

  const visibility = useSettingsStore(
    useShallow(
      useCallback(
        (s) => {
          const out: Record<string, boolean> = {};
          for (const spec of specs) {
            const v = s.getSettingValue(spec.key);
            out[spec.key] = v !== false;
          }
          return out;
        },
        [specs]
      )
    )
  );

  const setVisible = useCallback(
    (key: string, value: boolean) => {
      setSetting('app', key, value);
    },
    [setSetting]
  );

  const restoreAll = useCallback(() => {
    for (const spec of specs) {
      setSetting('app', spec.key, true);
    }
  }, [specs, setSetting]);

  return useMemo(
    () => ({
      visibility,
      setVisible,
      restoreAll,
      panelSpecs: specs,
    }),
    [visibility, setVisible, restoreAll, specs]
  );
}
