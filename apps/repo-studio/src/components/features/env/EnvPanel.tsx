'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@forge/ui/card';
import { Input } from '@forge/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@forge/ui/table';
import { toErrorMessage } from '@/lib/api/http';
import { fetchEnvTarget, saveEnvTarget } from '@/lib/api/services';
import type {
  DependencyHealth,
  EnvDoctorPayload,
  EnvTargetPayload,
  RepoMode,
  RuntimeDepsResponse,
} from '@/lib/api/types';
import {
  deriveNextSelectedTargetId,
  shouldResetTargetState,
} from '@/components/features/env/env-target-state';

export interface EnvPanelProps {
  profile: string;
  mode: RepoMode;
  onProfileChange: (value: string) => void;
  onModeChange: (value: RepoMode) => void;
  envOutput: string;
  envDoctorPayload: EnvDoctorPayload | null;
  dependencyHealth: DependencyHealth | null;
  runtimeDeps: RuntimeDepsResponse | null;
  onRunDoctor: () => void;
  onRunReconcile: () => void;
  onRefreshDeps: () => void;
  onCopyText: (text: string) => void;
}

function classifyScope(dir?: string) {
  const normalized = String(dir || '.').replace(/\\/g, '/').replace(/^\.?\//, '');
  if (!normalized || normalized === '.') return 'root';
  if (normalized.startsWith('apps/')) return 'app';
  if (normalized.startsWith('vendor/')) return 'vendor';
  return 'package';
}

function parseEnvPaste(raw: string) {
  const values: Record<string, string> = {};
  for (const line of String(raw || '').replace(/\r\n/g, '\n').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = /^([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(trimmed);
    if (!match) continue;
    values[match[1]] = match[2];
  }
  return values;
}

export function EnvPanel({
  profile,
  mode,
  onProfileChange,
  onModeChange,
  envOutput,
  envDoctorPayload,
  dependencyHealth,
  runtimeDeps,
  onRunDoctor,
  onRunReconcile,
  onRefreshDeps,
  onCopyText,
}: EnvPanelProps) {
  const [scopeFilter, setScopeFilter] = React.useState<'all' | 'root' | 'app' | 'package' | 'vendor'>('all');
  const [selectedTargetId, setSelectedTargetId] = React.useState<string>('');
  const [targetPayload, setTargetPayload] = React.useState<EnvTargetPayload | null>(null);
  const [editedValues, setEditedValues] = React.useState<Record<string, string>>({});
  const [pasteText, setPasteText] = React.useState('');
  const [targetStatus, setTargetStatus] = React.useState('Select a target to edit keys.');
  const [loadingTarget, setLoadingTarget] = React.useState(false);
  const [savingTarget, setSavingTarget] = React.useState(false);
  const [lastChangedFiles, setLastChangedFiles] = React.useState<string[]>([]);
  const [lastSaveReadiness, setLastSaveReadiness] = React.useState<EnvTargetPayload['readiness'] | null>(null);
  const loadRequestRef = React.useRef(0);

  const depsOk = dependencyHealth
    ? dependencyHealth.dockviewPackageResolved
      && dependencyHealth.dockviewCssResolved
      && dependencyHealth.sharedStylesResolved
      && dependencyHealth.cssPackagesResolved
      && dependencyHealth.runtimePackagesResolved
      && dependencyHealth.postcssConfigResolved !== false
      && dependencyHealth.tailwindPostcssResolved !== false
      && dependencyHealth.tailwindPipelineResolved !== false
    : null;
  const missing = React.useMemo(
    () => (Array.isArray(envDoctorPayload?.missing) ? envDoctorPayload.missing : []),
    [envDoctorPayload?.missing],
  );
  const conflicts = React.useMemo(
    () => (Array.isArray(envDoctorPayload?.conflicts) ? envDoctorPayload.conflicts : []),
    [envDoctorPayload?.conflicts],
  );
  const warnings = React.useMemo(
    () => (Array.isArray(envDoctorPayload?.warnings) ? envDoctorPayload.warnings : []),
    [envDoctorPayload?.warnings],
  );
  const discovery = envDoctorPayload?.discovery || null;
  const allTargets = React.useMemo(
    () => (Array.isArray(envDoctorPayload?.targets) ? envDoctorPayload.targets : []),
    [envDoctorPayload?.targets],
  );
  const filteredTargets = React.useMemo(
    () => allTargets.filter((target) => (
      scopeFilter === 'all' ? true : classifyScope(target.dir) === scopeFilter
    )),
    [allTargets, scopeFilter],
  );
  const desktopRuntimeReady = runtimeDeps?.desktopRuntimeReady === true;
  const desktopStandaloneReady = runtimeDeps?.desktopStandaloneReady === true;
  const runtimeSeverity = runtimeDeps?.severity || 'warn';

  const loadTarget = React.useCallback(async (targetId: string) => {
    if (!targetId) return;
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setLoadingTarget(true);
    try {
      const payload = await fetchEnvTarget({
        targetId,
        profile,
        mode,
      });
      if (requestId !== loadRequestRef.current) return;
      if (!payload.ok) {
        setTargetStatus(payload.message || `Unable to load target ${targetId}.`);
        setTargetPayload(null);
        setEditedValues({});
        return;
      }
      const rows = Array.isArray(payload.entries) ? payload.entries : [];
      const nextValues: Record<string, string> = {};
      for (const row of rows) {
        nextValues[row.key] = String(row.value ?? '');
      }
      setTargetPayload(payload);
      setEditedValues(nextValues);
      setTargetStatus(`Loaded ${rows.length} key(s) for ${targetId}.`);
    } catch (error) {
      if (requestId !== loadRequestRef.current) return;
      setTargetStatus(toErrorMessage(error, `Unable to load target ${targetId}.`));
      setTargetPayload(null);
      setEditedValues({});
    } finally {
      if (requestId === loadRequestRef.current) {
        setLoadingTarget(false);
      }
    }
  }, [mode, profile]);

  React.useEffect(() => {
    const nextSelected = deriveNextSelectedTargetId(filteredTargets, selectedTargetId);
    if (nextSelected !== selectedTargetId) {
      setSelectedTargetId(nextSelected);
    }
  }, [filteredTargets, selectedTargetId]);

  React.useEffect(() => {
    if (!shouldResetTargetState({
      selectedTargetId,
      targetPayload,
      editedValues,
      hasTargets: filteredTargets.length > 0,
    })) {
      return;
    }
    setSelectedTargetId((current) => (current ? '' : current));
    setTargetPayload((current) => (current == null ? current : null));
    setEditedValues((current) => (Object.keys(current || {}).length > 0 ? {} : current));
  }, [editedValues, filteredTargets.length, selectedTargetId, targetPayload]);

  React.useEffect(() => {
    if (!selectedTargetId) return;
    loadTarget(selectedTargetId).catch(() => {});
  }, [loadTarget, selectedTargetId]);

  const handlePasteImport = React.useCallback(() => {
    const parsed = parseEnvPaste(pasteText);
    if (Object.keys(parsed).length === 0) {
      setTargetStatus('Paste did not contain KEY=value lines.');
      return;
    }
    setEditedValues((current) => ({ ...current, ...parsed }));
    setTargetStatus(`Imported ${Object.keys(parsed).length} key(s) from paste.`);
  }, [pasteText]);

  const handleSaveTarget = React.useCallback(async () => {
    if (!selectedTargetId) return;
    setSavingTarget(true);
    try {
      const payload = await saveEnvTarget({
        targetId: selectedTargetId,
        profile,
        mode,
        values: editedValues,
      });
      if (!payload.ok) {
        setTargetStatus(payload.message || `Save failed for ${selectedTargetId}.`);
        setSavingTarget(false);
        return;
      }
      const changed = Array.isArray(payload.changed) ? payload.changed : [];
      setLastChangedFiles(changed);
      setLastSaveReadiness(payload.readiness || null);
      setTargetStatus([
        payload.message || 'Saved.',
        changed.length > 0 ? `Changed: ${changed.join(', ')}` : 'No file changes were needed.',
      ].join(' '));
      await loadTarget(selectedTargetId);
      onRunDoctor();
    } catch (error) {
      setTargetStatus(toErrorMessage(error, `Save failed for ${selectedTargetId}.`));
    } finally {
      setSavingTarget(false);
    }
  }, [editedValues, loadTarget, mode, onRunDoctor, profile, selectedTargetId]);

  const targetRows = Array.isArray(targetPayload?.entries) ? targetPayload.entries : [];

  return (
    <div className="h-full min-h-0 space-y-3 overflow-auto p-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Env Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input
              className="w-full md:w-[220px]"
              value={profile}
              onChange={(event) => onProfileChange(event.target.value)}
              placeholder="profile"
            />
            <Select value={mode} onValueChange={(value) => onModeChange(value as typeof mode)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">local</SelectItem>
                <SelectItem value="preview">preview</SelectItem>
                <SelectItem value="production">production</SelectItem>
                <SelectItem value="headless">headless</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scopeFilter} onValueChange={(value) => setScopeFilter(value as typeof scopeFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all scopes</SelectItem>
                <SelectItem value="root">root</SelectItem>
                <SelectItem value="app">app</SelectItem>
                <SelectItem value="package">package</SelectItem>
                <SelectItem value="vendor">vendor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTargetId || undefined} onValueChange={(value) => setSelectedTargetId(value)}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Select target" />
              </SelectTrigger>
              <SelectContent>
                {filteredTargets.length === 0 ? (
                  <SelectItem value="__none__" disabled>No targets in current scope</SelectItem>
                ) : filteredTargets.map((target) => (
                  <SelectItem key={target.targetId} value={target.targetId}>
                    {target.targetId} ({classifyScope(target.dir)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={onRunDoctor}>
              Doctor
            </Button>
            <Button size="sm" variant="outline" onClick={onRunReconcile}>
              Reconcile --write --sync-examples
            </Button>
            <Button size="sm" variant="outline" onClick={() => selectedTargetId && loadTarget(selectedTargetId)}>
              Refresh Target
            </Button>
            <Button size="sm" onClick={handleSaveTarget} disabled={!selectedTargetId || savingTarget || mode === 'headless'}>
              Save Target
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">{targetStatus}</p>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-md border border-border">
              <div className="border-b border-border px-3 py-2 text-xs font-medium">Paste Import</div>
              <div className="space-y-2 p-3">
                <textarea
                  className="min-h-28 w-full rounded-md border border-border bg-background p-2 text-xs"
                  placeholder="PASTE_KEY=value"
                  value={pasteText}
                  onChange={(event) => setPasteText(event.target.value)}
                />
                <Button size="sm" variant="outline" onClick={handlePasteImport}>
                  Import Paste
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-border">
              <div className="border-b border-border px-3 py-2 text-xs font-medium">Readiness</div>
              <div className="space-y-2 p-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={targetPayload?.readiness?.ok ? 'default' : 'secondary'}>
                    {targetPayload?.readiness?.ok ? 'target ready' : 'target gaps'}
                  </Badge>
                  {targetPayload?.scope ? <Badge variant="outline">scope: {targetPayload.scope}</Badge> : null}
                </div>
                {Array.isArray(targetPayload?.readiness?.missing) && targetPayload.readiness!.missing!.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {targetPayload.readiness!.missing!.map((item) => <li key={`missing-${item}`}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No missing required keys for this target.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-md border border-border">
              <div className="border-b border-border px-3 py-2 text-xs font-medium">Changed Files</div>
              <div className="space-y-2 p-3 text-xs">
                {lastChangedFiles.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {lastChangedFiles.map((item) => <li key={`changed-${item}`}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No writes in this session yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-md border border-border">
              <div className="border-b border-border px-3 py-2 text-xs font-medium">Post-save Validation</div>
              <div className="space-y-2 p-3 text-xs">
                {lastSaveReadiness ? (
                  <>
                    <Badge variant={lastSaveReadiness.ok ? 'default' : 'secondary'}>
                      {lastSaveReadiness.ok ? 'validated' : 'gaps detected'}
                    </Badge>
                    {Array.isArray(lastSaveReadiness.missing) && lastSaveReadiness.missing.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {lastSaveReadiness.missing.map((item) => <li key={`post-missing-${item}`}>{item}</li>)}
                      </ul>
                    ) : null}
                    {Array.isArray(lastSaveReadiness.warnings) && lastSaveReadiness.warnings.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {lastSaveReadiness.warnings.map((item) => <li key={`post-warning-${item}`}>{item}</li>)}
                      </ul>
                    ) : null}
                  </>
                ) : (
                  <p className="text-muted-foreground">No save validation captured yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-[40vh] overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Section</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targetRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-xs text-muted-foreground">
                      {loadingTarget ? 'Loading target...' : 'No target data loaded.'}
                    </TableCell>
                  </TableRow>
                ) : targetRows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-mono text-xs">{row.key}</TableCell>
                    <TableCell>
                      <Input
                        className="h-8 text-xs"
                        type={row.secret ? 'password' : 'text'}
                        value={editedValues[row.key] ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          setEditedValues((current) => ({ ...current, [row.key]: value }));
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-xs">{row.provenance}</TableCell>
                    <TableCell className="text-xs">{row.section || 'custom'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {envDoctorPayload ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Doctor Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={missing.length === 0 && conflicts.length === 0 ? 'default' : 'secondary'}>
                {missing.length === 0 && conflicts.length === 0 ? 'ready' : 'action needed'}
              </Badge>
              <Badge variant="outline">targets: {allTargets.length}</Badge>
              <Badge variant="outline">missing: {missing.length}</Badge>
              <Badge variant="outline">conflicts: {conflicts.length}</Badge>
              <Badge variant="outline">warnings: {warnings.length}</Badge>
              {envDoctorPayload.runner ? (
                <Badge variant="outline">
                  runner {envDoctorPayload.runner}: {envDoctorPayload.runnerSatisfied === true ? 'ok' : 'blocked'}
                </Badge>
              ) : null}
            </div>

            {discovery ? (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <div className="rounded border border-border p-2">
                  <div className="text-muted-foreground">manifest</div>
                  <div className="text-sm font-semibold">{discovery.manifestCount || 0}</div>
                </div>
                <div className="rounded border border-border p-2">
                  <div className="text-muted-foreground">discovered</div>
                  <div className="text-sm font-semibold">{discovery.discoveredCount || 0}</div>
                </div>
                <div className="rounded border border-border p-2">
                  <div className="text-muted-foreground">merged</div>
                  <div className="text-sm font-semibold">{discovery.mergedCount || 0}</div>
                </div>
                <div className="rounded border border-border p-2">
                  <div className="text-muted-foreground">selected</div>
                  <div className="text-sm font-semibold">{discovery.selectedCount || 0}</div>
                </div>
              </div>
            ) : null}

            {warnings.length > 0 ? (
              <ul className="space-y-1">
                {warnings.map((warning) => (
                  <li key={warning} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-3.5 text-amber-500" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Runtime Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={runtimeSeverity === 'fail' ? 'secondary' : 'outline'}>
              {desktopRuntimeReady ? 'Runtime ready' : 'Runtime setup needed'}
            </Badge>
            <Badge variant={desktopStandaloneReady ? 'outline' : 'secondary'}>
              {desktopStandaloneReady ? 'Standalone ready' : 'Standalone missing (diagnostic)'}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => onCopyText('pnpm dev:repo-studio')}>
              Copy Start (root)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyText('pnpm --filter @forge/repo-studio-app dev')}
            >
              Copy Start (app)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyText('pnpm forge-repo-studio:reclaim -- --dry-run')}
            >
              Copy Reclaim Dry Run
            </Button>
          </div>
          <pre className="overflow-auto rounded-md border border-border bg-background p-3 text-xs">
            {[
              'pnpm dev:repo-studio',
              'pnpm --filter @forge/repo-studio-app dev',
              'pnpm forge-repo-studio:reclaim -- --dry-run',
            ].join('\n')}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Runtime Dependency Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={depsOk ? 'default' : 'secondary'}>
              {depsOk ? 'healthy' : 'needs attention'}
            </Badge>
            <Button size="sm" variant="outline" onClick={onRefreshDeps}>
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyText('pnpm install\npnpm --filter @forge/repo-studio-app build')}
            >
              Copy Dependency Remediation
            </Button>
          </div>

          {dependencyHealth ? (
            <ul className="space-y-1">
              {dependencyHealth.messages.map((message) => (
                <li key={message} className="flex items-start gap-2">
                  {depsOk ? <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-500" /> : <AlertTriangle className="mt-0.5 size-3.5 text-amber-500" />}
                  <span>{message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Dependency health has not been checked yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Raw Output</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[40vh] overflow-auto rounded-md border border-border bg-background p-3 text-xs">
            {envOutput}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

