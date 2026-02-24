'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { toErrorMessage } from '@/lib/api/http';
import {
  applyProposal,
  fetchProposalDiffFile,
  fetchProposalDiffFiles,
  fetchProposals,
  rejectProposal,
} from '@/lib/api/services';
import type {
  Proposal,
  ProposalDiffFileResponse,
  ProposalDiffFileSummary,
} from '@/lib/api/types';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((module) => module.default),
  { ssr: false },
);

export interface ReviewQueuePanelProps {
  activeLoopId?: string;
  onCopyText: (text: string) => void;
}

export function ReviewQueuePanel({
  activeLoopId = 'default',
  onCopyText,
}: ReviewQueuePanelProps) {
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [trustMode, setTrustMode] = React.useState<'require-approval' | 'auto-approve-all'>('require-approval');
  const [lastAutoApplyAt, setLastAutoApplyAt] = React.useState<string | null>(null);
  const [selectedProposalId, setSelectedProposalId] = React.useState<string | null>(null);
  const [proposalFiles, setProposalFiles] = React.useState<ProposalDiffFileSummary[]>([]);
  const [selectedFilePath, setSelectedFilePath] = React.useState<string | null>(null);
  const [selectedPatch, setSelectedPatch] = React.useState<ProposalDiffFileResponse | null>(null);
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [loadingFiles, setLoadingFiles] = React.useState(false);
  const [loadingPatch, setLoadingPatch] = React.useState(false);
  const [submittingId, setSubmittingId] = React.useState<string | null>(null);

  const selected = React.useMemo(
    () => proposals.find((proposal) => proposal.id === selectedProposalId) || null,
    [proposals, selectedProposalId],
  );

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const payload = await fetchProposals(activeLoopId);
      if (!payload.ok) {
        setProposals([]);
        setMessage(payload.message || 'Unable to load proposal queue.');
        setLoading(false);
        return;
      }
      setProposals(Array.isArray(payload.proposals) ? payload.proposals : []);
      setTrustMode(payload.trustMode === 'auto-approve-all' ? 'auto-approve-all' : 'require-approval');
      setLastAutoApplyAt(payload.lastAutoApplyAt || null);
      if (!selectedProposalId && payload.proposals[0]?.id) {
        setSelectedProposalId(payload.proposals[0].id);
      }
      setMessage(`Loaded ${payload.proposals.length} proposal(s). Pending: ${payload.pendingCount}`);
    } catch (error) {
      setProposals([]);
      setMessage(toErrorMessage(error, 'Unable to load proposal queue.'));
    } finally {
      setLoading(false);
    }
  }, [activeLoopId, selectedProposalId]);

  const loadProposalFiles = React.useCallback(async (proposalId: string) => {
    const id = String(proposalId || '').trim();
    if (!id) {
      setProposalFiles([]);
      setSelectedFilePath(null);
      setSelectedPatch(null);
      return;
    }
    setLoadingFiles(true);
    try {
      const payload = await fetchProposalDiffFiles(id);
      if (!payload.ok) {
        setProposalFiles([]);
        setSelectedFilePath(null);
        setSelectedPatch(null);
        setMessage(payload.message || `Unable to load files for proposal ${id}.`);
        return;
      }
      const files = Array.isArray(payload.files) ? payload.files : [];
      setProposalFiles(files);
      const nextFile = files[0]?.path || null;
      setSelectedFilePath(nextFile);
      if (!nextFile) {
        setSelectedPatch(null);
      }
    } catch (error) {
      setProposalFiles([]);
      setSelectedFilePath(null);
      setSelectedPatch(null);
      setMessage(toErrorMessage(error, 'Unable to load proposal diff files.'));
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  const loadPatch = React.useCallback(async (proposalId: string, filePath: string) => {
    const id = String(proposalId || '').trim();
    const path = String(filePath || '').trim();
    if (!id || !path) {
      setSelectedPatch(null);
      return;
    }
    setLoadingPatch(true);
    try {
      const payload = await fetchProposalDiffFile({ proposalId: id, path });
      if (!payload.ok) {
        setSelectedPatch(null);
        setMessage(payload.message || `Unable to load patch for ${path}.`);
        return;
      }
      setSelectedPatch(payload);
    } catch (error) {
      setSelectedPatch(null);
      setMessage(toErrorMessage(error, 'Unable to load selected patch.'));
    } finally {
      setLoadingPatch(false);
    }
  }, []);

  React.useEffect(() => {
    refresh().catch((error) => setMessage(String(error?.message || error)));
  }, [refresh]);

  React.useEffect(() => {
    if (!selectedProposalId) return;
    loadProposalFiles(selectedProposalId).catch((error) => {
      setMessage(String(error?.message || error));
    });
  }, [loadProposalFiles, selectedProposalId]);

  React.useEffect(() => {
    if (!selectedProposalId || !selectedFilePath) return;
    loadPatch(selectedProposalId, selectedFilePath).catch((error) => {
      setMessage(String(error?.message || error));
    });
  }, [loadPatch, selectedFilePath, selectedProposalId]);

  const submit = React.useCallback(async (proposalId: string, action: 'apply' | 'reject') => {
    setSubmittingId(proposalId);
    try {
      const payload = action === 'apply'
        ? await applyProposal(proposalId)
        : await rejectProposal(proposalId);
      setMessage(payload.message || (payload.ok ? `Proposal ${action}ed.` : `Proposal ${action} failed.`));
      await refresh();
    } catch (error) {
      setMessage(toErrorMessage(error, `Proposal ${action} failed.`));
    } finally {
      setSubmittingId(null);
    }
  }, [refresh]);

  const proposalBadgeVariant = trustMode === 'auto-approve-all' ? 'secondary' : 'outline';
  const patchText = selectedPatch?.unifiedPatch || selected?.diff || '(select a proposal and file to inspect patch)';

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-hidden p-2 xl:grid-cols-[minmax(260px,1fr)_minmax(260px,1fr)_minmax(520px,2fr)]">
      <Card className="min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Proposals</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => refresh().catch(() => {})}>Refresh</Button>
            <Badge variant={proposalBadgeVariant}>{trustMode}</Badge>
            {lastAutoApplyAt ? <Badge variant="outline">last auto: {lastAutoApplyAt}</Badge> : null}
            {loading ? <Badge variant="secondary">loading</Badge> : null}
          </div>
          {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}

          <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border">
            {proposals.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground">No proposals in queue.</div>
            ) : (
              <ul className="divide-y divide-border">
                {proposals.map((proposal) => (
                  <li key={proposal.id}>
                    <button
                      type="button"
                      className={`w-full px-3 py-2 text-left text-xs ${proposal.id === selectedProposalId ? 'bg-muted/40' : 'hover:bg-muted/20'}`}
                      onClick={() => setSelectedProposalId(proposal.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={proposal.status === 'pending' ? 'secondary' : 'outline'}>{proposal.status}</Badge>
                        <span className="text-[10px] text-muted-foreground">{proposal.files.length} file(s)</span>
                      </div>
                      <div className="mt-1 truncate font-medium">{proposal.summary}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground">{proposal.loopId} • {proposal.kind}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => selected && submit(selected.id, 'apply')}
              disabled={!selected || selected.status !== 'pending' || submittingId === selected.id}
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => selected && submit(selected.id, 'reject')}
              disabled={!selected || selected.status !== 'pending' || submittingId === selected.id}
            >
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Files</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => selectedProposalId && loadProposalFiles(selectedProposalId).catch(() => {})}
              disabled={!selectedProposalId}
            >
              Refresh Files
            </Button>
            {loadingFiles ? <Badge variant="secondary">loading</Badge> : null}
          </div>

          <div className="min-h-0 flex-1 overflow-auto rounded-md border border-border">
            {proposalFiles.length === 0 ? (
              <div className="p-3 text-xs text-muted-foreground">No parsed file patches for selected proposal.</div>
            ) : (
              <ul className="divide-y divide-border">
                {proposalFiles.map((file) => (
                  <li key={`${file.path}:${file.status}`}>
                    <button
                      type="button"
                      className={`w-full px-3 py-2 text-left text-xs ${selectedFilePath === file.path ? 'bg-muted/40' : 'hover:bg-muted/20'}`}
                      onClick={() => setSelectedFilePath(file.path)}
                    >
                      <div className="truncate font-mono text-[11px]">{file.path}</div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Badge variant="outline">{file.status}</Badge>
                        <span>+{file.additions}</span>
                        <span>-{file.deletions}</span>
                        {!file.hasPatch ? <span>no patch hunks</span> : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Patch Viewer</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onCopyText(patchText)} disabled={!selected}>
              Copy Patch
            </Button>
            {loadingPatch ? <Badge variant="secondary">loading</Badge> : null}
            {selectedPatch ? (
              <Badge variant="outline">hunks: {selectedPatch.hunkCount}</Badge>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border">
            <MonacoEditor
              language="diff"
              theme="vs-dark"
              value={patchText}
              options={{
                readOnly: true,
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

