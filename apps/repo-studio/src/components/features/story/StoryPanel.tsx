'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';
import { Textarea } from '@forge/ui/textarea';
import { toErrorMessage } from '@/lib/api/http';
import {
  fetchStoryPage,
  fetchStoryReader,
  fetchStoryTree,
  saveStoryPage,
} from '@/lib/api/services';
import type { StoryActNode, StoryPageNode, StoryReaderPayload } from '@/lib/api/types';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((module) => module.default),
  { ssr: false },
);

const STORY_DOMAIN = 'story';
const STORY_VIEWPORT_PANEL_PREFIX = 'story-page:';

export interface StoryPageDraft {
  path: string;
  content: string;
  baseline: string;
  reader: StoryReaderPayload | null;
  loading: boolean;
}

export function getStoryViewportPanelId(path: string) {
  return `${STORY_VIEWPORT_PANEL_PREFIX}${encodeURIComponent(path)}`;
}

export function getStoryPathFromViewportPanelId(panelId: string | null | undefined): string | null {
  if (!panelId || !panelId.startsWith(STORY_VIEWPORT_PANEL_PREFIX)) return null;
  const encodedPath = panelId.slice(STORY_VIEWPORT_PANEL_PREFIX.length);
  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}

function flattenStoryRows(tree: StoryActNode[]) {
  return tree.flatMap((act) =>
    act.chapters.flatMap((chapter) =>
      chapter.pages.map((page) => ({
        act,
        chapter,
        page,
      })),
    ),
  );
}

function flattenStoryPages(tree: StoryActNode[]): StoryPageNode[] {
  return tree.flatMap((act) => act.chapters.flatMap((chapter) => chapter.pages));
}

interface StoryWorkspaceModelOptions {
  activeLoopId: string;
}

