import type * as React from 'react';

export type BlockViewMode = 'preview' | 'code';

export type BlockViewViewport = 'desktop' | 'tablet' | 'mobile';

export type BlockViewSurface = 'studio' | 'platform';

export interface BlockViewFile {
  path: string;
  language?: string;
  code: string;
}

export interface BlockViewProps {
  id: string;
  title: string;
  summary?: string;
  preview: React.ReactNode;
  files: BlockViewFile[];
  className?: string;
  previewHeight?: number;
  defaultMode?: BlockViewMode;
  defaultViewport?: BlockViewViewport;
  installCommand?: string;
  openInNewTabUrl?: string;
  openInV0Url?: string;
  onRefreshPreview?: () => void;
  onCopied?: () => void;
  /** When provided, shows a close button in the panel header. */
  onClose?: () => void;
}
