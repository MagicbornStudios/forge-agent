'use client';

import * as React from 'react';
import { Bot, Code2, LoaderCircle, MessageSquare, Settings2 } from 'lucide-react';
import {
  FORGE_RUNTIME_TOOL_DEFINITIONS,
  createForgeRuntimeContract,
  type ForgeRuntimeAboutMe,
  type ForgeRuntimeToolEnabledMap,
} from '@forge/shared';
import {
  AssistantModelSwitcher,
  AssistantPanel as SharedAssistantPanel,
} from '@forge/shared/components/assistant-ui';
import { cn } from '@forge/shared/lib/utils';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@forge/ui/dialog';
import { Input } from '@forge/ui/input';
import { Label } from '@forge/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@forge/ui/popover';
import { Switch } from '@forge/ui/switch';
import { Textarea } from '@forge/ui/textarea';
import {
  fetchProposals,
  fetchSettingsSnapshot,
  upsertSettings,
} from '@/lib/api/services';
import type { AssistantRuntime, Proposal } from '@/lib/api/types';
import { useRepoStudioShellStore } from '@/lib/app-shell/store';
import { useRepoAssistantModelStore } from '@/lib/assistant/model-router-store';

export interface AssistantPanelProps {
  defaultRuntime?: AssistantRuntime;
}

type ForgeToolState = Required<ForgeRuntimeToolEnabledMap>;

type ForgeAssistantSettings = {
  toolsEnabled: boolean;
  toolEnabled: ForgeToolState;
  aboutMe: ForgeRuntimeAboutMe;
};

const RUNTIME_STORAGE_PREFIX = 'repo-studio:assistant-runtime:';
const DEFAULT_FORGE_ABOUT_ME: ForgeRuntimeAboutMe = {
  name: '',
  role: '',
  email: '',
  summary: '',
};
const DEFAULT_FORGE_TOOL_STATE: ForgeToolState = {
  forge_open_about_me: true,
};
const DEFAULT_FORGE_SETTINGS: ForgeAssistantSettings = {
  toolsEnabled: true,
  toolEnabled: DEFAULT_FORGE_TOOL_STATE,
  aboutMe: DEFAULT_FORGE_ABOUT_ME,
};

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

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function normalizeAboutMe(value: unknown): ForgeRuntimeAboutMe {
  const record = asRecord(value);
  return {
    name: String(record.name || '').trim(),
    role: String(record.role || '').trim(),
    email: String(record.email || '').trim(),
    summary: String(record.summary || '').trim(),
  };
}

function normalizeForgeAssistantSettings(merged: Record<string, unknown>): ForgeAssistantSettings {
  const assistant = asRecord(merged.assistant);
  const forge = asRecord(assistant.forge);
  const tools = asRecord(forge.tools);
  return {
    toolsEnabled: forge.toolsEnabled !== false,
    toolEnabled: {
      forge_open_about_me: tools.forge_open_about_me !== false,
    },
    aboutMe: normalizeAboutMe(forge.aboutMe),
  };
}

