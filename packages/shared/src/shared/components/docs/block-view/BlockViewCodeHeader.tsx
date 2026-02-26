'use client';

import * as React from 'react';
import { Check, Clipboard } from 'lucide-react';
import { WorkspaceButton } from '../../workspace';
import { cn } from '@forge/ui/lib/utils';

const COPIED_DURATION_MS = 1500;

interface BlockViewCodeHeaderProps {
  filePath: string;
  code: string;
  onCopied?: () => void;
  className?: string;
}

export function BlockViewCodeHeader({
  filePath,
  code,
  onCopied,
  className,
}: BlockViewCodeHeaderProps) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const copyToClipboard = React.useCallback(
    async (value: string) => {
      if (!value) return;
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      onCopied?.();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, COPIED_DURATION_MS);
    },
    [onCopied],
  );

  return (
    <div
      className={cn(
        'flex h-10 items-center justify-between border-b px-3',
        className,
      )}
      data-slot="block-view-code-header"
    >
      <span className="truncate text-xs font-medium text-muted-foreground">
        {filePath}
      </span>
      <WorkspaceButton
        size="icon"
        variant="ghost"
        tooltip={copied ? 'Copied' : 'Copy file contents'}
        onClick={() => void copyToClipboard(code)}
      >
        {copied ? (
          <Check className="size-3.5 text-green-600 dark:text-green-500" />
        ) : (
          <Clipboard className="size-3.5" />
        )}
        <span className="sr-only">
          {copied ? 'Copied' : 'Copy file contents'}
        </span>
      </WorkspaceButton>
    </div>
  );
}
