'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';

const MonacoDiffEditor = dynamic(
  () => import('@monaco-editor/react').then((module) => module.DiffEditor),
  { ssr: false },
);

type DiffStatusEntry = {
  status: string;
  path: string;
};

type DiffFilePayload = {
  ok: boolean;
  path: string;
  base: string;
  head: string;
  original: string;
  modified: string;
  unifiedDiff: string;
};

export interface DiffWorkspaceProps {
  onAttachToAssistant: (label: string, content: string) => void;
  onCopyText: (text: string) => void;
}

export function DiffWorkspace({
  onAttachToAssistant,
  onCopyText,
}: DiffWorkspaceProps) {
  const [files, setFiles] = React.useState<DiffStatusEntry[]>([]);
  const [selectedPath, setSelectedPath] = React.useState<string>('');
  const [payload, setPayload] = React.useState<DiffFilePayload | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const refreshStatus = React.useCallback(async () => {
    setError('');
    const response = await fetch('/api/repo/diff/status?scope=workspace');
    const body = await response.json().catch(() => ({ ok: false }));
    if (!body.ok || !Array.isArray(body.files)) {
      setFiles([]);
      setError(body.message || body.stderr || 'Unable to load git status.');
      return;
    }
    setFiles(body.files as DiffStatusEntry[]);
    if (!selectedPath && body.files[0]?.path) {
      setSelectedPath(String(body.files[0].path));
    }
  }, [selectedPath]);

  const loadDiff = React.useCallback(async (filePath: string) => {
    if (!filePath) return;
    setLoading(true);
    setError('');
    const response = await fetch(`/api/repo/diff/file?path=${encodeURIComponent(filePath)}&base=HEAD&head=WORKTREE`);
    const body = await response.json().catch(() => ({ ok: false }));
    setLoading(false);
    if (!body.ok) {
      setPayload(null);
      setError(body.message || 'Unable to load diff file.');
      return;
    }
    setPayload(body as DiffFilePayload);
  }, []);

  React.useEffect(() => {
    refreshStatus().catch((reason) => setError(String(reason?.message || reason)));
  }, [refreshStatus]);

  React.useEffect(() => {
    if (!selectedPath) return;
    loadDiff(selectedPath).catch((reason) => setError(String(reason?.message || reason)));
  }, [selectedPath, loadDiff]);

  const attachDiff = React.useCallback(() => {
    if (!payload) return;
    const context = [
      `# RepoStudio Diff Context`,
      '',
      `file: ${payload.path}`,
      `base: ${payload.base}`,
      `head: ${payload.head}`,
      '',
      '```diff',
      payload.unifiedDiff || '(no textual diff)',
      '```',
    ].join('\n');
    onAttachToAssistant(`diff:${payload.path}`, context);
  }, [onAttachToAssistant, payload]);

  return (
    <div className="h-full min-h-0 space-y-3 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Workspace Diff</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedPath || ''} onValueChange={setSelectedPath}>
              <SelectTrigger className="w-full md:w-[520px]">
                <SelectValue placeholder="Select changed file" />
              </SelectTrigger>
              <SelectContent>
                {files.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No changed files
                  </SelectItem>
                ) : files.map((entry) => (
                  <SelectItem key={`${entry.status}:${entry.path}`} value={entry.path}>
                    [{entry.status}] {entry.path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => refreshStatus().catch(() => {})}>
              Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={attachDiff} disabled={!payload}>
              Attach To Assistant
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyText(payload?.unifiedDiff || '')}
              disabled={!payload}
            >
              Copy Diff
            </Button>
            {loading ? <Badge variant="secondary">loading</Badge> : null}
          </div>

          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}

          <div className="h-[52vh] min-h-0 overflow-hidden rounded-md border border-border">
            <MonacoDiffEditor
              language="markdown"
              original={payload?.original || ''}
              modified={payload?.modified || ''}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                renderSideBySide: true,
                wordWrap: 'on',
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

