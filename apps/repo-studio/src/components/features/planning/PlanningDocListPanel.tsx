'use client';

import * as React from 'react';
import { Bot, ClipboardCopy, FileText } from 'lucide-react';
import { Button } from '@forge/ui/button';
import type { PlanningSnapshot } from '@/lib/repo-data';

export interface PlanningDocListPanelProps {
  planning: PlanningSnapshot;
  selectedDocId: string | null;
  onOpenDoc: (docId: string) => void;
  onCopyMentionToken: () => void;
  onCopyText: (text: string) => void;
  onOpenAssistant: () => void;
}

export function PlanningDocListPanel({
  planning,
  selectedDocId,
  onOpenDoc,
  onCopyMentionToken,
  onCopyText,
  onOpenAssistant,
}: PlanningDocListPanelProps) {
  const selectedDoc = planning.docs.find((doc) => doc.id === selectedDocId) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto p-2">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {selectedDoc ? (
          <>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onCopyMentionToken}>
              <ClipboardCopy size={12} className="mr-1" />
              Copy @
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onOpenAssistant}>
              <Bot size={12} className="mr-1" />
              Assistant
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onCopyText(selectedDoc.content)}
            >
              <ClipboardCopy size={12} className="mr-1" />
              Copy Doc
            </Button>
          </>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <FileText size={12} />
          Doc list
        </div>
        <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border">
          <ul className="p-1">
            {planning.docs.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => onOpenDoc(doc.id)}
                  className={`w-full cursor-pointer truncate rounded px-2 py-1.5 text-left text-xs hover:bg-accent ${
                    selectedDocId === doc.id ? 'bg-accent font-medium' : ''
                  }`}
                  title={doc.filePath}
                >
                  {doc.filePath}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
