'use client';

import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useSettingsStore } from '@/lib/settings/store';
import { EDITOR_PANEL_SPECS, type EditorPanelSpec } from './editor-panels';

/**
 * Panel visibility for one editor. Keys are app-scoped (panel.visible.{editor}-{side}).
 * Returns current visibility, per-panel toggle, and restoreAll (set all to true).
 */
export function useEditorPanelVisibility(editorId: string): {
  visibility: Record<string, boolean>;
  setVisible: (key: string, value: boolean) => void;
  restoreAll: () => void;
  panelSpecs: EditorPanelSpec[];
} {
  const setSetting = useSettingsStore((s) => s.setSetting);
  const specs = EDITOR_PANEL_SPECS[editorId] ?? [];

  const visibility = useSettingsStore(
    useShallow(
      useCallback(
        (s) => {
          const panelSpecs = EDITOR_PANEL_SPECS[editorId] ?? [];
          const out: Record<string, boolean> = {};
          for (const spec of panelSpecs) {
            const v = s.getSettingValue(spec.key);
            out[spec.key] = v !== false;
          }
          return out;
        },
        [editorId]
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
