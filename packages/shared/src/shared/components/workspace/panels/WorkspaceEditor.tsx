'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface WorkspaceEditorProps {
  children?: React.ReactNode;
  className?: string;
  editorId: string;
  editorType: string;
  editorScope?: string;
}

/** @deprecated Use ViewportMeta from @forge/shared/components/editor. */
export function WorkspaceEditor({
  children,
  className,
  editorId,
  editorType,
  editorScope,
}: WorkspaceEditorProps) {
  return (
    <div
      className={cn('h-full w-full min-h-0 min-w-0', className)}
      data-viewport-id={editorId}
      data-viewport-type={editorType}
      {...(editorScope ? { 'data-viewport-scope': editorScope } : {})}
      data-editor-id={editorId}
      data-editor-type={editorType}
      {...(editorScope ? { 'data-editor-scope': editorScope } : {})}
    >
      {children}
    </div>
  );
}
