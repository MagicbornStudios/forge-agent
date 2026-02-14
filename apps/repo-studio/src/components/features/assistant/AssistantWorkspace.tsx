'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Textarea } from '@forge/ui/textarea';
import type { PlanningDocEntry } from '@/lib/repo-data';
import { RepoAssistantPanel } from '@/components/RepoAssistantPanel';

export interface AssistantWorkspaceProps {
  attachedDocs: PlanningDocEntry[];
  assistantContext: string;
  onDetachDoc: (docId: string) => void;
  onCopyText: (text: string) => void;
  onClearAttachments: () => void;
}

export function AssistantWorkspace({
  attachedDocs,
  assistantContext,
  onDetachDoc,
  onCopyText,
  onClearAttachments,
}: AssistantWorkspaceProps) {
  return (
    <div className="h-full min-h-0 space-y-3 p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Attached Planning Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {attachedDocs.length === 0 ? (
              <span className="text-xs text-muted-foreground">No planning docs attached.</span>
            ) : attachedDocs.map((doc) => (
              <Badge key={doc.id} variant="secondary" className="gap-2">
                {doc.filePath}
                <button
                  type="button"
                  className="text-[10px] opacity-80 hover:opacity-100"
                  onClick={() => onDetachDoc(doc.id)}
                >
                  x
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onCopyText(assistantContext)}>
              Copy Context Block
            </Button>
            <Button size="sm" variant="outline" onClick={onClearAttachments}>
              Clear Attached
            </Button>
          </div>
          <Textarea
            value={assistantContext}
            readOnly
            className="min-h-[160px] font-mono text-xs"
          />
        </CardContent>
      </Card>

      <div className="h-[52vh] min-h-0 rounded-md border border-border bg-background">
        <RepoAssistantPanel
          className="h-full"
          composerLeading={attachedDocs.length > 0 ? (
            <div className="px-2 pt-2 text-xs text-muted-foreground">
              {attachedDocs.length} planning artifact(s) attached. Paste copied context before your prompt.
            </div>
          ) : null}
        />
      </div>
    </div>
  );
}

