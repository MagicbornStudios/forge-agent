'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock, CodeBlockCode } from '@forge/ui/code-block';
import { cn } from '@forge/ui/lib/utils';
import { BlockViewCodeHeader } from './BlockViewCodeHeader';
import { BlockViewFileTree } from './BlockViewFileTree';
import type { BlockViewFile } from './types';

const isMarkdown = (lang?: string) => lang === 'md' || lang === 'markdown';

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
      className={cn('overflow-hidden rounded-xl', visible ? 'block' : 'hidden', className)}
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
          <div className="min-h-0 min-w-0 flex-1 overflow-auto border-0">
            {isMarkdown(activeFile.language) ? (
              <div className="prose prose-sm dark:prose-invert max-w-none p-4 border-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeFile.code}</ReactMarkdown>
              </div>
            ) : (
              <CodeBlock className="h-full min-h-0 min-w-0 overflow-hidden rounded-none !border-0">
                <CodeBlockCode
                  code={activeFile.code}
                  language={activeFile.language ?? 'tsx'}
                  showLineNumbers
                  className="min-h-full min-w-0 [&>pre]:!min-h-full [&>pre]:!min-w-0 [&>pre]:!border-0 [&>pre]:!shadow-none [&>pre]:!outline-none [&>pre>code]:!border-0"
                />
              </CodeBlock>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
