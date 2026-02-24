'use client';

import * as React from 'react';
import { Code2, Eye, X } from 'lucide-react';
import { cn } from '@forge/ui/lib/utils';
import { WorkspacePanel, EditorButton } from '../../editor';
import { BlockViewCodePanel } from './BlockViewCodePanel';
import { BlockViewPreviewPanel } from './BlockViewPreviewPanel';
import type { BlockViewMode, BlockViewProps } from './types';

function toCssHeight(height: number): string {
  if (!Number.isFinite(height)) return '640px';
  if (height < 280) return '280px';
  if (height > 1600) return '1600px';
  return `${Math.round(height)}px`;
}

export function BlockView({
  id,
  title,
  preview,
  files,
  className,
  previewHeight = 640,
  defaultMode = 'preview',
  defaultViewport = 'desktop',
  onCopied,
  onClose,
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
      <WorkspacePanel
        panelId={`block-view-${id}`}
        title={title}
        hideTitleBar={true}
        headerActions={
          onClose ? (
            <EditorButton
              size="sm"
              variant="ghost"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-3.5" />
            </EditorButton>
          ) : undefined
        }
        scrollable={false}
        defaultTabId={defaultMode}
        activeTabId={mode}
        onTabChange={(next) => setMode(next as BlockViewMode)}
        className="flex-1 min-h-[var(--height,640px)]"
      >
        <WorkspacePanel.Tab id="preview" label="Preview" icon={<Eye className="size-3.5" />}>
          <BlockViewPreviewPanel
            preview={preview}
            viewport={viewport}
            refreshKey={refreshKey}
            visible={true}
          />
        </WorkspacePanel.Tab>
        <WorkspacePanel.Tab id="code" label="Code" icon={<Code2 className="size-3.5" />}>
          <BlockViewCodePanel
            files={files}
            activeFile={activeFile}
            onSelectFile={setActiveFilePath}
            onCopied={onCopied}
            visible={true}
          />
        </WorkspacePanel.Tab>
      </WorkspacePanel>
    </section>
  );
}