export function useStoryWorkspaceModel({ activeLoopId }: StoryWorkspaceModelOptions) {
  const [tree, setTree] = React.useState<StoryActNode[]>([]);
  const [roots, setRoots] = React.useState<string[]>([]);
  const [hasLoadedTree, setHasLoadedTree] = React.useState(false);
  const [loadingTree, setLoadingTree] = React.useState(false);
  const [scopeOverrideToken, setScopeOverrideToken] = React.useState('');
  const [selectedPath, setSelectedPath] = React.useState('');
  const [message, setMessage] = React.useState('');

  const [drafts, setDrafts] = React.useState<Record<string, StoryPageDraft>>({});
  const draftsRef = React.useRef(drafts);
  React.useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  const rows = React.useMemo(() => flattenStoryRows(tree), [tree]);
  const pages = React.useMemo(() => flattenStoryPages(tree), [tree]);
  const pagePathSet = React.useMemo(() => new Set(pages.map((page) => page.path)), [pages]);

  React.useEffect(() => {
    setDrafts({});
    setSelectedPath('');
  }, [activeLoopId]);

  const updateDraft = React.useCallback((path: string, updater: (current: StoryPageDraft | undefined) => StoryPageDraft | undefined) => {
    setDrafts((current) => {
      const nextValue = updater(current[path]);
      if (nextValue === undefined) {
        if (!(path in current)) return current;
        const rest = { ...current };
        delete rest[path];
        return rest;
      }
      return {
        ...current,
        [path]: nextValue,
      };
    });
  }, []);

  const refreshReader = React.useCallback(async (targetPath: string) => {
    if (!targetPath) return;
    try {
      const payload = await fetchStoryReader({
        path: targetPath,
        loopId: activeLoopId,
        domain: STORY_DOMAIN,
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to load story reader.');
        return;
      }
      updateDraft(targetPath, (current) => ({
        path: targetPath,
        content: current?.content || '',
        baseline: current?.baseline || '',
        loading: current?.loading || false,
        reader: payload,
      }));
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to load story reader.'));
    }
  }, [activeLoopId, scopeOverrideToken, updateDraft]);

  const ensureDraftLoaded = React.useCallback(async (targetPath: string) => {
    if (!targetPath) return;
    const existingDraft = draftsRef.current[targetPath];
    if (existingDraft) return;

    updateDraft(targetPath, () => ({
      path: targetPath,
      content: '',
      baseline: '',
      reader: null,
      loading: true,
    }));

    try {
      const payload = await fetchStoryPage({
        path: targetPath,
        loopId: activeLoopId,
        domain: STORY_DOMAIN,
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to read story page.');
        updateDraft(targetPath, (current) => current ? {
          ...current,
          loading: false,
        } : undefined);
        return;
      }

      updateDraft(targetPath, (current) => ({
        path: targetPath,
        content: payload.content || '',
        baseline: payload.content || '',
        reader: current?.reader || null,
        loading: false,
      }));
      setMessage(`Loaded ${payload.path}.`);
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to read story page.'));
      updateDraft(targetPath, (current) => current ? {
        ...current,
        loading: false,
      } : undefined);
      return;
    }

    await refreshReader(targetPath);
  }, [activeLoopId, refreshReader, scopeOverrideToken, updateDraft]);

  const refreshTree = React.useCallback(async () => {
    setLoadingTree(true);
    try {
      const payload = await fetchStoryTree({
        loopId: activeLoopId,
        domain: STORY_DOMAIN,
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to load story tree.');
        return;
      }

      const acts = payload.tree?.acts || [];
      const nextPages = flattenStoryPages(acts);
      const nextPathSet = new Set(nextPages.map((page) => page.path));

      setRoots(payload.roots || []);
      setTree(acts);
      setSelectedPath((current) => {
        if (current && nextPathSet.has(current)) return current;
        return nextPages[0]?.path || '';
      });
      setMessage(`Loaded story tree (${payload.tree?.pageCount || 0} pages).`);
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to load story tree.'));
    } finally {
      setLoadingTree(false);
      setHasLoadedTree(true);
    }
  }, [activeLoopId, scopeOverrideToken]);

  React.useEffect(() => {
    refreshTree().catch((error) => setMessage(String(error?.message || error)));
  }, [refreshTree]);

  const openPageDraft = React.useCallback(async (targetPath: string) => {
    if (!targetPath) return;
    setSelectedPath(targetPath);
    await ensureDraftLoaded(targetPath);
    await refreshReader(targetPath);
  }, [ensureDraftLoaded, refreshReader]);

  const setDraftContent = React.useCallback((targetPath: string, content: string) => {
    updateDraft(targetPath, (current) => ({
      path: targetPath,
      content,
      baseline: current?.baseline || '',
      reader: current?.reader || null,
      loading: false,
    }));
  }, [updateDraft]);

  const getDraft = React.useCallback((targetPath: string) => draftsRef.current[targetPath] || null, []);

  const isDirty = React.useCallback((targetPath: string) => {
    const draft = draftsRef.current[targetPath];
    if (!draft) return false;
    return draft.content !== draft.baseline;
  }, []);

  const saveDraft = React.useCallback(async (targetPath: string) => {
    const draft = draftsRef.current[targetPath];
    if (!targetPath || !draft) return;
    try {
      const payload = await saveStoryPage({
        path: targetPath,
        content: draft.content,
        loopId: activeLoopId,
        domain: STORY_DOMAIN,
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to save story page.');
        return;
      }

      updateDraft(targetPath, (current) => current ? {
        ...current,
        baseline: current.content,
      } : current);
      setMessage(payload.message || `Saved ${targetPath}.`);
      await refreshReader(targetPath);
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to save story page.'));
    }
  }, [activeLoopId, refreshReader, scopeOverrideToken, updateDraft]);

  const dropDraft = React.useCallback((targetPath: string) => {
    updateDraft(targetPath, () => undefined);
  }, [updateDraft]);

  const pruneDrafts = React.useCallback((validPaths: Set<string>) => {
    setDrafts((current) => {
      let changed = false;
      const next: Record<string, StoryPageDraft> = {};
      for (const [path, draft] of Object.entries(current)) {
        if (!validPaths.has(path)) {
          changed = true;
          continue;
        }
        next[path] = draft;
      }
      return changed ? next : current;
    });
  }, []);

  const confirmClosePath = React.useCallback((targetPath: string) => {
    if (!targetPath || !isDirty(targetPath)) return true;
    if (typeof window === 'undefined') return false;
    return window.confirm(`Discard unsaved story edits for "${targetPath}"?`);
  }, [isDirty]);

  return {
    activeLoopId,
    tree,
    rows,
    pages,
    pagePathSet,
    roots,
    hasLoadedTree,
    loadingTree,
    scopeOverrideToken,
    setScopeOverrideToken,
    selectedPath,
    setSelectedPath,
    message,
    refreshTree,
    openPageDraft,
    getDraft,
    setDraftContent,
    isDirty,
    saveDraft,
    refreshReader,
    dropDraft,
    pruneDrafts,
    confirmClosePath,
  };
}

export type StoryWorkspaceModel = ReturnType<typeof useStoryWorkspaceModel>;

export interface StoryExplorerPanelProps {
  model: StoryWorkspaceModel;
  onOpenPath: (path: string) => void;
}

export function StoryExplorerPanel({ model, onOpenPath }: StoryExplorerPanelProps) {
  const selectedPath = model.selectedPath;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Story Explorer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">loop: {model.activeLoopId}</Badge>
            <Badge variant="outline">roots: {model.roots.join(', ') || 'content/story'}</Badge>
            {model.loadingTree ? <Badge variant="secondary">loading</Badge> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={model.scopeOverrideToken}
              onChange={(event) => model.setScopeOverrideToken(event.target.value)}
              className="w-full"
              placeholder="scope override token (optional)"
            />
            <Button size="sm" variant="outline" onClick={() => model.refreshTree().catch(() => {})}>
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
                  <TableHead>Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.rows.map(({ act, chapter, page }) => (
                  <TableRow
                    key={page.id}
                    className={page.path === selectedPath ? 'bg-muted/40' : ''}
                  >
                    <TableCell>{act.name}</TableCell>
                    <TableCell>{chapter.name}</TableCell>
                    <TableCell className="font-mono text-[11px]">{page.path}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          model.setSelectedPath(page.path);
                          onOpenPath(page.path);
                        }}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {model.rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-xs text-muted-foreground">
                      No story pages found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {model.message ? <p className="px-1 text-xs text-muted-foreground">{model.message}</p> : null}
    </div>
  );
}

export interface StoryPagePanelProps {
  model: StoryWorkspaceModel;
  path: string;
  onCopyText: (text: string) => void;
}

export function StoryPagePanel({ model, path, onCopyText }: StoryPagePanelProps) {
  const openPageDraft = model.openPageDraft;
  React.useEffect(() => {
    openPageDraft(path).catch(() => {});
  }, [openPageDraft, path]);

  const draft = model.getDraft(path);
  const dirty = model.isDirty(path);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex h-[var(--tab-height)] shrink-0 items-center gap-2 border-b border-border px-2">
        <Badge variant="outline" className="font-mono text-[10px]">
          {path}
        </Badge>
        <Badge variant={dirty ? 'secondary' : 'outline'}>{dirty ? 'unsaved' : 'saved'}</Badge>
        {draft?.loading ? <Badge variant="secondary">loading</Badge> : null}
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => model.saveDraft(path).catch(() => {})}
            disabled={!draft || draft.loading || !dirty}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopyText(draft?.content || '')}
            disabled={!draft}
          >
            Copy Page
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => model.refreshReader(path).catch(() => {})}
            disabled={!draft || draft.loading}
          >
            Refresh Reader
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_180px] gap-2 p-2">
        <div className="min-h-0 overflow-hidden rounded-md border border-border">
          <MonacoEditor
            language="markdown"
            theme="vs-dark"
            value={draft?.content || ''}
            onChange={(value) => model.setDraftContent(path, value || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        </div>

        <Textarea
          readOnly
          value={draft?.reader?.content || ''}
          className="h-full min-h-0 resize-none font-serif text-sm leading-6"
        />
      </div>
    </div>
  );
}
