'use client';

import * as React from 'react';
import { Bot, Download, ExternalLink, Package, Puzzle, RefreshCcw, Trash2, Wrench } from 'lucide-react';
import { WorkspaceLayout, WorkspaceToolbar } from '@forge/shared/components/workspace';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { AssistantPanel } from '@/components/features/assistant/AssistantPanel';
import {
  fetchRepoWorkspaceExtensionRegistry,
  fetchRepoWorkspaceExtensions,
  installRepoWorkspaceExtension,
  removeRepoWorkspaceExtension,
} from '@/lib/api/services';
import type {
  RepoWorkspaceExtension,
  RepoWorkspaceRegistryEntry,
  RepoWorkspaceRegistryExample,
} from '@/lib/api/types';
import { createHiddenPanelSet, isPanelVisible, type RepoWorkspaceProps } from './types';

export const WORKSPACE_ID = 'extensions' as const;
export const WORKSPACE_LABEL = 'Extensions';

const EXTENSION_REFRESH_EVENT = 'repo-studio:refresh-extensions';

function emitExtensionRefreshEvent() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(EXTENSION_REFRESH_EVENT));
}

function renderInstallActionLabel(entry: RepoWorkspaceRegistryEntry, pendingId: string | null) {
  if (pendingId === `${entry.id}:install`) return 'Installing...';
  if (pendingId === `${entry.id}:update`) return 'Updating...';
  return entry.installed ? 'Update' : 'Install';
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function buildRepositoryPathUrl(repoUrl: string, sourcePath: string) {
  const normalizedRepoUrl = String(repoUrl || '').trim().replace(/\/+$/, '');
  const normalizedSourcePath = String(sourcePath || '').trim().replace(/^\/+/, '');
  if (!normalizedRepoUrl) return '';
  if (!normalizedSourcePath) return normalizedRepoUrl;
  if (isAbsoluteUrl(normalizedSourcePath)) return normalizedSourcePath;
  return `${normalizedRepoUrl}/tree/main/${normalizedSourcePath}`;
}

function openExternalUrl(url: string) {
  if (typeof window === 'undefined') return;
  const normalized = String(url || '').trim();
  if (!normalized) return;
  window.open(normalized, '_blank', 'noopener,noreferrer');
}

function InstalledExtensionsList({
  extensions,
}: {
  extensions: RepoWorkspaceExtension[];
}) {
  return (
    <div className="space-y-2 p-3 text-xs">
      {extensions.length === 0 ? (
        <p className="text-muted-foreground">No extensions installed in this project.</p>
      ) : (
        extensions.map((extension) => (
          <div key={extension.id} className="rounded border border-border px-2 py-1.5">
            <div className="font-medium">{extension.label}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{extension.workspaceId} | {extension.workspaceKind}</div>
          </div>
        ))
      )}
    </div>
  );
}

function RegistryCatalog({
  entries,
  examples,
  submoduleReady,
  warnings,
  pendingId,
  onRefresh,
  onInstall,
  onUpdate,
  onRemove,
}: {
  entries: RepoWorkspaceRegistryEntry[];
  examples: RepoWorkspaceRegistryExample[];
  submoduleReady: boolean;
  warnings: string[];
  pendingId: string | null;
  onRefresh: () => void;
  onInstall: (entry: RepoWorkspaceRegistryEntry) => void;
  onUpdate: (entry: RepoWorkspaceRegistryEntry) => void;
  onRemove: (entry: RepoWorkspaceRegistryEntry) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={submoduleReady ? 'secondary' : 'outline'}>
            {submoduleReady ? 'Registry ready' : 'Registry unavailable'}
          </Badge>
          <span className="text-muted-foreground">
            {entries.length} installable | {examples.length} examples
          </span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCcw size={14} className="mr-1" />
          Refresh
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="space-y-2 p-3 text-xs">
          {!submoduleReady ? (
            <div className="rounded border border-dashed border-border p-3 text-muted-foreground">
              Extension registry submodule is not initialized. Run registry sync scripts to enable install actions.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded border border-border p-2">
                <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Installable Extensions
                </div>
                {entries.length === 0 ? (
                  <div className="rounded border border-dashed border-border p-3 text-muted-foreground">
                    No installable registry extensions found.
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div key={entry.id} className="mb-2 space-y-2 rounded border border-border px-3 py-2 last:mb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">{entry.label}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {entry.id} | {entry.workspaceId} | {entry.workspaceKind}
                          </div>
                          {entry.description ? (
                            <p className="mt-1 text-[11px] text-muted-foreground">{entry.description}</p>
                          ) : null}
                        </div>
                        <Badge variant={entry.installed ? 'secondary' : 'outline'}>
                          {entry.installed ? 'Installed' : 'Not installed'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => (entry.installed ? onUpdate(entry) : onInstall(entry))}
                          disabled={pendingId !== null}
                        >
                          <Download size={14} className="mr-1" />
                          {renderInstallActionLabel(entry, pendingId)}
                        </Button>
                        {entry.installed ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onRemove(entry)}
                            disabled={pendingId !== null}
                          >
                            <Trash2 size={14} className="mr-1" />
                            {pendingId === `${entry.id}:remove` ? 'Removing...' : 'Remove'}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded border border-border p-2">
                <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Studio Examples
                </div>
                {examples.length === 0 ? (
                  <div className="rounded border border-dashed border-border p-3 text-muted-foreground">
                    No studio examples found in registry.
                  </div>
                ) : (
                  examples.map((example) => {
                    const sourceUrl = buildRepositoryPathUrl(example.sourceRepoUrl, example.sourcePath);
                    const docsUrl = isAbsoluteUrl(example.docsUrl || '')
                      ? String(example.docsUrl || '').trim()
                      : buildRepositoryPathUrl(example.sourceRepoUrl, String(example.docsUrl || '').trim());
                    return (
                      <div key={example.id} className="mb-2 space-y-2 rounded border border-border px-3 py-2 last:mb-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium">{example.label}</div>
                            <div className="text-[11px] text-muted-foreground">{example.id} | studio example</div>
                            <p className="mt-1 text-[11px] text-muted-foreground">{example.summary}</p>
                            {example.tags.length > 0 ? (
                              <div className="mt-1 text-[11px] text-muted-foreground">
                                tags: {example.tags.join(', ')}
                              </div>
                            ) : null}
                          </div>
                          <Badge variant="outline">Reference only</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openExternalUrl(sourceUrl)}
                          >
                            <ExternalLink size={14} className="mr-1" />
                            Open GitHub
                          </Button>
                          {docsUrl ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openExternalUrl(docsUrl)}
                            >
                              <ExternalLink size={14} className="mr-1" />
                              View README
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {warnings.length > 0 ? (
            <div className="rounded border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] text-amber-200">
              <p className="mb-1 font-medium">Warnings</p>
              <ul className="space-y-0.5">
                {warnings.map((warning) => (
                  <li key={warning}>- {warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ExtensionsWorkspace({
  layoutId,
  layoutJson,
  onLayoutChange,
  clearLayout,
  hiddenPanelIds,
  onPanelClosed,
}: RepoWorkspaceProps) {
  const hiddenPanels = React.useMemo(() => createHiddenPanelSet(hiddenPanelIds), [hiddenPanelIds]);
  const [registryEntries, setRegistryEntries] = React.useState<RepoWorkspaceRegistryEntry[]>([]);
  const [registryExamples, setRegistryExamples] = React.useState<RepoWorkspaceRegistryExample[]>([]);
  const [registryWarnings, setRegistryWarnings] = React.useState<string[]>([]);
  const [submoduleReady, setSubmoduleReady] = React.useState(false);
  const [installedExtensions, setInstalledExtensions] = React.useState<RepoWorkspaceExtension[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [statusText, setStatusText] = React.useState('');

  const refreshRegistry = React.useCallback(async () => {
    setBusy(true);
    try {
      const payload = await fetchRepoWorkspaceExtensionRegistry();
      if (payload.ok) {
        setRegistryEntries(Array.isArray(payload.entries) ? payload.entries : []);
        setRegistryExamples(Array.isArray(payload.examples) ? payload.examples : []);
        setRegistryWarnings(Array.isArray(payload.warnings) ? payload.warnings : []);
        setSubmoduleReady(payload.submoduleReady === true);
      } else {
        setRegistryEntries([]);
        setRegistryExamples([]);
        setRegistryWarnings([]);
        setSubmoduleReady(false);
        setStatusText(payload.message || 'Unable to load extension registry.');
      }
    } catch (error) {
      setRegistryEntries([]);
      setRegistryExamples([]);
      setRegistryWarnings([]);
      setSubmoduleReady(false);
      setStatusText(String((error as Error)?.message || error || 'Unable to load extension registry.'));
    } finally {
      setBusy(false);
    }
  }, []);

  const refreshInstalled = React.useCallback(async () => {
    try {
      const payload = await fetchRepoWorkspaceExtensions();
      if (payload.ok) {
        setInstalledExtensions(Array.isArray(payload.extensions) ? payload.extensions : []);
      }
    } catch {
      // best-effort only
    }
  }, []);

  const refreshAll = React.useCallback(async () => {
    await Promise.all([
      refreshRegistry(),
      refreshInstalled(),
    ]);
  }, [refreshInstalled, refreshRegistry]);

  React.useEffect(() => {
    refreshAll().catch(() => {});
  }, [refreshAll]);

  const runInstallAction = React.useCallback(async (entry: RepoWorkspaceRegistryEntry, replace: boolean) => {
    setPendingId(`${entry.id}:${replace ? 'update' : 'install'}`);
    setStatusText('');
    try {
      const payload = await installRepoWorkspaceExtension({
        extensionId: entry.id,
        replace,
      });
      setStatusText(payload.message || `Installed ${entry.label}.`);
      await refreshAll();
      emitExtensionRefreshEvent();
    } catch (error) {
      setStatusText(String((error as Error)?.message || error || 'Unable to install extension.'));
    } finally {
      setPendingId(null);
    }
  }, [refreshAll]);

  const runRemoveAction = React.useCallback(async (entry: RepoWorkspaceRegistryEntry) => {
    setPendingId(`${entry.id}:remove`);
    setStatusText('');
    try {
      const payload = await removeRepoWorkspaceExtension({
        extensionId: entry.id,
      });
      setStatusText(payload.message || `Removed ${entry.label}.`);
      await refreshAll();
      emitExtensionRefreshEvent();
    } catch (error) {
      setStatusText(String((error as Error)?.message || error || 'Unable to remove extension.'));
    } finally {
      setPendingId(null);
    }
  }, [refreshAll]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <WorkspaceToolbar className="shrink-0 border-b border-border px-2 py-1">
        <WorkspaceToolbar.Left>
          <Badge variant="secondary" className="font-normal">Project-scoped extensions</Badge>
          {busy ? <span className="text-xs text-muted-foreground">Loading...</span> : null}
        </WorkspaceToolbar.Left>
        <WorkspaceToolbar.Center>
          {statusText ? <span className="max-w-[55vw] truncate text-xs text-muted-foreground">{statusText}</span> : null}
        </WorkspaceToolbar.Center>
        <WorkspaceToolbar.Right>
          <Button type="button" variant="outline" size="sm" onClick={() => refreshAll().catch(() => {})}>
            <RefreshCcw size={14} className="mr-1" />
            Refresh
          </Button>
        </WorkspaceToolbar.Right>
      </WorkspaceToolbar>

      <WorkspaceLayout
        layoutId={layoutId}
        layoutJson={layoutJson}
        onLayoutChange={onLayoutChange}
        clearLayout={clearLayout}
        onPanelClosed={onPanelClosed}
        className="min-h-0 flex-1"
      >
        <WorkspaceLayout.Left>
          <WorkspaceLayout.Panel id="extensions-installed" title="Installed" icon={<Package size={14} />}>
            <InstalledExtensionsList extensions={installedExtensions} />
          </WorkspaceLayout.Panel>
        </WorkspaceLayout.Left>

        <WorkspaceLayout.Main>
          <WorkspaceLayout.Panel id="extensions-registry" title="Registry" icon={<Puzzle size={14} />}>
            <RegistryCatalog
              entries={registryEntries}
              examples={registryExamples}
              submoduleReady={submoduleReady}
              warnings={registryWarnings}
              pendingId={pendingId}
              onRefresh={() => refreshAll().catch(() => {})}
              onInstall={(entry) => {
                runInstallAction(entry, false).catch(() => {});
              }}
              onUpdate={(entry) => {
                runInstallAction(entry, true).catch(() => {});
              }}
              onRemove={(entry) => {
                runRemoveAction(entry).catch(() => {});
              }}
            />
          </WorkspaceLayout.Panel>
        </WorkspaceLayout.Main>

        <WorkspaceLayout.Right hideTabBar>
          {isPanelVisible(hiddenPanels, 'assistant') ? (
            <WorkspaceLayout.Panel id="assistant" title="Assistant" icon={<Bot size={14} />}>
              <div className="h-full">
                <div className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
                  <Wrench size={12} className="mr-1 inline-block" />
                  Use Forge to draft extension manifests/specs.
                </div>
                <AssistantPanel defaultRuntime="forge" />
              </div>
            </WorkspaceLayout.Panel>
          ) : null}
        </WorkspaceLayout.Right>
      </WorkspaceLayout>
    </div>
  );
}
