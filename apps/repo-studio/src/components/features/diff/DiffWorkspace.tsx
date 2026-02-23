'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { toErrorMessage } from '@/lib/api/http';
import { fetchDiffFile, fetchDiffStatus } from '@/lib/api/services';
import type { DiffFilePayload, DiffStatusEntry } from '@/lib/api/types';

const MonacoDiffEditor = dynamic(
  () => import('@monaco-editor/react').then((module) => module.DiffEditor),
  { ssr: false },
);

export interface DiffWorkspaceProps {
  onCopyText: (text: string) => void;
}

export function DiffWorkspace({
  onCopyText,
}: DiffWorkspaceProps) {
  const [files, setFiles] = React.useState<DiffStatusEntry[]>([]);
  const [selectedPath, setSelectedPath] = React.useState<string>('');
  const [payload, setPayload] = React.useState<DiffFilePayload | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const refreshStatus = React.useCallback(async () => {
    setError('');
    try {
      const body = await fetchDiffStatus({ scope: 'workspace' });
      if (!body.ok || !Array.isArray(body.files)) {
        setFiles([]);
        setError(body.message || 'Unable to load git status.');
        return;
      }
      setFiles(body.files as DiffStatusEntry[]);
      if (!selectedPath && body.files[0]?.path) {
        setSelectedPath(String(body.files[0].path));
      }
    } catch (error) {
      setFiles([]);
      setError(toErrorMessage(error, 'Unable to load git status.'));
    }
  }, [selectedPath]);

  const loadDiff = React.useCallback(async (filePath: string) => {
    if (!filePath) return;
    setLoading(true);
    setError('');
    try {
      const body = await fetchDiffFile({
        path: filePath,
        base: 'HEAD',
        head: 'WORKTREE',
      });
      if (!body.ok) {
        setPayload(null);
        setError(body.message || 'Unable to load diff file.');
        setLoading(false);
        return;
      }
      setPayload(body as DiffFilePayload);
    } catch (error) {
      setPayload(null);
      setError(toErrorMessage(error, 'Unable to load diff file.'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshStatus().catch((reason) => setError(String(reason?.message || reason)));
  }, [refreshStatus]);

  React.useEffect(() => {
    if (!selectedPath) return;
    loadDiff(selectedPath).catch((reason) => setError(String(reason?.message || reason)));
  }, [selectedPath, loadDiff]);

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
