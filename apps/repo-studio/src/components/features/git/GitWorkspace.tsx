'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';
import { Textarea } from '@forge/ui/textarea';

type GitStatusEntry = {
  status: string;
  path: string;
};

type GitBranchEntry = {
  name: string;
  current: boolean;
};

type GitLogEntry = {
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  subject: string;
};

export interface GitWorkspaceProps {
  onAttachToAssistant: (label: string, content: string) => void;
  onCopyText: (text: string) => void;
}

async function parseJson(response: Response) {
  return response.json().catch(() => ({ ok: false, message: 'Invalid response.' }));
}

export function GitWorkspace({
  onAttachToAssistant,
  onCopyText,
}: GitWorkspaceProps) {
  const [statusRows, setStatusRows] = React.useState<GitStatusEntry[]>([]);
  const [branches, setBranches] = React.useState<GitBranchEntry[]>([]);
  const [logRows, setLogRows] = React.useState<GitLogEntry[]>([]);
  const [selectedPaths, setSelectedPaths] = React.useState<string[]>([]);
  const [branchInput, setBranchInput] = React.useState('');
  const [commitMessage, setCommitMessage] = React.useState('');
  const [message, setMessage] = React.useState('Run refresh to load git state.');
  const [busy, setBusy] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    const [statusRes, branchRes, logRes] = await Promise.all([
      fetch('/api/repo/git/status'),
      fetch('/api/repo/git/branches'),
      fetch('/api/repo/git/log?limit=30'),
    ]);
    const statusPayload = await parseJson(statusRes);
    const branchPayload = await parseJson(branchRes);
    const logPayload = await parseJson(logRes);
    setBusy(false);

    if (!statusPayload.ok || !branchPayload.ok || !logPayload.ok) {
      setMessage(
        statusPayload.message
        || branchPayload.message
        || logPayload.message
        || 'Unable to refresh git workspace.',
      );
      return;
    }

    setStatusRows(Array.isArray(statusPayload.files) ? statusPayload.files : []);
    setBranches(Array.isArray(branchPayload.branches) ? branchPayload.branches : []);
    setLogRows(Array.isArray(logPayload.entries) ? logPayload.entries : []);
    setMessage(`Git refreshed: ${statusPayload.files.length} changed file(s).`);
  }, []);

  React.useEffect(() => {
    refresh().catch((error) => setMessage(String(error?.message || error)));
  }, [refresh]);

  const runMutation = React.useCallback(async (url: string, payload: Record<string, unknown>, successMessage: string) => {
    setBusy(true);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await parseJson(response);
    setBusy(false);
    if (!body.ok) {
      setMessage(body.message || body.stderr || 'Git action failed.');
      return false;
    }
    setMessage(body.message || successMessage);
    await refresh();
    return true;
  }, [refresh]);

  const togglePath = React.useCallback((repoPath: string) => {
    setSelectedPaths((current) => (
      current.includes(repoPath)
        ? current.filter((value) => value !== repoPath)
        : [...current, repoPath]
    ));
  }, []);

  const attachSelection = React.useCallback(() => {
    const lines = [
      '# Git Workspace Context',
      '',
      `selected paths: ${selectedPaths.join(', ') || '(none)'}`,
      '',
      ...statusRows
        .filter((row) => selectedPaths.length === 0 || selectedPaths.includes(row.path))
        .map((row) => `- [${row.status}] ${row.path}`),
    ];
    onAttachToAssistant('git:selection', lines.join('\n'));
  }, [onAttachToAssistant, selectedPaths, statusRows]);

  return (
    <div className="h-full min-h-0 space-y-3 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Git Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => refresh().catch(() => {})} disabled={busy}>
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runMutation('/api/repo/git/stage', { paths: selectedPaths }, 'Staged selected files.')}
              disabled={busy || selectedPaths.length === 0}
            >
              Stage Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runMutation('/api/repo/git/restore', { paths: selectedPaths }, 'Restored selected files.')}
              disabled={busy || selectedPaths.length === 0}
            >
              Restore Selected
            </Button>
            <Button size="sm" variant="outline" onClick={attachSelection} disabled={busy}>
              Attach To Assistant
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyText(JSON.stringify({ statusRows, selectedPaths }, null, 2))}
              disabled={busy}
            >
              Copy Snapshot
            </Button>
            {busy ? <Badge variant="secondary">working</Badge> : null}
          </div>
          <p className="text-xs text-muted-foreground">{message}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Branches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Input
              value={branchInput}
              onChange={(event) => setBranchInput(event.target.value)}
              className="w-full md:w-[320px]"
              placeholder="branch name"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => runMutation('/api/repo/git/branch/create', { name: branchInput }, 'Created branch.')}
              disabled={busy || !branchInput.trim()}
            >
              Create + Switch
            </Button>
          </div>
          <div className="max-h-40 overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.name}>
                    <TableCell className="font-mono text-xs">{branch.name}</TableCell>
                    <TableCell>
                      {branch.current ? <Badge variant="default">current</Badge> : <Badge variant="outline">-</Badge>}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runMutation('/api/repo/git/branch/switch', { name: branch.name }, `Switched to ${branch.name}.`)}
                        disabled={busy || branch.current}
                      >
                        Switch
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Changed Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-44 overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Path</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusRows.map((row) => (
                  <TableRow key={`${row.status}:${row.path}`}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedPaths.includes(row.path)}
                        onChange={() => togglePath(row.path)}
                      />
                    </TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell className="font-mono text-xs">{row.path}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Commit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={commitMessage}
            onChange={(event) => setCommitMessage(event.target.value)}
            className="min-h-[90px]"
            placeholder="commit message"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => runMutation('/api/repo/git/commit', { message: commitMessage }, 'Commit created.')}
            disabled={busy || !commitMessage.trim()}
          >
            Commit
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-44 overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hash</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logRows.map((row) => (
                  <TableRow key={row.hash}>
                    <TableCell className="font-mono text-xs">{row.shortHash}</TableCell>
                    <TableCell>{row.author}</TableCell>
                    <TableCell className="text-xs">{row.date}</TableCell>
                    <TableCell>{row.subject}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

