// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- .mjs modules lack declarations for dts build
// @ts-ignore
import { SHOWCASE_CATALOG_DATA } from './catalog-data.mjs';
// @ts-ignore
import { SHOWCASE_CODE_BY_DEMO_ID } from './catalog-code.generated.mjs';
import type { ShowcaseCatalog, ShowcaseEntry, ShowcaseSection, ShowcaseSectionId } from './types';

function mergeCatalogWithGeneratedCode(
  catalog: ShowcaseCatalog,
  codeByDemoId: Record<string, { path: string; language?: string; code: string }[]>,
): ShowcaseCatalog {
  return {
    sections: catalog.sections.map((section) => ({
      ...section,
      entries: section.entries.map((entry) => {
        const override = codeByDemoId[entry.demoId];
        if (!override) return entry;
        return { ...entry, code: { files: override } };
      }),
    })),
  };
}

const SHOWCASE_CATALOG = mergeCatalogWithGeneratedCode(
  SHOWCASE_CATALOG_DATA as ShowcaseCatalog,
  SHOWCASE_CODE_BY_DEMO_ID,
);

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

