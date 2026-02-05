'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/settings/store';
import type { SettingsOverrideRecord } from '@forge/types/payload';

/**
 * Fetches settings overrides from the API and hydrates the settings store on mount.
 * Renders nothing. Place once in the app root (e.g. layout) so settings survive refresh.
 */
export function SettingsHydration() {
  const hydrateFromOverrides = useSettingsStore((s) => s.hydrateFromOverrides);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to fetch settings'))))
      .then((docs: SettingsOverrideRecord[]) => {
        if (!cancelled && Array.isArray(docs)) {
          hydrateFromOverrides(docs);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('[SettingsHydration] Could not load overrides:', err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hydrateFromOverrides]);

  return null;
}
