'use client';

import * as React from 'react';
import { FilePlus2, FileText } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { Badge } from '@forge/ui/badge';
import { writeRepoFile } from '@/lib/api/services';
import type { PlanningSnapshot } from '@/lib/repo-data';

export interface PrdPanelProps {
  planning: PlanningSnapshot;
  onRefresh: () => void;
  onCopyText: (text: string) => void;
}

const DEFAULT_PRD_TEMPLATE = `# Product Requirements Document

## Objective

- Define the product outcome for this loop.

## Scope

- In scope:
- Out of scope:

## Acceptance Criteria

- 
`;

export function PrdPanel({
  planning,
  onRefresh,
  onCopyText,
}: PrdPanelProps) {
  const [creating, setCreating] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const prdPath = planning.prdPath || '.planning/PRD.md';
  const prdContent = String(planning.prdContent || '');
  const prdExists = planning.prdExists === true;

  const createPrd = React.useCallback(async () => {
    setCreating(true);
    setMessage('');
    try {
      const payload = await writeRepoFile({
        path: prdPath,
        content: DEFAULT_PRD_TEMPLATE,
        createIfMissing: true,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to create PRD file.');
        return;
      }
      setMessage('PRD.md created.');
      onRefresh();
    } catch (error: any) {
      setMessage(String(error?.message || error || 'Unable to create PRD file.'));
    } finally {
      setCreating(false);
    }
  }, [onRefresh, prdPath]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <div className="flex items-center justify-between gap-2">
        <Badge variant={prdExists ? 'secondary' : 'destructive'} className="font-normal">
          {prdExists ? 'PRD Ready' : 'PRD Missing'}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCopyText(prdContent)}
          disabled={!prdExists}
        >
          <FileText className="mr-1 size-3.5" />
          Copy PRD
        </Button>
      </div>

      {!prdExists ? (
        <div className="rounded-md border border-border p-3 text-xs">
          <p className="font-medium">Canonical PRD file is required.</p>
          <p className="mt-1 text-muted-foreground">
            Expected path: <span className="font-mono">{prdPath}</span>
          </p>
          <Button
            className="mt-2"
            size="sm"
            onClick={createPrd}
            disabled={creating}
          >
            <FilePlus2 className="mr-1 size-3.5" />
            {creating ? 'Creating...' : 'Create PRD.md'}
          </Button>
          {message ? (
            <p className="mt-2 text-[11px] text-muted-foreground">{message}</p>
          ) : null}
        </div>
      ) : (
        <pre className="min-h-0 flex-1 overflow-auto rounded-md border border-border bg-muted/20 p-3 text-xs whitespace-pre-wrap">
          {prdContent || 'PRD exists but is empty.'}
        </pre>
      )}
    </div>
  );
}
