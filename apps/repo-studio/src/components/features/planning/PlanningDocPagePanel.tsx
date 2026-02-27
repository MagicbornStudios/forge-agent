'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { FileText } from 'lucide-react';
import type { PlanningSnapshot } from '@/lib/repo-data';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((module) => module.default),
  { ssr: false },
);

export interface PlanningDocPagePanelProps {
  docId: string;
  planning: PlanningSnapshot;
}

export function PlanningDocPagePanel({
  docId,
  planning,
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
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <MonacoEditor
          language="markdown"
          theme="vs-dark"
          value={doc.content || '(empty)'}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
