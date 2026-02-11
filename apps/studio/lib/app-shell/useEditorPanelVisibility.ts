'use client';

import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useSettingsStore } from '@/lib/settings/store';
import { useEditorPanels } from '@/lib/editor-registry/panel-registry';
import { EDITOR_PANEL_SPECS, type EditorPanelSpec } from './editor-panels';

function deriveSpecsFromRegistry(editorId: string, panels: ReturnType<typeof useEditorPanels>): EditorPanelSpec[] {
  const all = [
    ...panels.left,
    ...panels.main,
    ...panels.right,
    ...panels.bottom,
  ];
  if (all.length === 0) return EDITOR_PANEL_SPECS[editorId] ?? [];
  return all.map((p) => ({
    id: p.id,
    label: p.title,
    key: `panel.visible.${editorId}-${p.id}`,
  }));
}

/**
 * Panel visibility for one editor. Keys are app-scoped (panel.visible.{editor}-{panelId}).
 * Panel list comes from panel registry when the editor has registered panels; otherwise falls back to EDITOR_PANEL_SPECS.
 */
export function useEditorPanelVisibility(editorId: string): {
  visibility: Record<string, boolean>;
  setVisible: (key: string, value: boolean) => void;
  restoreAll: () => void;
  panelSpecs: EditorPanelSpec[];
} {
  const setSetting = useSettingsStore((s) => s.setSetting);
  const panels = useEditorPanels(editorId);
  const specs = useMemo(() => deriveSpecsFromRegistry(editorId, panels), [editorId, panels]);

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
