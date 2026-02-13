export type ShowcaseSurface = 'studio' | 'platform';

export type ShowcaseSectionId = 'atoms' | 'molecules' | 'organisms';

export interface ShowcaseCodeFile {
  path: string;
  language?: string;
  code: string;
}

export interface ShowcaseEntry {
  id: string;
  title: string;
  summary: string;
  demoId: string;
  previewHeight?: number;
  installCommand?: string;
  openInNewTabUrl?: string;
  openInV0Url?: string;
  code: {
    files: ShowcaseCodeFile[];
  };
}

export interface ShowcaseSection {
  id: ShowcaseSectionId;
  title: string;
  description: string;
  entries: ShowcaseEntry[];
}

export interface ShowcaseCatalog {
  sections: ShowcaseSection[];
}