function toForgeSettingsPayload(settings: ForgeAssistantSettings) {
  return {
    assistant: {
      forge: {
        toolsEnabled: settings.toolsEnabled === true,
        tools: {
          forge_open_about_me: settings.toolEnabled.forge_open_about_me !== false,
        },
        aboutMe: {
          name: String(settings.aboutMe.name || '').trim(),
          role: String(settings.aboutMe.role || '').trim(),
          email: String(settings.aboutMe.email || '').trim(),
          summary: String(settings.aboutMe.summary || '').trim(),
        },
      },
    },
  };
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
  const [forgeSettings, setForgeSettings] = React.useState<ForgeAssistantSettings>(DEFAULT_FORGE_SETTINGS);
  const [forgeSettingsError, setForgeSettingsError] = React.useState('');
  const [aboutMeOpen, setAboutMeOpen] = React.useState(false);
  const [aboutMeDraft, setAboutMeDraft] = React.useState<ForgeRuntimeAboutMe>(DEFAULT_FORGE_ABOUT_ME);
  const [aboutMeSaving, setAboutMeSaving] = React.useState(false);

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

  React.useEffect(() => {
    let cancelled = false;
    fetchSettingsSnapshot({
      workspaceId: activeWorkspaceId,
      loopId: activeLoopId,
    }).then((snapshot) => {
      if (cancelled || snapshot?.ok !== true) return;
      const merged = asRecord(snapshot.merged);
      setForgeSettings(normalizeForgeAssistantSettings(merged));
    }).catch(() => {
      if (!cancelled) setForgeSettings(DEFAULT_FORGE_SETTINGS);
    });
    return () => {
      cancelled = true;
    };
  }, [activeLoopId, activeWorkspaceId]);

  const persistForgeSettings = React.useCallback(async (next: ForgeAssistantSettings) => {
    setForgeSettings(next);
    setForgeSettingsError('');
    await upsertSettings({
      scope: 'local',
      scopeId: 'default',
      workspaceId: activeWorkspaceId,
      loopId: activeLoopId,
      settings: toForgeSettingsPayload(next),
    });
  }, [activeLoopId, activeWorkspaceId]);

  const activeCatalog = runtime === 'codex' ? codexCatalog : forgeCatalog;
  const activeTasks = React.useMemo(() => {
    return tasks.filter((proposal) => toRuntime(proposal.assistantTarget) === runtime).slice(0, 12);
  }, [runtime, tasks]);

  const forgeContract = React.useMemo(() => createForgeRuntimeContract({
    toolEnabled: forgeSettings.toolEnabled,
    aboutMe: forgeSettings.aboutMe,
    onOpenAboutMe: (aboutMe) => {
      setAboutMeDraft(normalizeAboutMe(aboutMe));
      setAboutMeOpen(true);
    },
  }), [forgeSettings.aboutMe, forgeSettings.toolEnabled]);

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

  const setForgeToolsEnabled = React.useCallback((enabled: boolean) => {
    const next = {
      ...forgeSettings,
      toolsEnabled: enabled,
    };
    persistForgeSettings(next).catch((error) => {
      setForgeSettingsError(String((error as Error)?.message || error || 'Unable to save Forge tool settings.'));
    });
  }, [forgeSettings, persistForgeSettings]);

  const setForgeToolEnabled = React.useCallback((toolName: keyof ForgeToolState, enabled: boolean) => {
    const next = {
      ...forgeSettings,
      toolEnabled: {
        ...forgeSettings.toolEnabled,
        [toolName]: enabled,
      },
    };
    persistForgeSettings(next).catch((error) => {
      setForgeSettingsError(String((error as Error)?.message || error || 'Unable to save Forge tool settings.'));
    });
  }, [forgeSettings, persistForgeSettings]);

  const openAboutMeEditor = React.useCallback(() => {
    setAboutMeDraft(forgeSettings.aboutMe);
    setAboutMeOpen(true);
  }, [forgeSettings.aboutMe]);

  const saveAboutMe = React.useCallback(async () => {
    const next = {
      ...forgeSettings,
      aboutMe: normalizeAboutMe(aboutMeDraft),
    };
    setAboutMeSaving(true);
    try {
      await persistForgeSettings(next);
      setAboutMeOpen(false);
    } catch (error) {
      setForgeSettingsError(String((error as Error)?.message || error || 'Unable to save About Me settings.'));
    } finally {
      setAboutMeSaving(false);
    }
  }, [aboutMeDraft, forgeSettings, persistForgeSettings]);

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
      detail: forgeSettings.toolsEnabled ? 'App tools enabled' : 'App tools disabled',
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
              <div key={item.id} className="flex items-center gap-1">
                <Button
                  variant={selected ? 'secondary' : 'ghost'}
                  className={cn('h-auto min-w-0 flex-1 justify-start px-2 py-2 text-left', selected && 'border border-border/60')}
                  onClick={() => handleRuntimeSelect(item.id)}
                >
                  <span className="mr-2 inline-flex items-center">{item.icon}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-medium">{item.label}</span>
                    <span className="truncate text-[10px] text-muted-foreground">{item.detail}</span>
                  </span>
                </Button>
                {item.id === 'forge' ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Configure Forge tools"
                        className="h-8 w-8 shrink-0"
                      >
                        <Settings2 className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="right" className="w-72 space-y-3 p-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold">Forge Tools</p>
                        <p className="text-[11px] text-muted-foreground">Enable/disable runtime tools exposed to the model.</p>
                      </div>
                      <div className="flex items-center justify-between gap-2 rounded-md border border-border/70 px-2 py-1.5">
                        <Label className="text-xs">Enable Forge tools</Label>
                        <Switch
                          checked={forgeSettings.toolsEnabled}
                          onCheckedChange={setForgeToolsEnabled}
                        />
                      </div>
                      <div className="space-y-2">
                        {FORGE_RUNTIME_TOOL_DEFINITIONS.map((toolDef) => (
                          <div key={toolDef.name} className="rounded-md border border-border/70 px-2 py-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium">{toolDef.label}</p>
                              <Switch
                                checked={forgeSettings.toolEnabled[toolDef.name] !== false}
                                onCheckedChange={(enabled) => setForgeToolEnabled(toolDef.name, enabled)}
                                disabled={!forgeSettings.toolsEnabled}
                              />
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">{toolDef.description}</p>
                          </div>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" className="w-full" onClick={openAboutMeEditor}>
                        Edit About Me
                      </Button>
                      {forgeSettingsError ? (
                        <p className="text-[11px] text-destructive">{forgeSettingsError}</p>
                      ) : null}
                    </PopoverContent>
                  </Popover>
                ) : null}
              </div>
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
                {activeCatalog.loading ? 'Loading model catalog...' : `Models: ${activeCatalog.models.length}`}
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
            contract={runtime === 'forge' ? forgeContract : undefined}
            toolsEnabled={runtime === 'forge' ? forgeSettings.toolsEnabled : false}
          />
        </div>
      </div>

      <Dialog open={aboutMeOpen} onOpenChange={setAboutMeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About Me</DialogTitle>
            <DialogDescription>
              Forge test tool payload. This data is persisted in local assistant settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="forge-about-name">Name</Label>
              <Input
                id="forge-about-name"
                value={String(aboutMeDraft.name || '')}
                onChange={(event) => setAboutMeDraft((state) => ({ ...state, name: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="forge-about-role">Role</Label>
              <Input
                id="forge-about-role"
                value={String(aboutMeDraft.role || '')}
                onChange={(event) => setAboutMeDraft((state) => ({ ...state, role: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="forge-about-email">Email</Label>
              <Input
                id="forge-about-email"
                value={String(aboutMeDraft.email || '')}
                onChange={(event) => setAboutMeDraft((state) => ({ ...state, email: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="forge-about-summary">Summary</Label>
              <Textarea
                id="forge-about-summary"
                className="min-h-24"
                value={String(aboutMeDraft.summary || '')}
                onChange={(event) => setAboutMeDraft((state) => ({ ...state, summary: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAboutMeOpen(false)}>Close</Button>
            <Button onClick={saveAboutMe} disabled={aboutMeSaving}>
              {aboutMeSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
