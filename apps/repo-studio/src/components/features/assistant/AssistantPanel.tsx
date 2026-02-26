'use client';

import * as React from 'react';
import { Bot, Code2, LoaderCircle, MessageSquare } from 'lucide-react';
import {
  AssistantModelSwitcher,
  AssistantPanel as SharedAssistantPanel,
} from '@forge/shared/components/assistant-ui';
import { cn } from '@forge/shared/lib/utils';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { fetchProposals } from '@/lib/api/services';
import type { AssistantRuntime, Proposal } from '@/lib/api/types';
import { useRepoStudioShellStore } from '@/lib/app-shell/store';
import { useRepoAssistantModelStore } from '@/lib/assistant/model-router-store';

export interface AssistantPanelProps {
  defaultRuntime?: AssistantRuntime;
}

const RUNTIME_STORAGE_PREFIX = 'repo-studio:assistant-runtime:';

function defaultRuntimeForWorkspace(workspaceId: string): AssistantRuntime {
  const normalized = String(workspaceId || '').trim().toLowerCase();
  if (normalized === 'code' || normalized === 'diff' || normalized === 'git' || normalized === 'review-queue') {
    return 'codex';
  }
  return 'forge';
}

function toRuntime(target: string): AssistantRuntime {
  const value = String(target || '').trim().toLowerCase();
  if (value === 'codex') return 'codex';
  return 'forge';
}

