'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/settings/store';
import type { SettingsOverrideRecord } from '@forge/types/payload';
import { SettingsService } from '@/lib/api-client';

/**
 * Fetches settings overrides from the API and hydrates the settings store on mount.
 * Renders nothing. Place once in the app root (e.g. layout) so settings survive refresh.
 */
export function SettingsHydration() {
  const hydrateFromOverrides = useSettingsStore((s) => s.hydrateFromOverrides);

  useEffect(() => {
    let cancelled = false;
    SettingsService.getApiSettings()
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
