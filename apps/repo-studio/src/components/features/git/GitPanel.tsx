'use client';

import * as React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { PanelTabs } from '@forge/shared/components/workspace';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';
import { Textarea } from '@forge/ui/textarea';
import { toErrorMessage } from '@/lib/api/http';
import {
  cloneRepoProject,
  commitGitChanges,
  createGitBranch,
  fetchGitBranches,
  fetchGitLog,
  fetchRepoProjects,
  fetchGitStatus,
  importLocalRepoProject,
  pullGit,
  restoreGitPaths,
  setActiveRepoProject,
  stageGitPaths,
  switchGitBranch,
  pushGit,
} from '@/lib/api/services';
import type { GitBranchEntry, GitLogEntry, GitStatusEntry, RepoProject } from '@/lib/api/types';

export interface GitPanelProps {
  onCopyText: (text: string) => void;
}

export function GitPanel({
  onCopyText,
}: GitPanelProps) {
  const [statusRows, setStatusRows] = React.useState<GitStatusEntry[]>([]);
  const [branches, setBranches] = React.useState<GitBranchEntry[]>([]);
  const [logRows, setLogRows] = React.useState<GitLogEntry[]>([]);
  const [selectedPaths, setSelectedPaths] = React.useState<string[]>([]);
  const [branchInput, setBranchInput] = React.useState('');
  const [commitMessage, setCommitMessage] = React.useState('');
  const [projects, setProjects] = React.useState<RepoProject[]>([]);
  const [activeProjectId, setActiveProjectId] = React.useState('');
  const [importPath, setImportPath] = React.useState('');
  const [cloneRemoteUrl, setCloneRemoteUrl] = React.useState('');
  const [cloneTargetPath, setCloneTargetPath] = React.useState('');
  const [message, setMessage] = React.useState('Run refresh to load git state.');
  const [busy, setBusy] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    try {
      const [statusPayload, branchPayload, logPayload] = await Promise.all([
        fetchGitStatus(),
        fetchGitBranches(),
        fetchGitLog(30),
      ]);
      const projectsPayload = await fetchRepoProjects().catch(() => null);
      if (!statusPayload.ok || !branchPayload.ok || !logPayload.ok) {
        setMessage(
          statusPayload.message
          || branchPayload.message
          || logPayload.message
          || 'Unable to refresh git workspace.',
        );
        setBusy(false);
        return;
      }

      setStatusRows(Array.isArray(statusPayload.files) ? statusPayload.files : []);
      setBranches(Array.isArray(branchPayload.branches) ? branchPayload.branches : []);
      setLogRows(Array.isArray(logPayload.entries) ? logPayload.entries : []);
      if (projectsPayload?.ok) {
        const projectRows = Array.isArray(projectsPayload.projects) ? projectsPayload.projects : [];
        setProjects(projectRows);
        setActiveProjectId(projectsPayload.activeProject?.projectId || '');
      }
      const activeProjectName = projectsPayload?.activeProject?.name
        ? ` (${projectsPayload.activeProject.name})`
        : '';
      setMessage(`Git refreshed${activeProjectName}: ${statusPayload.files.length} changed file(s).`);
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to refresh git workspace.'));
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => {
    refresh().catch((error) => setMessage(String(error?.message || error)));
  }, [refresh]);

  const runMutation = React.useCallback(async (url: string, payload: Record<string, unknown>, successMessage: string) => {
    setBusy(true);
    try {
      let body: { ok: boolean; message?: string; stderr?: string };
      if (url === '/api/repo/git/branch/create') {
        body = await createGitBranch(String(payload.name || ''));
      } else if (url === '/api/repo/git/branch/switch') {
        body = await switchGitBranch(String(payload.name || ''));
      } else if (url === '/api/repo/git/restore') {
        body = await restoreGitPaths(Array.isArray(payload.paths) ? payload.paths.map(String) : []);
      } else if (url === '/api/repo/git/stage') {
        body = await stageGitPaths(Array.isArray(payload.paths) ? payload.paths.map(String) : []);
      } else if (url === '/api/repo/git/commit') {
        body = await commitGitChanges(String(payload.message || ''));
      } else if (url === '/api/repo/git/pull') {
        body = await pullGit();
      } else if (url === '/api/repo/git/push') {
        body = await pushGit();
      } else {
        body = { ok: false, message: `Unknown mutation: ${url}` };
      }

      if (!body.ok) {
        setMessage(body.message || body.stderr || 'Git action failed.');
        setBusy(false);
        return false;
      }
      setMessage(body.message || successMessage);
      await refresh();
      return true;
    } catch (error) {
      setMessage(toErrorMessage(error, 'Git action failed.'));
      return false;
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const handleSetActiveProject = React.useCallback(async (projectId: string) => {
    if (!projectId) return;
    setBusy(true);
    try {
      const payload = await setActiveRepoProject(projectId);
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to switch active project.');
        return;
      }
      setActiveProjectId(projectId);
      setMessage(payload.message || 'Active project updated.');
      await refresh();
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to switch active project.'));
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const handleImportProject = React.useCallback(async () => {
    const rootPath = importPath.trim();
    if (!rootPath) return;
    setBusy(true);
    try {
      const payload = await importLocalRepoProject({ rootPath });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to import local project.');
        return;
      }
      setImportPath('');
      setMessage(payload.message || 'Project imported.');
      await refresh();
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to import local project.'));
    } finally {
      setBusy(false);
    }
  }, [importPath, refresh]);

  const handleCloneProject = React.useCallback(async () => {
    const remoteUrl = cloneRemoteUrl.trim();
    const targetPath = cloneTargetPath.trim();
    if (!remoteUrl || !targetPath) return;
    setBusy(true);
    try {
      const payload = await cloneRepoProject({ remoteUrl, targetPath });
      if (!payload.ok) {
        setMessage(payload.message || 'Unable to clone project.');
        return;
      }
      setCloneRemoteUrl('');
      setCloneTargetPath('');
      setMessage(payload.message || 'Project cloned.');
      await refresh();
    } catch (error) {
      setMessage(toErrorMessage(error, 'Unable to clone project.'));
    } finally {
      setBusy(false);
    }
  }, [cloneRemoteUrl, cloneTargetPath, refresh]);

  const togglePath = React.useCallback((repoPath: string) => {
    setSelectedPaths((current) => (
      current.includes(repoPath)
        ? current.filter((value) => value !== repoPath)
        : [...current, repoPath]
    ));
  }, []);

  const panes = React.useMemo(() => [
    {
      id: 'branches',
      label: 'Branches',
      content: (
        <div className="h-full min-h-0 space-y-2 overflow-auto p-2">
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
          <div className="rounded-md border border-border">
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
        </div>
      ),
    },
    {
      id: 'changed-files',
      label: 'Changed Files',
      content: (
        <div className="h-full min-h-0 overflow-auto p-2">
          <div className="rounded-md border border-border">
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
        </div>
      ),
    },
    {
      id: 'commit',
      label: 'Commit',
      content: (
        <div className="h-full min-h-0 space-y-2 overflow-auto p-2">
          <Textarea
            value={commitMessage}
            onChange={(event) => setCommitMessage(event.target.value)}
            className="min-h-[120px]"
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
        </div>
      ),
    },
    {
      id: 'history',
      label: 'History',
      content: (
        <div className="h-full min-h-0 overflow-auto p-2">
          <div className="rounded-md border border-border">
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
        </div>
      ),
    },
  ], [branchInput, branches, busy, commitMessage, logRows, runMutation, selectedPaths, statusRows, togglePath]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Project Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-9 min-w-[260px] rounded-md border border-input bg-background px-2 text-xs"
              value={activeProjectId}
              onChange={(event) => {
                const next = event.target.value;
                setActiveProjectId(next);
                handleSetActiveProject(next).catch(() => {});
              }}
              disabled={busy}
            >
              <option value="">Select active project</option>
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.name} ({project.rootPath})
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refresh().catch(() => {})}
              disabled={busy}
            >
              Refresh Projects
            </Button>
          </div>

          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={importPath}
              onChange={(event) => setImportPath(event.target.value)}
              className="w-full"
              placeholder="Import local git path (C:\\repos\\my-project)"
            />
            <Button size="sm" variant="outline" onClick={handleImportProject} disabled={busy || !importPath.trim()}>
              Import Local
            </Button>
          </div>

          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <Input
              value={cloneRemoteUrl}
              onChange={(event) => setCloneRemoteUrl(event.target.value)}
              className="w-full"
              placeholder="Clone remote URL"
            />
            <Input
              value={cloneTargetPath}
              onChange={(event) => setCloneTargetPath(event.target.value)}
              className="w-full"
              placeholder="Clone target path"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCloneProject}
              disabled={busy || !cloneRemoteUrl.trim() || !cloneTargetPath.trim()}
            >
              Clone
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyText(JSON.stringify({ statusRows, selectedPaths }, null, 2))}
              disabled={busy}
            >
              Copy Snapshot
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runMutation('/api/repo/git/pull', {}, 'Pulled from remote.')}
              disabled={busy}
            >
              Pull
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runMutation('/api/repo/git/push', {}, 'Pushed to remote.')}
              disabled={busy}
            >
              Push
            </Button>
            {busy ? <Badge variant="secondary">working</Badge> : null}
          </div>
          <p className="text-xs text-muted-foreground">{message}</p>
        </CardContent>
      </Card>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-border bg-card/20">
        <PanelTabs tabs={panes} defaultTabId="changed-files" className="h-full" />
      </div>
    </div>
  );
}