export function AssistantPanel({
  defaultRuntime,
}: AssistantPanelProps) {
  const activeWorkspaceId = useRepoStudioShellStore((state) => state.route.activeWorkspaceId);
  const activeLoopId = useRepoStudioShellStore((state) => state.activeLoopId);

  const fetchCatalog = useRepoAssistantModelStore((state) => state.fetchCatalog);
  const selectModel = useRepoAssistantModelStore((state) => state.selectModel);
  const forgeCatalog = useRepoAssistantModelStore((state) => state.catalogs.forge);
  const codexCatalog = useRepoAssistantModelStore((state) => state.catalogs.codex);

  const runtimeStorageKey = `${RUNTIME_STORAGE_PREFIX}${activeWorkspaceId}`;
  const [runtime, setRuntime] = React.useState<AssistantRuntime>(
    defaultRuntime || defaultRuntimeForWorkspace(activeWorkspaceId),
  );
  const [tasks, setTasks] = React.useState<Proposal[]>([]);
  const [tasksLoading, setTasksLoading] = React.useState(false);

  React.useEffect(() => {
    const fallbackRuntime = defaultRuntime || defaultRuntimeForWorkspace(activeWorkspaceId);
    try {
      const stored = String(window.localStorage.getItem(runtimeStorageKey) || '').trim().toLowerCase();
      if (stored === 'forge' || stored === 'codex') {
        setRuntime(stored);
        return;
      }
    } catch {
      // ignore local storage access issues
    }
    setRuntime(fallbackRuntime);
  }, [activeWorkspaceId, defaultRuntime, runtimeStorageKey]);

  React.useEffect(() => {
    fetchCatalog(runtime, { workspaceId: activeWorkspaceId, loopId: activeLoopId }).catch(() => {});
  }, [activeLoopId, activeWorkspaceId, fetchCatalog, runtime]);

  React.useEffect(() => {
    setTasksLoading(true);
    fetchProposals(activeLoopId)
      .then((payload) => {
        const proposals = Array.isArray(payload.proposals) ? payload.proposals : [];
        setTasks(proposals);
      })
      .catch(() => {
        setTasks([]);
      })
      .finally(() => {
        setTasksLoading(false);
      });
  }, [activeLoopId]);

  const activeCatalog = runtime === 'codex' ? codexCatalog : forgeCatalog;
  const activeTasks = React.useMemo(() => {
    return tasks.filter((proposal) => toRuntime(proposal.assistantTarget) === runtime).slice(0, 12);
  }, [runtime, tasks]);

  const handleRuntimeSelect = React.useCallback((next: AssistantRuntime) => {
    setRuntime(next);
    try {
      window.localStorage.setItem(runtimeStorageKey, next);
    } catch {
      // ignore local storage access issues
    }
  }, [runtimeStorageKey]);

  const handleModelChange = React.useCallback((nextModelId: string) => {
    selectModel(runtime, nextModelId, {
      workspaceId: activeWorkspaceId,
      loopId: activeLoopId,
    }).catch(() => {});
  }, [activeLoopId, activeWorkspaceId, runtime, selectModel]);

  const apiUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set('assistantTarget', runtime);
    if (activeCatalog.selectedModelId) {
      params.set('model', activeCatalog.selectedModelId);
    }
    params.set('loopId', activeLoopId);
    params.set('workspaceId', activeWorkspaceId);
    return `/api/assistant-chat?${params.toString()}`;
  }, [activeCatalog.selectedModelId, activeLoopId, activeWorkspaceId, runtime]);

  const runtimeItems: Array<{
    id: AssistantRuntime;
    label: string;
    detail: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'forge',
      label: 'Forge Assistant',
      detail: 'App tools enabled',
      icon: <Bot className="size-4" />,
    },
    {
      id: 'codex',
      label: 'Codex Assistant',
      detail: 'Codex runtime, tools off',
      icon: <Code2 className="size-4" />,
    },
  ];

  const composerTrailing = (
    <AssistantModelSwitcher
      value={activeCatalog.selectedModelId}
      options={activeCatalog.models}
      onValueChange={handleModelChange}
      variant="composer"
      loading={activeCatalog.loading}
      disabled={activeCatalog.loading || activeCatalog.models.length === 0}
      title={runtime === 'codex' ? 'Codex model' : 'Forge model'}
      showTierBadge={runtime === 'forge'}
      showTierFilter={runtime === 'forge'}
      showResponsesV2Badge={runtime === 'forge'}
    />
  );

  return (
    <div className="grid h-full min-h-0 grid-cols-[240px_minmax(0,1fr)] overflow-hidden">
      <aside className="min-h-0 overflow-auto border-r border-border bg-card/20 p-2">
        <div className="mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Agents</h3>
          <p className="text-[11px] text-muted-foreground">One assistant surface, runtime-switchable.</p>
        </div>
        <div className="space-y-1">
          {runtimeItems.map((item) => {
            const selected = runtime === item.id;
            return (
              <Button
                key={item.id}
                variant={selected ? 'secondary' : 'ghost'}
                className={cn('h-auto w-full justify-start px-2 py-2 text-left', selected && 'border border-border/60')}
                onClick={() => handleRuntimeSelect(item.id)}
              >
                <span className="mr-2 inline-flex items-center">{item.icon}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium">{item.label}</span>
                  <span className="truncate text-[10px] text-muted-foreground">{item.detail}</span>
                </span>
              </Button>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tasks</h4>
            {tasksLoading ? <LoaderCircle className="size-3 animate-spin text-muted-foreground" /> : null}
          </div>
          <div className="space-y-1">
            {activeTasks.map((task) => (
              <div key={task.id} className="rounded-md border border-border/60 bg-background/70 p-2">
                <p className="line-clamp-2 text-xs">{task.summary}</p>
                <div className="mt-1 flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                  <Badge variant="outline" className="text-[10px]">{task.kind}</Badge>
                </div>
              </div>
            ))}
            {!tasksLoading && activeTasks.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">No tasks for this runtime yet.</p>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              {runtime === 'codex' ? 'Codex Assistant' : 'Forge Assistant'}
            </p>
            {activeCatalog.warning ? (
              <p className="truncate text-[11px] text-amber-400">{activeCatalog.warning}</p>
            ) : (
              <p className="truncate text-[11px] text-muted-foreground">
                {activeCatalog.loading ? 'Loading model catalog…' : `Models: ${activeCatalog.models.length}`}
              </p>
            )}
            {activeCatalog.error ? (
              <p className="truncate text-[11px] text-destructive">{activeCatalog.error}</p>
            ) : null}
          </div>
          <div className="shrink-0">
            <Badge variant="outline" className="text-[10px] uppercase">
              {runtime}
            </Badge>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <SharedAssistantPanel
            apiUrl={apiUrl}
            className="h-full min-h-0"
            composerLeading={<MessageSquare className="size-4 text-muted-foreground" />}
            composerTrailing={composerTrailing}
          />
        </div>
      </div>
    </div>
  );
}
