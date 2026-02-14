'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { Textarea } from '@forge/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((module) => module.default),
  { ssr: false },
);

type StoryPageNode = {
  id: string;
  name: string;
  index: number;
  path: string;
};

type StoryChapterNode = {
  id: string;
  name: string;
  index: number;
  path: string;
  pages: StoryPageNode[];
};

type StoryActNode = {
  id: string;
  name: string;
  index: number;
  path: string;
  chapters: StoryChapterNode[];
};

type StoryTreePayload = {
  ok: boolean;
  roots: string[];
  tree?: {
    acts: StoryActNode[];
    pageCount: number;
  };
  message?: string;
};

type StoryPagePayload = {
  ok: boolean;
  path: string;
  content: string;
  message?: string;
};

type StoryReaderPayload = {
  ok: boolean;
  current: StoryPageNode | null;
  prev: StoryPageNode | null;
  next: StoryPageNode | null;
  content: string;
  message?: string;
};

export interface StoryWorkspaceProps {
  activeLoopId: string;
  onAttachToAssistant: (label: string, content: string) => void;
  onCopyText: (text: string) => void;
}

export function StoryWorkspace({
  activeLoopId,
  onAttachToAssistant,
  onCopyText,
}: StoryWorkspaceProps) {
  const [tree, setTree] = React.useState<StoryActNode[]>([]);
  const [roots, setRoots] = React.useState<string[]>([]);
  const [selectedPath, setSelectedPath] = React.useState('');
  const [content, setContent] = React.useState('');
  const [baseline, setBaseline] = React.useState('');
  const [reader, setReader] = React.useState<StoryReaderPayload | null>(null);
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const [createActIndex, setCreateActIndex] = React.useState('1');
  const [createChapterIndex, setCreateChapterIndex] = React.useState('1');
  const [createPageIndex, setCreatePageIndex] = React.useState('1');
  const [scopeOverrideToken, setScopeOverrideToken] = React.useState('');

  const pages = React.useMemo(
    () => tree.flatMap((act) => act.chapters.flatMap((chapter) => chapter.pages)),
    [tree],
  );

  const hasChanges = content !== baseline;

  const refreshTree = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      loopId: activeLoopId,
      domain: 'story',
    });
    if (scopeOverrideToken.trim()) params.set('scopeOverrideToken', scopeOverrideToken.trim());
    const response = await fetch(`/api/repo/story/tree?${params.toString()}`);
    const payload = await response.json().catch(() => ({ ok: false })) as StoryTreePayload;
    setLoading(false);
    if (!payload.ok) {
      setMessage(payload.message || 'Unable to load story tree.');
      return;
    }
    const acts = payload.tree?.acts || [];
    setRoots(payload.roots || []);
    setTree(acts);
    const firstPath = acts[0]?.chapters[0]?.pages[0]?.path || '';
    if (!selectedPath && firstPath) {
      setSelectedPath(firstPath);
    }
    setMessage(`Loaded story tree (${payload.tree?.pageCount || 0} pages).`);
  }, [activeLoopId, scopeOverrideToken, selectedPath]);

  const loadPage = React.useCallback(async (targetPath: string) => {
    if (!targetPath) return;
    setLoading(true);
    const params = new URLSearchParams({
      path: targetPath,
      loopId: activeLoopId,
      domain: 'story',
    });
    if (scopeOverrideToken.trim()) params.set('scopeOverrideToken', scopeOverrideToken.trim());
    const response = await fetch(`/api/repo/story/page?${params.toString()}`);
    const payload = await response.json().catch(() => ({ ok: false })) as StoryPagePayload;
    setLoading(false);
    if (!payload.ok) {
      setMessage(payload.message || 'Unable to read story page.');
      return;
    }
    setContent(payload.content || '');
    setBaseline(payload.content || '');
    setMessage(`Loaded ${payload.path}.`);
  }, [activeLoopId, scopeOverrideToken]);

  const refreshReader = React.useCallback(async (targetPath: string) => {
    const params = new URLSearchParams({
      loopId: activeLoopId,
      domain: 'story',
    });
    if (targetPath) params.set('path', targetPath);
    if (scopeOverrideToken.trim()) params.set('scopeOverrideToken', scopeOverrideToken.trim());
    const response = await fetch(`/api/repo/story/reader?${params.toString()}`);
    const payload = await response.json().catch(() => ({ ok: false })) as StoryReaderPayload;
    if (!payload.ok) {
      setMessage(payload.message || 'Unable to load story reader.');
      return;
    }
    setReader(payload);
  }, [activeLoopId, scopeOverrideToken]);

  React.useEffect(() => {
    refreshTree().catch((error) => setMessage(String(error?.message || error)));
  }, [refreshTree]);

  React.useEffect(() => {
    if (!selectedPath) return;
    loadPage(selectedPath).catch((error) => setMessage(String(error?.message || error)));
    refreshReader(selectedPath).catch((error) => setMessage(String(error?.message || error)));
  }, [selectedPath, loadPage, refreshReader]);

  const savePage = React.useCallback(async () => {
    if (!selectedPath) return;
    const response = await fetch('/api/repo/story/page/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        path: selectedPath,
        content,
        approved: true,
        domain: 'story',
        loopId: activeLoopId,
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      }),
    });
    const payload = await response.json().catch(() => ({ ok: false }));
    if (!payload.ok) {
      setMessage(payload.message || 'Unable to save story page.');
      return;
    }
    setBaseline(content);
    setMessage(payload.message || `Saved ${selectedPath}.`);
    await refreshReader(selectedPath);
  }, [activeLoopId, content, refreshReader, scopeOverrideToken, selectedPath]);

  const createCanonicalPage = React.useCallback(async () => {
    const response = await fetch('/api/repo/story/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        actIndex: Number(createActIndex || '1'),
        chapterIndex: Number(createChapterIndex || '1'),
        pageIndex: Number(createPageIndex || '1'),
        content: '',
        domain: 'story',
        loopId: activeLoopId,
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      }),
    });
    const payload = await response.json().catch(() => ({ ok: false }));
    if (!payload.ok) {
      setMessage(payload.message || 'Unable to create story page.');
      return;
    }
    setMessage(payload.message || 'Created story page.');
    await refreshTree();
    if (payload.path) {
      setSelectedPath(String(payload.path));
    }
  }, [activeLoopId, createActIndex, createChapterIndex, createPageIndex, refreshTree, scopeOverrideToken]);

  const attachPage = React.useCallback(() => {
    if (!selectedPath) return;
    const block = [
      '# Story Page Context',
      '',
      `loopId: ${activeLoopId}`,
      `path: ${selectedPath}`,
      '',
      '```md',
      content,
      '```',
    ].join('\n');
    onAttachToAssistant(`story:${selectedPath}`, block);
  }, [activeLoopId, content, onAttachToAssistant, selectedPath]);

  return (
    <div className="h-full min-h-0 space-y-3 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Story Outline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">loop: {activeLoopId}</Badge>
            <Badge variant="outline">roots: {roots.join(', ') || 'content/story'}</Badge>
            {loading ? <Badge variant="secondary">loading</Badge> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={scopeOverrideToken}
              onChange={(event) => setScopeOverrideToken(event.target.value)}
              className="w-full md:w-[360px]"
              placeholder="scope override token (optional)"
            />
            <Button size="sm" variant="outline" onClick={() => refreshTree().catch(() => {})}>
              Refresh Story Tree
            </Button>
          </div>
          <div className="max-h-56 overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Act</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Path</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tree.flatMap((act) => act.chapters.flatMap((chapter) => chapter.pages.map((page) => (
                  <TableRow
                    key={page.id}
                    className={page.path === selectedPath ? 'bg-muted/40' : ''}
                    onClick={() => setSelectedPath(page.path)}
                  >
                    <TableCell>{act.name}</TableCell>
                    <TableCell>{chapter.name}</TableCell>
                    <TableCell>{page.name}</TableCell>
                    <TableCell className="font-mono text-xs">{page.path}</TableCell>
                  </TableRow>
                ))))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Story Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedPath || ''} onValueChange={setSelectedPath}>
              <SelectTrigger className="w-full md:w-[520px]">
                <SelectValue placeholder="Select story page" />
              </SelectTrigger>
              <SelectContent>
                {pages.length === 0 ? (
                  <SelectItem value="__none__" disabled>No story pages found.</SelectItem>
                ) : pages.map((page) => (
                  <SelectItem key={page.id} value={page.path}>{page.path}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={savePage} disabled={!selectedPath || !hasChanges}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={attachPage} disabled={!selectedPath}>
              Attach To Assistant
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCopyText(content)} disabled={!selectedPath}>
              Copy Page
            </Button>
            {hasChanges ? <Badge variant="secondary">unsaved</Badge> : <Badge variant="outline">saved</Badge>}
          </div>
          <div className="h-[48vh] min-h-0 overflow-hidden rounded-md border border-border">
            <MonacoEditor
              language="markdown"
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
          <CardTitle className="text-sm">Story Reader</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => reader?.prev?.path && setSelectedPath(reader.prev.path)}
              disabled={!reader?.prev}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => reader?.next?.path && setSelectedPath(reader.next.path)}
              disabled={!reader?.next}
            >
              Next
            </Button>
            <Badge variant="outline">{reader?.current?.path || 'no page selected'}</Badge>
          </div>
          <Textarea
            readOnly
            value={reader?.content || ''}
            className="min-h-[180px] font-serif text-sm leading-6"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Create Canonical Story Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
            <Input value={createActIndex} onChange={(event) => setCreateActIndex(event.target.value)} placeholder="act index" />
            <Input value={createChapterIndex} onChange={(event) => setCreateChapterIndex(event.target.value)} placeholder="chapter index" />
            <Input value={createPageIndex} onChange={(event) => setCreatePageIndex(event.target.value)} placeholder="page index" />
            <Button size="sm" variant="outline" onClick={createCanonicalPage}>
              Create Canonical Page
            </Button>
          </div>
          {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
