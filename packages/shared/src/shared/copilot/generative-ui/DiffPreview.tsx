import React, { type ReactNode } from 'react';

export interface DiffPreviewProps {
  title: string;
  before: ReactNode;
  after: ReactNode;
  status: string;
}

/**
 * Before/after comparison card rendered inline in the CopilotKit chat.
 *
 * Used with the `render` prop to show what the AI changed.
 */
export function DiffPreview({ title, before, after, status }: DiffPreviewProps) {
  if (status === 'inProgress') {
    return (
      <div className="rounded-md border p-3 text-sm animate-pulse">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground mt-1">Applying changes...</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-3 text-sm">
      <p className="font-medium mb-2">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Before</p>
          <div className="rounded bg-muted/50 p-2 text-xs">{before}</div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">After</p>
          <div className="rounded bg-muted/50 p-2 text-xs">{after}</div>
        </div>
      </div>
    </div>
  );
}
