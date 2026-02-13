import { SHOWCASE_CATALOG_DATA } from './catalog-data.mjs';
import type { ShowcaseCatalog, ShowcaseEntry, ShowcaseSection, ShowcaseSectionId } from './types';

const SHOWCASE_CATALOG = SHOWCASE_CATALOG_DATA as ShowcaseCatalog;

const SHOWCASE_SECTIONS = SHOWCASE_CATALOG.sections as ShowcaseSection[];

const SHOWCASE_ENTRY_BY_ID = new Map<string, ShowcaseEntry>();
for (const section of SHOWCASE_SECTIONS) {
  for (const entry of section.entries) {
    SHOWCASE_ENTRY_BY_ID.set(entry.id, entry);
  }
}

export { SHOWCASE_CATALOG, SHOWCASE_SECTIONS };

export const SHOWCASE_IDS = [...SHOWCASE_ENTRY_BY_ID.keys()];

export function getShowcaseSection(sectionId: ShowcaseSectionId): ShowcaseSection | undefined {
  return SHOWCASE_SECTIONS.find((section) => section.id === sectionId);
}

export function getShowcaseEntry(entryId: string): ShowcaseEntry | undefined {
  return SHOWCASE_ENTRY_BY_ID.get(entryId);
}

export function isShowcaseEntryId(entryId: string): boolean {
  return SHOWCASE_ENTRY_BY_ID.has(entryId);
}

export function listShowcaseEntries(): ShowcaseEntry[] {
  return SHOWCASE_SECTIONS.flatMap((section) => section.entries);
}

