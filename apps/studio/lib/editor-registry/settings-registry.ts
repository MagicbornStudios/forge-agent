'use client';

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type { SettingsSection } from '@/components/settings/types';

export type SettingsScope = 'app' | 'project' | 'editor' | 'viewport';
const EMPTY_SECTIONS: SettingsSection[] = [];

function scopeKey(scope: SettingsScope, scopeId: string | null): string {
  return `${scope}:${scopeId ?? ''}`;
}

export interface SettingsRegistryState {
  /** scopeKey -> sections */
  sections: Record<string, SettingsSection[]>;
  registerSection: (scope: SettingsScope, scopeId: string | null, section: SettingsSection) => void;
  unregisterSection: (scope: SettingsScope, scopeId: string | null, sectionId: string) => void;
  getSections: (scope: SettingsScope, scopeId: string | null) => SettingsSection[];
}

export const useSettingsRegistryStore = create<SettingsRegistryState>((set, get) => ({
  sections: {},
  registerSection: (scope, scopeId, section) =>
    set((state) => {
      const key = scopeKey(scope, scopeId);
      const list = state.sections[key] ?? [];
      const next = list.filter((s) => s.id !== section.id);
      next.push(section);
      next.sort((a, b) => a.id.localeCompare(b.id));
      return {
        sections: { ...state.sections, [key]: next },
      };
    }),
  unregisterSection: (scope, scopeId, sectionId) =>
    set((state) => {
      const key = scopeKey(scope, scopeId);
      const list = state.sections[key] ?? [];
      const next = list.filter((s) => s.id !== sectionId);
      if (next.length === 0) {
        const { [key]: _, ...rest } = state.sections;
        return { sections: rest };
      }
      return { sections: { ...state.sections, [key]: next } };
    }),
  getSections: (scope, scopeId) => {
    const key = scopeKey(scope, scopeId);
    return get().sections[key] ?? EMPTY_SECTIONS;
  },
}));

export function useSettingsRegistrySections(
  scope: SettingsScope,
  scopeId: string | null
): SettingsSection[] {
  return useSettingsRegistryStore(
    useShallow((s) => s.getSections(scope, scopeId))
  );
}
