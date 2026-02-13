'use client';

import * as React from 'react';
import { CodeBlock, CodeBlockCode } from '@forge/ui/code-block';
import { cn } from '@forge/ui/lib/utils';
import { BlockViewCodeHeader } from './BlockViewCodeHeader';
import { BlockViewFileTree } from './BlockViewFileTree';
import type { BlockViewFile } from './types';

interface BlockViewCodePanelProps {
  files: BlockViewFile[];
  activeFile: BlockViewFile;
  onSelectFile: (path: string) => void;
  onCopied?: () => void;
  visible: boolean;
  className?: string;
}

export function BlockViewCodePanel({
  files,
  activeFile,
  onSelectFile,
  onCopied,
  visible,
  className,
}: BlockViewCodePanelProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-xl border', visible ? 'block' : 'hidden', className)}
      data-slot="block-view-code"
    >
      <div className="flex h-[var(--height)] min-h-[360px] bg-card">
        <BlockViewFileTree
          files={files}
          activePath={activeFile.path}
          onSelect={onSelectFile}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <BlockViewCodeHeader
            filePath={activeFile.path}
            code={activeFile.code}
            onCopied={onCopied}
          />
          <div className="min-h-0 flex-1 overflow-auto">
            <CodeBlock className="h-full min-h-0 rounded-none border-0">
              <CodeBlockCode
                code={activeFile.code}
                language={activeFile.language ?? 'tsx'}
                className="min-h-full [&>pre]:!min-h-full"
              />
            </CodeBlock>
          </div>
        </div>
      </div>
    </div>
  );
}
