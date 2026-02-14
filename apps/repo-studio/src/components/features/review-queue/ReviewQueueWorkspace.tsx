'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';

type Proposal = {
  id: string;
  editorTarget: string;
  loopId: string;
  kind: string;
  summary: string;
  files: string[];
  diff: string;
  status: 'pending' | 'applied' | 'rejected' | 'failed';
  createdAt: string;
  resolvedAt: string | null;
  approvalToken: string;
};

type ProposalsPayload = {
  ok: boolean;
  proposals: Proposal[];
  pendingCount: number;
  message?: string;
};

export interface ReviewQueueWorkspaceProps {
  onCopyText: (text: string) => void;
  onAttachToAssistant: (label: string, content: string) => void;
}

export function ReviewQueueWorkspace({
  onCopyText,
  onAttachToAssistant,
}: ReviewQueueWorkspaceProps) {
  const [proposals, setProposals] = React.useState<Proposal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [submittingId, setSubmittingId] = React.useState<string | null>(null);

  const selected = React.useMemo(
    () => proposals.find((proposal) => proposal.id === selectedProposalId) || null,
    [proposals, selectedProposalId],
  );

  const refresh = React.useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/repo/proposals/list');
    const payload = await response.json().catch(() => ({ ok: false })) as ProposalsPayload;
    setLoading(false);
    if (!payload.ok) {
      setProposals([]);
      setMessage(payload.message || 'Unable to load proposal queue.');
      return;
    }
    setProposals(Array.isArray(payload.proposals) ? payload.proposals : []);
    if (!selectedProposalId && payload.proposals[0]?.id) {
      setSelectedProposalId(payload.proposals[0].id);
    }
    setMessage(`Loaded ${payload.proposals.length} proposal(s). Pending: ${payload.pendingCount}`);
  }, [selectedProposalId]);

  React.useEffect(() => {
    refresh().catch((error) => setMessage(String(error?.message || error)));
  }, [refresh]);

  const submit = React.useCallback(async (proposalId: string, action: 'apply' | 'reject') => {
    setSubmittingId(proposalId);
    const response = await fetch(`/api/repo/proposals/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ proposalId }),
    });
    const payload = await response.json().catch(() => ({ ok: false }));
    setSubmittingId(null);
    setMessage(payload.message || (payload.ok ? `Proposal ${action}ed.` : `Proposal ${action} failed.`));
    await refresh();
  }, [refresh]);

  const attachSelected = React.useCallback(() => {
    if (!selected) return;
    onAttachToAssistant(`proposal:${selected.id}`, [
      '# Proposal Context',
      '',
      `id: ${selected.id}`,
      `status: ${selected.status}`,
      `kind: ${selected.kind}`,
      `loop: ${selected.loopId}`,
      '',
      '```diff',
      selected.diff || '(no diff payload)',
      '```',
    ].join('\n'));
  }, [onAttachToAssistant, selected]);

  return (
    <div className="h-full min-h-0 space-y-3 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Review Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => refresh().catch(() => {})}>
              Refresh
            </Button>
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
            <Button size="sm" variant="outline" onClick={attachSelected} disabled={!selected}>
              Attach To Assistant
            </Button>
            <Button size="sm" variant="outline" onClick={() => onCopyText(selected?.diff || '')} disabled={!selected}>
              Copy Diff
            </Button>
            {loading ? <Badge variant="secondary">loading</Badge> : null}
          </div>

          {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}

          <div className="max-h-[36vh] overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Loop</TableHead>
                  <TableHead>Files</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow
                    key={proposal.id}
                    className={proposal.id === selectedProposalId ? 'bg-muted/40' : ''}
                    onClick={() => setSelectedProposalId(proposal.id)}
                  >
                    <TableCell>
                      <Badge variant={proposal.status === 'pending' ? 'secondary' : 'outline'}>
                        {proposal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[360px] truncate">{proposal.summary}</TableCell>
                    <TableCell>{proposal.loopId}</TableCell>
                    <TableCell>{proposal.files.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-md border border-border p-3">
            {!selected ? (
              <p className="text-xs text-muted-foreground">Select a proposal to inspect details.</p>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  <div><span className="font-semibold text-foreground">ID:</span> {selected.id}</div>
                  <div><span className="font-semibold text-foreground">Kind:</span> {selected.kind}</div>
                  <div><span className="font-semibold text-foreground">Editor:</span> {selected.editorTarget}</div>
                </div>
                <pre className="max-h-[30vh] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                  {selected.diff || '(no diff payload)'}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
