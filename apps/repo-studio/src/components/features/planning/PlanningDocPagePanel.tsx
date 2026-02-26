'use client';

import * as React from 'react';
import { Bot, ClipboardCopy, FileText } from 'lucide-react';
import { Button } from '@forge/ui/button';
import type { PlanningSnapshot } from '@/lib/repo-data';

export interface PlanningDocPagePanelProps {
  docId: string;
  planning: PlanningSnapshot;
  onCopyText: (text: string) => void;
  onOpenAssistant: () => void;
}

export function PlanningDocPagePanel({
  docId,
  planning,
  onCopyText,
  onOpenAssistant,
}: PlanningDocPagePanelProps) {
  const doc = React.useMemo(
    () => planning.docs.find((d) => d.id === docId) ?? null,
    [planning.docs, docId],
  );

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
        Document not found.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-2 py-1.5">
        <FileText size={14} className="text-muted-foreground" aria-hidden />
        <span className="truncate text-xs font-medium" title={doc.filePath}>
          {doc.filePath}
        </span>
        <div className="ml-auto flex gap-1">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onOpenAssistant}>
            <Bot size={12} className="mr-1" />
            Assistant
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => onCopyText(doc.content)}
          >
            <ClipboardCopy size={12} className="mr-1" />
            Copy
          </Button>
        </div>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto p-3 text-xs">
        {doc.content || '(empty)'}
      </pre>
    </div>
  );
}
