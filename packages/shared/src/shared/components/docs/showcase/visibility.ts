import VISIBILITY from './_showcase-visibility.json';
import type { ShowcaseEntry, ShowcaseSurface } from './types';

interface ShowcaseVisibilityConfig {
  internalOnly: string[];
}

export const SHOWCASE_VISIBILITY = VISIBILITY as ShowcaseVisibilityConfig;

const INTERNAL_ONLY = new Set<string>(SHOWCASE_VISIBILITY.internalOnly);

export function isInternalOnlyShowcaseId(entryId: string): boolean {
  return INTERNAL_ONLY.has(entryId);
}

export function filterShowcaseEntriesForSurface(
  entries: ShowcaseEntry[],
  surface: ShowcaseSurface,
): ShowcaseEntry[] {
  if (surface === 'studio') {
    return entries;
  }

  return entries.filter((entry) => !isInternalOnlyShowcaseId(entry.id));
}

