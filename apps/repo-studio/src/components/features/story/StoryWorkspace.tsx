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
import { toErrorMessage } from '@/lib/api/http';
import {
  applyStoryPublish,
  createStoryPage,
  fetchStoryPage,
  fetchStoryReader,
  fetchStoryTree,
  previewStoryPublish,
  queueStoryPublish,
  saveStoryPage,
} from '@/lib/api/services';
import type {
  StoryActNode,
  StoryPublishPreviewPayload,
  StoryReaderPayload,
} from '@/lib/api/types';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((module) => module.default),
  { ssr: false },
);

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
  const [publishPreview, setPublishPreview] = React.useState<StoryPublishPreviewPayload | null>(null);
  const [publishProposalId, setPublishProposalId] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);

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
    try {
      const payload = await fetchStoryTree({
        loopId: activeLoopId,
        domain: 'story',
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to load story tree.');
        setLoading(false);
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
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to load story tree.'));
    } finally {
      setLoading(false);
    }
  }, [activeLoopId, scopeOverrideToken, selectedPath]);

  const loadPage = React.useCallback(async (targetPath: string) => {
    if (!targetPath) return;
    setLoading(true);
    try {
      const payload = await fetchStoryPage({
        path: targetPath,
        loopId: activeLoopId,
        domain: 'story',
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to read story page.');
        setLoading(false);
        return;
      }
      setContent(payload.content || '');
      setBaseline(payload.content || '');
      setMessage(`Loaded ${payload.path}.`);
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to read story page.'));
    } finally {
      setLoading(false);
    }
  }, [activeLoopId, scopeOverrideToken]);

  const refreshReader = React.useCallback(async (targetPath: string) => {
    try {
      const payload = await fetchStoryReader({
        path: targetPath,
        loopId: activeLoopId,
        domain: 'story',
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to load story reader.');
        return;
      }
      setReader(payload);
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to load story reader.'));
    }
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
    try {
      const payload = await saveStoryPage({
        path: selectedPath,
        content,
        loopId: activeLoopId,
        domain: 'story',
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to save story page.');
        return;
      }
      setBaseline(content);
      setMessage(payload.message || `Saved ${selectedPath}.`);
      await refreshReader(selectedPath);
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to save story page.'));
    }
  }, [activeLoopId, content, refreshReader, scopeOverrideToken, selectedPath]);

  const previewPublish = React.useCallback(async () => {
    if (!selectedPath) return;
    setPublishing(true);
    try {
      const payload = await previewStoryPublish({
        path: selectedPath,
        loopId: activeLoopId,
        domain: 'story',
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to build publish preview.');
        return;
      }
      setPublishPreview(payload);
      setMessage(`Publish preview ready for ${selectedPath}.`);
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to preview story publish.'));
    } finally {
      setPublishing(false);
    }
  }, [activeLoopId, scopeOverrideToken, selectedPath]);

  const queuePublish = React.useCallback(async () => {
    if (!selectedPath) return;
    setPublishing(true);
    try {
      const payload = await queueStoryPublish({
        previewToken: publishPreview?.previewToken,
        path: publishPreview?.previewToken ? undefined : selectedPath,
        loopId: activeLoopId,
        domain: 'story',
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
        editorTarget: 'loop-assistant',
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to queue publish proposal.');
        return;
      }
      if (payload.proposalId) {
        setPublishProposalId(payload.proposalId);
      }
      setMessage(payload.message || 'Publish proposal queued.');
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to queue publish proposal.'));
    } finally {
      setPublishing(false);
    }
  }, [activeLoopId, publishPreview?.previewToken, scopeOverrideToken, selectedPath]);

  const applyPublish = React.useCallback(async () => {
    if (!selectedPath) return;
    setPublishing(true);
    try {
      const payload = await applyStoryPublish({
        proposalId: publishProposalId || undefined,
        previewToken: publishProposalId ? undefined : publishPreview?.previewToken,
        approved: true,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to apply story publish.');
        return;
      }
      setMessage(payload.message || `Publish applied for ${selectedPath}.`);
      await previewPublish();
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to apply story publish.'));
    } finally {
      setPublishing(false);
    }
  }, [publishProposalId, publishPreview?.previewToken, previewPublish, selectedPath]);

  const createCanonicalPage = React.useCallback(async () => {
    try {
      const payload = await createStoryPage({
        actIndex: Number(createActIndex || '1'),
        chapterIndex: Number(createChapterIndex || '1'),
        pageIndex: Number(createPageIndex || '1'),
        content: '',
        loopId: activeLoopId,
        domain: 'story',
        scopeOverrideToken: scopeOverrideToken.trim() || undefined,
      });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to create story page.');
        return;
      }
      setMessage(payload.message || 'Created story page.');
      await refreshTree();
      if (payload.path) {
        setSelectedPath(String(payload.path));
      }
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to create story page.'));
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

  const attachPublishPreview = React.useCallback(() => {
    if (!publishPreview?.ok) return;
    const block = [
      '# Story Publish Preview',
      '',
      `loopId: ${publishPreview.loopId || activeLoopId}`,
      `path: ${publishPreview.path || selectedPath}`,
      `contentHash: ${publishPreview.contentHash || ''}`,
      `changed: ${publishPreview.changedSummary?.changed ? 'yes' : 'no'}`,
      `previousBlocks: ${publishPreview.changedSummary?.previousBlockCount || 0}`,
      `nextBlocks: ${publishPreview.changedSummary?.nextBlockCount || 0}`,
      '',
      '## warnings',
      ...(publishPreview.warnings && publishPreview.warnings.length > 0
        ? publishPreview.warnings.map((warning) => `- ${warning}`)
        : ['- none']),
    ].join('\n');
    onAttachToAssistant(`story-publish:${publishPreview.path || selectedPath}`, block);
  }, [activeLoopId, onAttachToAssistant, publishPreview, selectedPath]);

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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Publish Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={previewPublish} disabled={!selectedPath || publishing}>
              Preview Publish
            </Button>
            <Button size="sm" variant="outline" onClick={queuePublish} disabled={!selectedPath || publishing}>
              Queue Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={applyPublish}
              disabled={!selectedPath || publishing || (!publishProposalId && !publishPreview?.previewToken)}
            >
              Apply Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={attachPublishPreview}
              disabled={!publishPreview?.ok}
            >
              Attach Publish Preview
            </Button>
            {publishing ? <Badge variant="secondary">working</Badge> : null}
            {publishProposalId ? <Badge variant="outline">proposal: {publishProposalId}</Badge> : null}
          </div>

          {publishPreview?.ok ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded-md border border-border p-2 text-xs">
                <div className="font-semibold">Draft Page</div>
                <div>path: {publishPreview.pageDraft?.sourcePath || selectedPath}</div>
                <div>title: {publishPreview.pageDraft?.title || '(n/a)'}</div>
                <div>slug: {publishPreview.pageDraft?.slug || '(n/a)'}</div>
                <div>hash: {publishPreview.contentHash || '(n/a)'}</div>
              </div>
              <div className="rounded-md border border-border p-2 text-xs">
                <div className="font-semibold">Changed Summary</div>
                <div>changed: {publishPreview.changedSummary?.changed ? 'yes' : 'no'}</div>
                <div>existing hash: {publishPreview.changedSummary?.existingHash || '(none)'}</div>
                <div>previous blocks: {publishPreview.changedSummary?.previousBlockCount || 0}</div>
                <div>next blocks: {publishPreview.changedSummary?.nextBlockCount || 0}</div>
              </div>
              <div className="rounded-md border border-border p-2 text-xs md:col-span-2">
                <div className="font-semibold">Warnings</div>
                {publishPreview.warnings && publishPreview.warnings.length > 0 ? (
                  <ul className="mt-1 list-disc pl-4">
                    {publishPreview.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-muted-foreground">No parser warnings.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Generate preview to inspect page/block draft before queuing publish.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
