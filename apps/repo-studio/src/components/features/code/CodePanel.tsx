'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { toErrorMessage } from '@/lib/api/http';
import {
  fetchGitStatus,
  fetchRepoFile,
  fetchRepoFilesTree,
  searchRepo,
  writeRepoFile,
} from '@/lib/api/services';
import type { RepoScope, RepoSearchMatch } from '@/lib/api/types';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((module) => module.default),
  { ssr: false },
);

export interface CodePanelProps {
  activeLoopId: string;
  onCopyText: (text: string) => void;
}

export function CodePanel({
  activeLoopId,
  onCopyText,
}: CodePanelProps) {
  const [scope, setScope] = React.useState<RepoScope>('loop');
  const [files, setFiles] = React.useState<string[]>([]);
  const [gitStatusByPath, setGitStatusByPath] = React.useState<Record<string, string>>({});
  const [fileQuery, setFileQuery] = React.useState('');
  const [selectedPath, setSelectedPath] = React.useState('');
  const [content, setContent] = React.useState('');
  const [baselineContent, setBaselineContent] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchInclude, setSearchInclude] = React.useState('');
  const [searchExclude, setSearchExclude] = React.useState('');
  const [searchRegex, setSearchRegex] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [searchMatches, setSearchMatches] = React.useState<RepoSearchMatch[]>([]);
  const [searchMessage, setSearchMessage] = React.useState('');

  const filteredFiles = React.useMemo(() => {
    const needle = fileQuery.trim().toLowerCase();
    if (!needle) return files;
    return files.filter((file) => file.toLowerCase().includes(needle));
  }, [fileQuery, files]);

  const hasChanges = React.useMemo(() => content !== baselineContent, [content, baselineContent]);

  const splitGlobs = React.useCallback((value: string) => (
    String(value || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  ), []);

  const refreshTree = React.useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const [payload, gitStatus] = await Promise.all([
        fetchRepoFilesTree({
          scope,
          loopId: activeLoopId,
        }),
        fetchGitStatus(),
      ]);

      if (!payload.ok) {
        setFiles([]);
        setMessage(payload.message || 'Unable to load file tree.');
        setLoading(false);
        return;
      }
      const nextFiles = Array.isArray(payload.files) ? payload.files : [];
      setFiles(nextFiles);
      if (!selectedPath && nextFiles[0]) {
        setSelectedPath(nextFiles[0]);
      }
      if (payload.truncated) {
        setMessage('Tree truncated. Refine scope or query for focused editing.');
      }

      const statusMap: Record<string, string> = {};
      for (const row of gitStatus.files || []) {
        if (!row?.path) continue;
        statusMap[row.path] = row.status;
      }
      setGitStatusByPath(statusMap);
    } catch (error) {
      setFiles([]);
      setMessage(toErrorMessage(error, 'Unable to load file tree.'));
    } finally {
      setLoading(false);
    }
  }, [activeLoopId, scope, selectedPath]);

  const loadFile = React.useCallback(async (filePath: string) => {
    if (!filePath) return;
    setLoading(true);
    try {
      const payload = await fetchRepoFile(filePath);
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to read file.');
        setLoading(false);
        return;
      }
      setContent(payload.content || '');
      setBaselineContent(payload.content || '');
      setMessage(`Loaded ${payload.path}`);
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to read file.'));
    } finally {
      setLoading(false);
    }
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
    try {
      const payload = await writeRepoFile({
        path: selectedPath,
        content,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to save file.');
        setSaving(false);
        return;
      }
      setBaselineContent(content);
      setMessage(payload.message || `Saved ${selectedPath}`);
      await refreshTree();
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to save file.'));
    } finally {
      setSaving(false);
    }
  }, [content, refreshTree, selectedPath]);

  const runSearch = React.useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchMessage('Enter a search query.');
      setSearchMatches([]);
      return;
    }
    setSearching(true);
    try {
      const payload = await searchRepo({
        query,
        regex: searchRegex,
        include: splitGlobs(searchInclude),
        exclude: splitGlobs(searchExclude),
        scope,
        loopId: activeLoopId,
      });
      if (!payload.ok) {
        setSearchMessage(payload.message || 'Search failed.');
        setSearchMatches([]);
        return;
      }
      setSearchMatches(payload.matches || []);
      setSearchMessage(
        payload.matches.length === 0
          ? 'No matches found.'
          : `Found ${payload.matches.length} match(es)${payload.truncated ? ' (truncated)' : ''}.`,
      );
    } catch (error) {
      setSearchMatches([]);
      setSearchMessage(toErrorMessage(error, 'Search failed.'));
    } finally {
      setSearching(false);
    }
  }, [activeLoopId, scope, searchExclude, searchInclude, searchQuery, searchRegex, splitGlobs]);

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
              value={fileQuery}
              onChange={(event) => setFileQuery(event.target.value)}
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
                  <SelectItem key={file} value={file}>
                    {gitStatusByPath[file] ? `[${gitStatusByPath[file]}] ` : ''}{file}
                  </SelectItem>
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Navigator Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search query (plain or regex)"
              className="md:col-span-2"
            />
            <Input
              value={searchInclude}
              onChange={(event) => setSearchInclude(event.target.value)}
              placeholder="include globs (comma-separated)"
            />
            <Input
              value={searchExclude}
              onChange={(event) => setSearchExclude(event.target.value)}
              placeholder="exclude globs (comma-separated)"
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={searchRegex ? 'secondary' : 'outline'}
                onClick={() => setSearchRegex((current) => !current)}
              >
                {searchRegex ? 'Regex On' : 'Regex Off'}
              </Button>
              <Button size="sm" variant="outline" onClick={runSearch} disabled={searching}>
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">scope: {scope}</Badge>
            <Badge variant="outline">loop: {activeLoopId}</Badge>
            <Badge variant="outline">matches: {searchMatches.length}</Badge>
          </div>

          {searchMessage ? <p className="text-xs text-muted-foreground">{searchMessage}</p> : null}

          <div className="max-h-56 overflow-auto rounded-md border border-border">
            {searchMatches.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground">No search results yet.</div>
            ) : (
              <ul className="divide-y divide-border">
                {searchMatches.map((match, index) => (
                  <li key={`${match.path}:${match.line}:${match.column}:${index}`}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-xs hover:bg-muted/40"
                      onClick={() => setSelectedPath(match.path)}
                    >
                      <div className="font-mono text-[11px]">
                        {match.path}:{match.line}:{match.column}
                      </div>
                      <div className="truncate text-muted-foreground">{match.preview}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

