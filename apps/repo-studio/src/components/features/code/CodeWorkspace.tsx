'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((module) => module.default),
  { ssr: false },
);

type FilesTreePayload = {
  ok: boolean;
  files: string[];
  truncated?: boolean;
  message?: string;
};

type ReadPayload = {
  ok: boolean;
  path: string;
  content: string;
  message?: string;
};

export interface CodeWorkspaceProps {
  activeLoopId: string;
  onAttachToAssistant: (label: string, content: string) => void;
  onCopyText: (text: string) => void;
}

export function CodeWorkspace({
  activeLoopId,
  onAttachToAssistant,
  onCopyText,
}: CodeWorkspaceProps) {
  const [scope, setScope] = React.useState<'workspace' | 'loop'>('loop');
  const [files, setFiles] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState('');
  const [selectedPath, setSelectedPath] = React.useState('');
  const [content, setContent] = React.useState('');
  const [baselineContent, setBaselineContent] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const filteredFiles = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return files;
    return files.filter((file) => file.toLowerCase().includes(needle));
  }, [files, query]);

  const hasChanges = React.useMemo(() => content !== baselineContent, [content, baselineContent]);

  const refreshTree = React.useCallback(async () => {
    setLoading(true);
    setMessage('');
    const response = await fetch(`/api/repo/files/tree?scope=${scope}&loopId=${encodeURIComponent(activeLoopId)}`);
    const payload = await response.json().catch(() => ({ ok: false })) as FilesTreePayload;
    setLoading(false);
    if (!payload.ok) {
      setFiles([]);
      setMessage(payload.message || 'Unable to load file tree.');
      return;
    }
    setFiles(Array.isArray(payload.files) ? payload.files : []);
    if (!selectedPath && payload.files[0]) {
      setSelectedPath(payload.files[0]);
    }
    if (payload.truncated) {
      setMessage('Tree truncated. Refine scope or query for focused editing.');
    }
  }, [activeLoopId, scope, selectedPath]);

  const loadFile = React.useCallback(async (filePath: string) => {
    if (!filePath) return;
    setLoading(true);
    const response = await fetch(`/api/repo/files/read?path=${encodeURIComponent(filePath)}`);
    const payload = await response.json().catch(() => ({ ok: false })) as ReadPayload;
    setLoading(false);
    if (!payload.ok) {
      setMessage(payload.message || 'Unable to read file.');
      return;
    }
    setContent(payload.content || '');
    setBaselineContent(payload.content || '');
    setMessage(`Loaded ${payload.path}`);
  }, []);

  React.useEffect(() => {
    refreshTree().catch((error) => setMessage(String(error?.message || error)));
  }, [refreshTree]);

  React.useEffect(() => {
    if (!selectedPath) return;
    loadFile(selectedPath).catch((error) => setMessage(String(error?.message || error)));
  }, [selectedPath, loadFile]);

  const saveFile = React.useCallback(async () => {
    if (!selectedPath) return;
    setSaving(true);
    const response = await fetch('/api/repo/files/write', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        path: selectedPath,
        content,
        approved: true,
      }),
    });
    const payload = await response.json().catch(() => ({ ok: false }));
    setSaving(false);
    if (!payload.ok) {
      setMessage(payload.message || 'Unable to save file.');
      return;
    }
    setBaselineContent(content);
    setMessage(payload.message || `Saved ${selectedPath}`);
  }, [content, selectedPath]);

  const attachFile = React.useCallback(() => {
    if (!selectedPath) return;
    onAttachToAssistant(`file:${selectedPath}`, [
      `# Repo File Context`,
      '',
      `path: ${selectedPath}`,
      '',
      '```',
      content,
      '```',
    ].join('\n'));
  }, [content, onAttachToAssistant, selectedPath]);

  return (
    <div className="h-full min-h-0 space-y-3 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Code Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={scope} onValueChange={(value) => setScope(value as 'workspace' | 'loop')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loop">loop scope</SelectItem>
                <SelectItem value="workspace">workspace scope</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full md:w-[320px]"
              placeholder="Filter files..."
            />
            <Select value={selectedPath || ''} onValueChange={setSelectedPath}>
              <SelectTrigger className="w-full md:w-[460px]">
                <SelectValue placeholder="Select file" />
              </SelectTrigger>
              <SelectContent>
                {filteredFiles.length === 0 ? (
                  <SelectItem value="__none__" disabled>No files</SelectItem>
                ) : filteredFiles.map((file) => (
                  <SelectItem key={file} value={file}>{file}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => refreshTree().catch(() => {})}>
              Refresh Tree
            </Button>
            <Button size="sm" variant="outline" onClick={saveFile} disabled={!selectedPath || !hasChanges || saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button size="sm" variant="outline" onClick={attachFile} disabled={!selectedPath}>
              Attach To Assistant
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCopyText(content)} disabled={!selectedPath}>
              Copy File
            </Button>
            {loading ? <Badge variant="secondary">loading</Badge> : null}
            {hasChanges ? <Badge variant="secondary">unsaved</Badge> : <Badge variant="outline">saved</Badge>}
            <Badge variant="outline">loop: {activeLoopId}</Badge>
          </div>

          {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}

          <div className="h-[56vh] min-h-0 overflow-hidden rounded-md border border-border">
            <MonacoEditor
              language="typescript"
              theme="vs-dark"
              value={content}
              onChange={(value) => setContent(value || '')}
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
