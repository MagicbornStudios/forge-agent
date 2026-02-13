'use client';

import * as React from 'react';
import { cn } from '@forge/ui/lib/utils';
import { BlockViewCodePanel } from './BlockViewCodePanel';
import { BlockViewPreviewPanel } from './BlockViewPreviewPanel';
import { BlockViewToolbar } from './BlockViewToolbar';
import type { BlockViewMode, BlockViewProps } from './types';

function toCssHeight(height: number): string {
  if (!Number.isFinite(height)) return '640px';
  if (height < 280) return '280px';
  if (height > 1600) return '1600px';
  return `${Math.round(height)}px`;
}

export function BlockView({
  preview,
  files,
  className,
  previewHeight = 640,
  defaultMode = 'preview',
  defaultViewport = 'desktop',
  onCopied,
}: BlockViewProps) {
  const [mode, setMode] = React.useState<BlockViewMode>(defaultMode);
  const [viewport, setViewport] = React.useState(defaultViewport);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [activeFilePath, setActiveFilePath] = React.useState(files[0]?.path ?? '');
  const activeFile =
    files.find((candidate) => candidate.path === activeFilePath) ??
    files[0] ?? {
      path: 'example.tsx',
      language: 'tsx',
      code: '// No code files configured for this showcase entry.',
    };

  React.useEffect(() => {
    if (!files.some((candidate) => candidate.path === activeFilePath)) {
      setActiveFilePath(files[0]?.path ?? '');
    }
  }, [files, activeFilePath]);

  const cssHeight = toCssHeight(previewHeight);

  return (
    <section
      data-view={mode}
      className={cn(
        'group/block-view-wrapper flex min-w-0 scroll-mt-24 flex-col gap-3 overflow-hidden rounded-xl border p-4',
        className,
      )}
      style={{ '--height': cssHeight } as React.CSSProperties}
    >
      <BlockViewToolbar
        mode={mode}
        onModeChange={setMode}
      />

      <BlockViewPreviewPanel
        preview={preview}
        viewport={viewport}
        refreshKey={refreshKey}
        visible={mode === 'preview'}
      />
      <BlockViewCodePanel
        files={files}
        activeFile={activeFile}
        onSelectFile={setActiveFilePath}
        onCopied={onCopied}
        visible={mode === 'code'}
      />
    </section>
  );
}
