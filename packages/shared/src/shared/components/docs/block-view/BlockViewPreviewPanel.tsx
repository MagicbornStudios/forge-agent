'use client';

import * as React from 'react';
import { cn } from '@forge/ui/lib/utils';
import type { BlockViewViewport } from './types';

const VIEWPORT_WIDTHS: Record<BlockViewViewport, string> = {
  desktop: '100%',
  tablet: '820px',
  mobile: '390px',
};

interface BlockViewPreviewPanelProps {
  preview: React.ReactNode;
  viewport: BlockViewViewport;
  refreshKey: number;
  visible: boolean;
  className?: string;
}

export function BlockViewPreviewPanel({
  preview,
  viewport,
  refreshKey,
  visible,
  className,
}: BlockViewPreviewPanelProps) {
  const viewportWidth = VIEWPORT_WIDTHS[viewport];

  return (
    <div
      className={cn('overflow-hidden rounded-xl border', visible ? 'block' : 'hidden', className)}
      data-slot="block-view-preview"
    >
      {preview}
    </div>
  );
}
