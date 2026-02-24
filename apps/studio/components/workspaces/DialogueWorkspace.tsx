'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { GraphEditor, type ForgeViewportHandle } from '@/components/GraphEditor';
import { NodePalette, type NodePaletteItem } from '@/components/graph/NodePalette';
import { GraphEditorToolbar } from '@/components/graph/GraphEditorToolbar';
import { GraphLeftToolbar } from '@/components/graph/GraphLeftToolbar';
import { GraphLayoutControls } from '@/components/graph/GraphLayoutControls';
import { NodeDragProvider } from '@/components/graph/useNodeDrag';
import { SectionHeader, type SectionToolbarAction } from '@/components/graph/SectionHeader';
import { CreateNodeModal } from '@/components/CreateNodeModal';
import { useAppMenubarContribution } from '@/lib/contexts/AppMenubarContext';
import { dialogueInspectorSections, FlowMiniMap } from '@/components/forge';
import { AgentWorkflowPanel } from '@/components/ai/AgentWorkflowPanel';
import { DialogueDrawerContent } from '@/components/workspaces/dialogue/DialogueDrawerContent';
import { useForgeGraphsStore, FORGE_DRAFT_KEY, type ForgeGraphScope } from '@/lib/domains/forge/store';
import {
  useForgeGraphs,
  useCreateForgeGraph,
  useUpdateForgeGraph,
  useProjects,
  useCreateProject,
} from '@/lib/data/hooks';
import { useAppShellStore } from '@/lib/app-shell/store';
import { useAssistantChatUrl } from '@/lib/app-shell/useAssistantChatUrl';
import { EDITOR_VIEWPORT_IDS } from '@/lib/app-shell/editor-metadata';
import { CHAT_PANEL_ID } from '@/lib/workspace-registry/constants';
import { DialogueAssistantPanel } from '@/components/workspaces/dialogue/DialogueAssistantPanel';
import { YarnPanel, YARN_PANEL_ID } from '@/components/workspaces/dialogue/YarnPanel';
import { ModelSwitcher } from '@/components/model-switcher';
import { useWorkspacePanelVisibility } from '@/lib/app-shell/useWorkspacePanelVisibility';
import { useSettingsStore } from '@/lib/settings/store';
import { isLangGraphEnabledClient } from '@/lib/feature-flags';
import { useAIHighlight, type AIHighlightPayload } from '@forge/shared/assistant';
import { useForgeAssistantContract } from '@forge/domain-forge/assistant';
import { planStepToOp } from '@forge/domain-forge/copilot/plan-utils';
import { useCreateForgePlan, useForgeStoryBuilder } from '@/lib/data/hooks';
import {
  EditorShell,
  EditorToolbar,
  EditorStatusBar,
  EditorOverlaySurface,
  EditorReviewBar,
  WorkspacePanel,
  WorkspaceLayout,
  usePanelLock,
  type PanelTabDef,
  EditorInspector,
  createEditorMenubarMenus,
  type WorkspaceLayoutRef,
} from '@forge/shared';
import {
  WorkspaceContextProvider,
  WorkspaceMenubarContribution,
  WorkspaceMenubarMenuSlot,
} from '@/components/workspace-context';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card } from '@forge/ui/card';
import { Drawer, DrawerContent, DrawerTitle } from '@forge/ui';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';
import type { OverlaySpec, ActiveOverlay, Selection } from '@forge/shared';
import { isEntity } from '@forge/shared';
import type { ForgeGraphDoc, ForgeGraphKind, ForgeGraphPatchOp, ForgeNodeType } from '@forge/types/graph';
import { FORGE_GRAPH_KIND, FORGE_NODE_TYPE } from '@forge/types/graph';
import {
  BookOpen,
  Boxes,
  Code,
  FileCode,
  FilePlus2,
  FileText,
  GitBranch,
  Layers,
  LayoutDashboard,
  LayoutPanelTop,
  MessageCircle,
  PanelBottom,
  PanelLeft,
  PanelRight,
  Plus,
  Save,
  ScanSearch,
  Shield,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import type { WorkspaceDescriptor } from '@/lib/workspace-registry/workspace-registry';
import { cn } from '@forge/shared/lib/utils';

/** Editor descriptor for registry; defaults live on the component. */
export const workspaceDescriptor: Omit<WorkspaceDescriptor, 'component'> = {
  id: 'dialogue',
  label: 'Dialogue',
  summary: 'YarnSpinner dialogue graph editor (React Flow)',
  icon: MessageCircle,
  order: 0,
};

const CREATE_NODE_OVERLAY_ID = 'create-node';

const EMPTY_FLOW = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

const GRAPH_META: Record<ForgeGraphScope, { label: string; kind: ForgeGraphKind; accent: string; icon: React.ReactNode }> = {
  narrative: {
    label: 'Narrative',
    kind: FORGE_GRAPH_KIND.NARRATIVE,
    accent: 'var(--status-info)',
    icon: <BookOpen size={12} />,
  },
  storylet: {
    label: 'Storylet',
    kind: FORGE_GRAPH_KIND.STORYLET,
    accent: 'var(--graph-edge-choice-1)',
    icon: <Layers size={12} />,
  },
};

function useForgeSelection(
  selectedNodeIds: string[],
  selectedEdgeIds: string[],
  graph: { flow: { nodes: { id: string; data?: { label?: string } }[]; edges: { id: string; source: string; target: string }[] } } | null
): Selection {
  return useMemo(() => {
    if (selectedNodeIds.length === 1 && selectedEdgeIds.length === 0) {
      const node = graph?.flow.nodes.find((n) => n.id === selectedNodeIds[0]);
      return {
        type: 'entity',
        entityType: 'forge.node',
        id: selectedNodeIds[0],
        meta: node?.data?.label != null ? { label: node.data.label } : undefined,
      };
    }
    if (selectedEdgeIds.length === 1 && selectedNodeIds.length === 0) {
      const edge = graph?.flow.edges.find((e) => e.id === selectedEdgeIds[0]);
      return {
        type: 'entity',
        entityType: 'forge.edge',
        id: selectedEdgeIds[0],
        meta: edge ? { source: edge.source, target: edge.target } : undefined,
      };
    }
    return { type: 'none' };
  }, [selectedNodeIds, selectedEdgeIds, graph]);
}

interface ForgeGraphListProps {
  label: string;
  icon: React.ReactNode;
  graphs: ForgeGraphDoc[];
  activeGraphId: number | null;
  onSelect: (graphId: number) => void;
  onCreate?: () => void;
  focusedEditor?: ForgeGraphScope | null;
}

function ForgeGraphList({
  label,
  icon,
  graphs,
  activeGraphId,
  onSelect,
  onCreate,
  focusedEditor,
}: ForgeGraphListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGraphs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return graphs;
    return graphs.filter((graph) => (graph.title ?? '').toLowerCase().includes(query));
  }, [graphs, searchQuery]);

  const toolbarActions: SectionToolbarAction[] = onCreate
    ? [
        {
          id: `create-${label.toLowerCase()}`,
          label: `Create ${label}`,
          icon: <Plus size={12} />,
          onClick: onCreate,
        },
      ]
    : [];

  return (
    <div className="flex h-full w-full flex-col">
      <SectionHeader
        title={`${label}s`}
        icon={icon}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Search ${label.toLowerCase()}s...`}
        badge={filteredGraphs.length > 0 ? { label: String(filteredGraphs.length) } : undefined}
        focusedEditor={focusedEditor ?? null}
        toolbarActions={toolbarActions}
      />

      <div className="flex-1 overflow-y-auto">
        {filteredGraphs.length === 0 ? (
          <div className="px-[var(--panel-padding)] py-6 text-center text-xs text-muted-foreground">
            {searchQuery ? `No ${label.toLowerCase()}s found` : `No ${label.toLowerCase()}s`}
          </div>
        ) : (
          <div className="py-1">
            {filteredGraphs.map((graph) => {
              const isSelected = activeGraphId === graph.id;
              return (
                <Button
                  key={graph.id}
                  variant="ghost"
                  type="button"
                  className={cn(
                    'w-full justify-start px-[var(--control-padding-x)] py-[var(--control-padding-y)] text-left text-xs transition-colors duration-200 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none',
                    isSelected
                      ? 'bg-muted text-foreground border-l-2 border-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:border-l-2 hover:border-accent'
                  )}
                  onClick={() => onSelect(graph.id)}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {icon}
                    <span className="truncate font-medium">{graph.title ?? String(graph.id)}</span>
                  </span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

interface ForgeGraphPanelProps {
  scope: ForgeGraphScope;
  graph: ForgeGraphDoc | null;
  label: string;
  accentColor: string;
  icon: React.ReactNode;
  isActive: boolean;
  applyOperations: (ops: ForgeGraphPatchOp[]) => void;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  isHighlighted?: (entityType: string, id: string) => boolean;
  onSelectionChange: (nodeIds: string[], edgeIds: string[]) => void;
  onDropCreateNode: (nodeType: ForgeNodeType, position: { x: number; y: number }) => void;
  onRequestCreateNode: () => void;
  onCreateGraph: () => void;
  onViewportReady: (handle: ForgeViewportHandle) => void;
  onFocus: () => void;
}

function ForgeGraphPanel({
  scope,
  graph,
  label,
  accentColor,
  icon,
  isActive,
  applyOperations,
  selectedNodeIds,
  selectedEdgeIds,
  isHighlighted,
  onSelectionChange,
  onDropCreateNode,
  onRequestCreateNode,
  onCreateGraph,
  onViewportReady,
  onFocus,
}: ForgeGraphPanelProps) {
  const showMiniMap = useSettingsStore(
    (s) => (s.getSettingValue('graph.showMiniMap', { workspaceId: 'dialogue', viewportId: scope }) as boolean | undefined) ?? true
  );
  const nodesDraggable = useSettingsStore(
    (s) => (s.getSettingValue('graph.nodesDraggable', { workspaceId: 'dialogue', viewportId: scope }) as boolean | undefined) ?? true
  );
  const setSetting = useSettingsStore((s) => s.setSetting);
  const handleToggleMiniMap = useCallback(() => {
    setSetting('viewport', 'graph.showMiniMap', !showMiniMap, {
      workspaceId: 'dialogue',
      viewportId: scope,
    });
  }, [setSetting, showMiniMap, scope]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: { id: string }) => {
      onSelectionChange([node.id], []);
    },
    [onSelectionChange]
  );

  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: { id: string }) => {
      onSelectionChange([], [edge.id]);
    },
    [onSelectionChange]
  );

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col border border-editor-border bg-editor',
        isActive && 'border-t-2'
      )}
      style={isActive ? { borderTopColor: accentColor } : undefined}
      onMouseDown={onFocus}
      data-viewport-scope={scope}
      data-editor-scope={scope}
    >
      <div className="flex items-center justify-between px-[var(--panel-padding)] py-[var(--control-padding-y)] border-b border-editor-border bg-card">
        <div className="flex items-center gap-[var(--control-gap)] text-xs">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-semibold text-foreground">{label}</span>
          <span className="text-muted-foreground truncate max-w-[200px]">{graph?.title ?? 'Untitled'}</span>
        </div>
        <GraphEditorToolbar label={label} onCreateNew={onCreateGraph} />
      </div>
      <div className="flex-1 min-h-0">
        {graph ? (
          <GraphEditor
            className="dialogue-graph-editor"
            graph={graph}
            applyOperations={applyOperations}
            selectedNodeIds={selectedNodeIds}
            selectedEdgeIds={selectedEdgeIds}
            isHighlighted={isHighlighted}
            onSelectionChange={onSelectionChange}
            onViewportReady={onViewportReady}
            onRequestCreateNode={onRequestCreateNode}
            onDropCreateNode={onDropCreateNode}
            onPaneClick={onFocus}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            nodesDraggable={nodesDraggable}
          >
            <GraphLeftToolbar
              showMiniMap={showMiniMap}
              onToggleMiniMap={handleToggleMiniMap}
            />
            {showMiniMap && <FlowMiniMap className="!bg-background !border !shadow-[var(--shadow-lg)]" />}
          </GraphEditor>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="p-6 max-w-md text-center">
              <h2 className="text-lg font-semibold mb-2">No {label} Loaded</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Select a project or create your first {label.toLowerCase()} graph.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export function DialogueWorkspace() {
  const {
    projectId,
    narrativeGraph,
    storyletGraph,
    activeScope,
    dirtyByScope,
    pendingFromPlanByScope,
    setProject,
    setGraph,
    restoreDraft,
    applyOperations,
    setActiveScope,
    setPendingFromPlan,
    markSaved,
  } = useForgeGraphsStore();

  const activeProjectId = useAppShellStore((s) => s.activeProjectId);
  const bottomDrawerOpen = useAppShellStore((s) => s.bottomDrawerOpen.dialogue);
  const setBottomDrawerOpen = useAppShellStore((s) => s.setBottomDrawerOpen);

  // Sync app-level project into forge store so this editor uses the shared project context.
  useEffect(() => {
    setProject(activeProjectId);
  }, [activeProjectId, setProject]);

  const narrativeGraphsQuery = useForgeGraphs(projectId, FORGE_GRAPH_KIND.NARRATIVE);
  const storyletGraphsQuery = useForgeGraphs(projectId, FORGE_GRAPH_KIND.STORYLET);
  const createForgeGraphMutation = useCreateForgeGraph();
  const updateForgeGraphMutation = useUpdateForgeGraph();
  const createForgePlanMutation = useCreateForgePlan();
  const createForgeStoryBuilderMutation = useForgeStoryBuilder();
  const langGraphEnabled = isLangGraphEnabledClient();

  const narrativeGraphs = narrativeGraphsQuery.data ?? [];
  const storyletGraphs = storyletGraphsQuery.data ?? [];

  const workspaceId = 'dialogue';
  const viewportId = EDITOR_VIEWPORT_IDS.dialogue;
  const editorTheme = useSettingsStore((s) =>
    s.getSettingValue('ui.theme', { workspaceId }),
  ) as string | undefined;
  const editorDensity = useSettingsStore((s) =>
    s.getSettingValue('ui.density', { workspaceId }),
  ) as string | undefined;
  const agentName = useSettingsStore((s) =>
    s.getSettingValue('ai.agentName', { workspaceId, viewportId }),
  ) as string | undefined;
  const showAgentName = useSettingsStore((s) =>
    s.getSettingValue('ai.showAgentName', { workspaceId }),
  ) as boolean | undefined;
  const toolsEnabledSetting = useSettingsStore((s) =>
    s.getSettingValue('ai.toolsEnabled', { workspaceId, viewportId }),
  ) as boolean | undefined;
  const toastsEnabled = useSettingsStore((s) => s.getSettingValue('ui.toastsEnabled')) as boolean | undefined;
  const globalLocked = useSettingsStore((s) => s.getSettingValue('editor.locked')) as boolean | undefined;
  const showLeftPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.dialogue-left', { workspaceId, viewportId }),
  ) as boolean | undefined;
  const showMainPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.dialogue-main', { workspaceId, viewportId }),
  ) as boolean | undefined;
  const showRightPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.dialogue-right', { workspaceId, viewportId }),
  ) as boolean | undefined;
  const showChatPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.dialogue-chat', { workspaceId, viewportId }),
  ) as boolean | undefined;
  const showYarnPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.dialogue-yarn', { workspaceId, viewportId }),
  ) as boolean | undefined;
  const showBottomPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.dialogue-bottom', { workspaceId, viewportId }),
  ) as boolean | undefined;
  const entitlements = useEntitlements();
  const toolsEnabled =
    toolsEnabledSetting !== false &&
    entitlements.has(CAPABILITIES.STUDIO_AI_TOOLS) &&
    entitlements.has(CAPABILITIES.FORGE_AI_EDIT);

  const editorLock = usePanelLock();
  const handleApplyingChange = useCallback(
    (isApplying: boolean) => {
      if (isApplying) {
        editorLock.lock('AI is applying changes...');
      } else {
        editorLock.unlock();
      }
    },
    [editorLock],
  );

  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay | null>(null);
  const [selectedNarrativeNodeIds, setSelectedNarrativeNodeIds] = useState<string[]>([]);
  const [selectedNarrativeEdgeIds, setSelectedNarrativeEdgeIds] = useState<string[]>([]);
  const [selectedStoryletNodeIds, setSelectedStoryletNodeIds] = useState<string[]>([]);
  const [selectedStoryletEdgeIds, setSelectedStoryletEdgeIds] = useState<string[]>([]);

  const narrativeViewportRef = useRef<ForgeViewportHandle | null>(null);
  const storyletViewportRef = useRef<ForgeViewportHandle | null>(null);

  const persistedDraftsRef = useRef<{
    projectId?: number;
    activeScope?: ForgeGraphScope;
    drafts?: {
      narrative?: { documentId?: number; graph?: unknown; isDirty?: boolean; pendingFromPlan?: boolean };
      storylet?: { documentId?: number; graph?: unknown; isDirty?: boolean; pendingFromPlan?: boolean };
    };
  } | null>(null);

  const narrativeDraftRestored = useRef(false);
  const storyletDraftRestored = useRef(false);
  const scopeRestored = useRef(false);
  const narrativeCreatingRef = useRef(false);
  const storyletCreatingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(FORGE_DRAFT_KEY);
      if (!raw) {
        persistedDraftsRef.current = null;
        return;
      }
      const parsed = JSON.parse(raw) as { state?: unknown };
      persistedDraftsRef.current = (parsed?.state as typeof persistedDraftsRef.current) ?? null;
    } catch {
      persistedDraftsRef.current = null;
    }
  }, []);

  useEffect(() => {
    narrativeDraftRestored.current = false;
    storyletDraftRestored.current = false;
    scopeRestored.current = false;
    narrativeCreatingRef.current = false;
    storyletCreatingRef.current = false;
  }, [projectId]);

  useEffect(() => {
    if (scopeRestored.current || projectId == null) return;
    const persisted = persistedDraftsRef.current;
    if (persisted?.projectId === projectId && persisted.activeScope) {
      setActiveScope(persisted.activeScope);
    }
    scopeRestored.current = true;
  }, [projectId, setActiveScope]);

  useEffect(() => {
    if (projectId == null || narrativeGraphsQuery.data === undefined) return;
    const persisted = persistedDraftsRef.current;
    const drafts = persisted?.projectId === projectId ? persisted.drafts?.narrative : null;
    if (!narrativeDraftRestored.current && drafts?.documentId && drafts.graph) {
      const match = narrativeGraphs.some((g) => g.id === drafts.documentId);
      if (match) {
        restoreDraft('narrative', {
          graph: drafts.graph as ForgeGraphDoc,
          isDirty: drafts.isDirty ?? true,
          pendingFromPlan: drafts.pendingFromPlan ?? false,
        });
        narrativeDraftRestored.current = true;
        return;
      }
    }
    narrativeDraftRestored.current = true;

    if (narrativeGraph && narrativeGraphs.some((g) => g.id === narrativeGraph.id)) return;

    if (narrativeGraphs.length > 0) {
      setGraph('narrative', narrativeGraphs[0]);
      return;
    }

    if (!narrativeCreatingRef.current) {
      narrativeCreatingRef.current = true;
      createForgeGraphMutation
        .mutateAsync({
          projectId: projectId,
          kind: FORGE_GRAPH_KIND.NARRATIVE,
          title: 'New Narrative',
          flow: EMPTY_FLOW,
        })
        .then((created) => {
          setGraph('narrative', created as ForgeGraphDoc);
        })
        .catch(() => {})
        .finally(() => {
          narrativeCreatingRef.current = false;
        });
    }
  }, [
    projectId,
    narrativeGraphsQuery.data,
    narrativeGraphs,
    narrativeGraph,
    setGraph,
    restoreDraft,
    createForgeGraphMutation,
  ]);

  useEffect(() => {
    if (projectId == null || storyletGraphsQuery.data === undefined) return;
    const persisted = persistedDraftsRef.current;
    const drafts = persisted?.projectId === projectId ? persisted.drafts?.storylet : null;
    if (!storyletDraftRestored.current && drafts?.documentId && drafts.graph) {
      const match = storyletGraphs.some((g) => g.id === drafts.documentId);
      if (match) {
        restoreDraft('storylet', {
          graph: drafts.graph as ForgeGraphDoc,
          isDirty: drafts.isDirty ?? true,
          pendingFromPlan: drafts.pendingFromPlan ?? false,
        });
        storyletDraftRestored.current = true;
        return;
      }
    }
    storyletDraftRestored.current = true;

    if (storyletGraph && storyletGraphs.some((g) => g.id === storyletGraph.id)) return;

    if (storyletGraphs.length > 0) {
      setGraph('storylet', storyletGraphs[0]);
      return;
    }

    if (!storyletCreatingRef.current) {
      storyletCreatingRef.current = true;
      createForgeGraphMutation
        .mutateAsync({
          projectId: projectId,
          kind: FORGE_GRAPH_KIND.STORYLET,
          title: 'New Storylet',
          flow: EMPTY_FLOW,
        })
        .then((created) => {
          setGraph('storylet', created as ForgeGraphDoc);
        })
        .catch(() => {})
        .finally(() => {
          storyletCreatingRef.current = false;
        });
    }
  }, [
    projectId,
    storyletGraphsQuery.data,
    storyletGraphs,
    storyletGraph,
    setGraph,
    restoreDraft,
    createForgeGraphMutation,
  ]);

  const narrativeSelection = useForgeSelection(
    selectedNarrativeNodeIds,
    selectedNarrativeEdgeIds,
    narrativeGraph
  );
  const storyletSelection = useForgeSelection(
    selectedStoryletNodeIds,
    selectedStoryletEdgeIds,
    storyletGraph
  );

  const activeGraph = activeScope === 'narrative' ? narrativeGraph : storyletGraph;
  const activeSelection = activeScope === 'narrative' ? narrativeSelection : storyletSelection;
  const activeDirty = dirtyByScope[activeScope];
  const activePending = pendingFromPlanByScope[activeScope];

  const { onAIHighlight, clearHighlights, isHighlighted } = useAIHighlight();

  const openOverlay = useCallback((id: string, payload?: Record<string, unknown>) => {
    setActiveOverlay({ id, payload });
  }, []);
  const dismissOverlay = useCallback(() => setActiveOverlay(null), []);

  const handleNarrativeSelectionChange = useCallback(
    (nodeIds: string[], edgeIds: string[]) => {
      setActiveScope('narrative');
      setSelectedNarrativeNodeIds(nodeIds);
      setSelectedNarrativeEdgeIds(edgeIds);
      clearHighlights();
    },
    [setActiveScope, clearHighlights]
  );

  const handleStoryletSelectionChange = useCallback(
    (nodeIds: string[], edgeIds: string[]) => {
      setActiveScope('storylet');
      setSelectedStoryletNodeIds(nodeIds);
      setSelectedStoryletEdgeIds(edgeIds);
      clearHighlights();
    },
    [setActiveScope, clearHighlights]
  );

  const handleNarrativeViewportReady = useCallback((handle: ForgeViewportHandle) => {
    narrativeViewportRef.current = handle;
  }, []);

  const handleStoryletViewportReady = useCallback((handle: ForgeViewportHandle) => {
    storyletViewportRef.current = handle;
  }, []);

  const revealSelection = useCallback(() => {
    const handle = activeScope === 'narrative' ? narrativeViewportRef.current : storyletViewportRef.current;
    if (!handle) return;
    if (activeSelection && isEntity(activeSelection)) {
      if (activeSelection.entityType === 'forge.node') {
        handle.fitViewToNodes([activeSelection.id]);
        return;
      }
      if (activeSelection.entityType === 'forge.edge') {
        const graph = activeScope === 'narrative' ? narrativeGraph : storyletGraph;
        const edge = graph?.flow.edges.find((e) => e.id === activeSelection.id);
        if (edge) {
          handle.fitViewToNodes([edge.source, edge.target]);
          return;
        }
      }
    }
    handle.fitView();
  }, [activeScope, activeSelection, narrativeGraph, storyletGraph]);

  const applyActiveOperations = useCallback(
    (ops: ForgeGraphPatchOp[]) => {
      applyOperations(activeScope, ops);
    },
    [applyOperations, activeScope]
  );

  const applyNarrativeOperations = useCallback(
    (ops: ForgeGraphPatchOp[]) => {
      applyOperations('narrative', ops);
    },
    [applyOperations]
  );

  const applyStoryletOperations = useCallback(
    (ops: ForgeGraphPatchOp[]) => {
      applyOperations('storylet', ops);
    },
    [applyOperations]
  );

  const setPendingFromPlanActive = useCallback(
    (value: boolean) => {
      setPendingFromPlan(activeScope, value);
    },
    [setPendingFromPlan, activeScope]
  );

  const saveGraph = useCallback(
    async (scope: ForgeGraphScope) => {
      const graph = scope === 'narrative' ? narrativeGraph : storyletGraph;
      if (!graph || projectId == null) return;
      await updateForgeGraphMutation.mutateAsync({
        id: graph.id,
        data: { flow: graph.flow, title: graph.title },
        projectId,
        kind: graph.kind,
      });
      markSaved(scope);
      if (toastsEnabled !== false) {
        toast.success('Graph saved', { description: graph.title ? `Saved ${graph.title}.` : undefined });
      }
    },
    [narrativeGraph, storyletGraph, projectId, updateForgeGraphMutation, markSaved, toastsEnabled]
  );

  const saveActiveGraph = useCallback(() => {
    saveGraph(activeScope).catch(() => {
      if (toastsEnabled !== false) {
        toast.error('Save failed', { description: 'The server rejected the save request.' });
      }
    });
  }, [saveGraph, activeScope, toastsEnabled]);

  const commitGraph = useCallback(async () => {
    await saveGraph(activeScope);
  }, [saveGraph, activeScope]);

  const createPlanApi = useCallback(async (goal: string, graphSummary: unknown) => {
    return createForgePlanMutation.mutateAsync({ goal, graphSummary });
  }, [createForgePlanMutation]);

  const createStoryBuilderApi = useCallback(
    async (premise: string, options?: { characterCount?: number; sceneCount?: number }) =>
      createForgeStoryBuilderMutation.mutateAsync({
        premise,
        ...(typeof options?.characterCount === 'number'
          ? { characterCount: options.characterCount }
          : {}),
        ...(typeof options?.sceneCount === 'number' ? { sceneCount: options.sceneCount } : {}),
      }),
    [createForgeStoryBuilderMutation]
  );

  const executePlan = useCallback(
    (steps: unknown[]) => {
      const ops = (Array.isArray(steps) ? steps : [])
        .map((s) => planStepToOp(typeof s === 'object' && s !== null ? (s as Record<string, unknown>) : {}))
        .filter(Boolean) as ForgeGraphPatchOp[];
      if (ops.length === 0) return;
      applyActiveOperations(ops);
      const nodeIds: string[] = [];
      const edgeIds: string[] = [];
      for (const op of ops) {
        if (op.type === 'createNode' && op.id) nodeIds.push(op.id);
        if (op.type === 'updateNode') nodeIds.push(op.nodeId);
        if (op.type === 'createEdge') {
          const g2 = activeScope === 'narrative' ? narrativeGraph : storyletGraph;
          const edge = g2?.flow.edges.find((e) => e.source === op.source && e.target === op.target);
          if (edge) edgeIds.push(edge.id);
        }
      }
      if (nodeIds.length || edgeIds.length) {
        onAIHighlight({
          entities: {
            ...(nodeIds.length ? { 'forge.node': nodeIds } : {}),
            ...(edgeIds.length ? { 'forge.edge': edgeIds } : {}),
          },
        });
      }
      setPendingFromPlanActive(true);
    },
    [applyActiveOperations, activeScope, narrativeGraph, storyletGraph, onAIHighlight, setPendingFromPlanActive]
  );

  const handleAssistantHighlight = useCallback(
    (payload: AIHighlightPayload) => {
      onAIHighlight(payload);
    },
    [onAIHighlight],
  );

  const forgeAssistantContract = useForgeAssistantContract({
    graph: activeGraph,
    selection: activeSelection,
    isDirty: activeDirty,
    applyOperations: applyActiveOperations,
    onAIHighlight: handleAssistantHighlight,
    clearAIHighlights: clearHighlights,
    createPlanApi,
    createStoryBuilderApi,
    setPendingFromPlan: setPendingFromPlanActive,
    openOverlay,
    revealSelection,
    createNodeOverlayId: CREATE_NODE_OVERLAY_ID,
  });

  const allowedNodeTypes = useSettingsStore((s) => {
    const v = s.getSettingValue('graph.allowedNodeTypes', { workspaceId: 'dialogue', viewportId: activeScope });
    return (Array.isArray(v) ? v : ['CHARACTER', 'PLAYER', 'CONDITIONAL']) as string[];
  });

  const overlays = useMemo<OverlaySpec[]>(
    () => [
      {
        id: CREATE_NODE_OVERLAY_ID,
        type: 'modal',
        title: 'Create node',
        size: 'md',
        render: ({ payload, onDismiss }) => (
          <CreateNodeModal
            route={{
              key: CREATE_NODE_OVERLAY_ID,
              title: 'Create node',
              size: 'md',
              payload: payload as { nodeType?: ForgeNodeType; label?: string; content?: string; speaker?: string },
            }}
            onClose={onDismiss}
            allowedNodeTypes={allowedNodeTypes}
            onSubmit={({ nodeType, label, content, speaker }) => {
              if (!allowedNodeTypes.includes(nodeType)) return;
              const position = { x: Math.random() * 400, y: Math.random() * 400 };
              applyOperations(activeScope, [
                { type: 'createNode', nodeType, position, data: { label, content, speaker } },
              ]);
            }}
          />
        ),
      },
    ],
    [activeScope, applyOperations, allowedNodeTypes]
  );

  const workflowPanel = useMemo(
    () => (
      <AgentWorkflowPanel
        graph={activeGraph}
        selection={activeSelection}
        toolsEnabled={toolsEnabled}
        applyOperations={applyActiveOperations}
        commitGraph={commitGraph}
        onAIHighlight={onAIHighlight}
        onApplyingChange={handleApplyingChange}
      />
    ),
    [
      activeGraph,
      activeSelection,
      toolsEnabled,
      applyActiveOperations,
      commitGraph,
      onAIHighlight,
      handleApplyingChange,
    ]
  );

  const inspectorSections = useMemo(
    () => dialogueInspectorSections({ graph: activeGraph, applyOperations: applyActiveOperations }),
    [activeGraph, applyActiveOperations]
  );

  const nodePaletteItemsBase: NodePaletteItem[] = useMemo(
    () => [
      {
        id: 'page',
        label: 'Page',
        icon: <FileText size={14} className="text-[var(--graph-node-page-border)]" />,
        category: 'dialogue',
        description: 'Act, Chapter, or Page node for narrative structure',
        dragType: FORGE_NODE_TYPE.PAGE,
      },
      {
        id: 'character',
        label: 'Character',
        icon: <Users size={14} className="text-[var(--graph-node-npc-border)]" />,
        category: 'dialogue',
        description: 'Character dialogue node',
        dragType: FORGE_NODE_TYPE.CHARACTER,
      },
      {
        id: 'player',
        label: 'Player',
        icon: <User size={14} className="text-[var(--graph-node-player-border)]" />,
        category: 'dialogue',
        description: 'Player choice node',
        dragType: FORGE_NODE_TYPE.PLAYER,
      },
      {
        id: 'conditional',
        label: 'Conditional',
        icon: <GitBranch size={14} className="text-[var(--graph-node-conditional-border)]" />,
        category: 'logic',
        description: 'Branching condition node',
        dragType: FORGE_NODE_TYPE.CONDITIONAL,
      },
    ],
    []
  );

  const nodePaletteItems = useMemo(
    () => nodePaletteItemsBase.filter((item) => allowedNodeTypes.includes(item.dragType)),
    [nodePaletteItemsBase, allowedNodeTypes]
  );

  const handleCreateGraph = useCallback(
    (scope: ForgeGraphScope) => {
      if (!projectId) return;
      createForgeGraphMutation
        .mutateAsync({
          projectId,
          kind: GRAPH_META[scope].kind,
          title: `New ${GRAPH_META[scope].label}`,
          flow: EMPTY_FLOW,
        })
        .then((created) => {
          setGraph(scope, created as ForgeGraphDoc);
          setActiveScope(scope);
        })
        .catch(() => {});
    },
    [projectId, createForgeGraphMutation, setGraph, setActiveScope]
  );

  const handleDropCreateNode = useCallback(
    (scope: ForgeGraphScope) => (nodeType: ForgeNodeType, position: { x: number; y: number }) => {
      const allowed = useSettingsStore.getState().getSettingValue('graph.allowedNodeTypes', {
        workspaceId: 'dialogue',
        viewportId: scope,
      });
      const list = Array.isArray(allowed) ? allowed : ['CHARACTER', 'PLAYER', 'CONDITIONAL'];
      if (!list.includes(nodeType)) {
        toast.error(`Cannot add ${nodeType} nodes to this graph. Check viewport settings.`);
        return;
      }
      setActiveScope(scope);
      applyOperations(scope, [{ type: 'createNode', nodeType, position }]);
    },
    [applyOperations, setActiveScope]
  );

  const handleRequestCreateNode = useCallback(
    (scope: ForgeGraphScope) => {
      setActiveScope(scope);
      openOverlay(CREATE_NODE_OVERLAY_ID);
    },
    [openOverlay, setActiveScope]
  );

  const handleNarrativeSelect = useCallback(
    (id: number) => {
      const graph = narrativeGraphs.find((g) => g.id === id);
      if (!graph) return;
      setGraph('narrative', graph);
      setActiveScope('narrative');
      setSelectedNarrativeNodeIds([]);
      setSelectedNarrativeEdgeIds([]);
    },
    [narrativeGraphs, setGraph, setActiveScope]
  );

  const handleStoryletSelect = useCallback(
    (id: number) => {
      const graph = storyletGraphs.find((g) => g.id === id);
      if (!graph) return;
      setGraph('storylet', graph);
      setActiveScope('storylet');
      setSelectedStoryletNodeIds([]);
      setSelectedStoryletEdgeIds([]);
    },
    [storyletGraphs, setGraph, setActiveScope]
  );

  const handleRevert = useCallback(
    async (scope: ForgeGraphScope) => {
      const query = scope === 'narrative' ? narrativeGraphsQuery : storyletGraphsQuery;
      const active = scope === 'narrative' ? narrativeGraph : storyletGraph;
      if (!active) return;
      const result = await query.refetch();
      const refreshed = result.data?.find((g) => g.id === active.id);
      if (refreshed) {
        setGraph(scope, refreshed);
      }
      setPendingFromPlan(scope, false);
    },
    [
      narrativeGraphsQuery,
      storyletGraphsQuery,
      narrativeGraph,
      storyletGraph,
      setGraph,
      setPendingFromPlan,
    ]
  );

  const fileMenuItems = useMemo(
    () => [
      {
        id: 'new-narrative',
        label: 'New narrative',
        icon: <FilePlus2 size={16} />,
        onSelect: () => handleCreateGraph('narrative'),
      },
      {
        id: 'new-storylet',
        label: 'New storylet',
        icon: <FilePlus2 size={16} />,
        onSelect: () => handleCreateGraph('storylet'),
      },
      { id: 'separator-1', type: 'separator' as const },
      {
        id: 'save',
        label: 'Save',
        icon: <Save size={16} />,
        disabled: !activeDirty,
        onSelect: () => saveActiveGraph(),
        shortcut: 'Ctrl+S',
      },
    ],
    [handleCreateGraph, activeDirty, saveActiveGraph]
  );

  const { visibility: panelVisibility, setVisible: setPanelVisible, restoreAll: restoreAllPanels, panelSpecs } = useWorkspacePanelVisibility('dialogue');
  const setSettingsViewportId = useAppShellStore((s) => s.setSettingsViewportId);
  const setSettingsSidebarOpen = useAppShellStore((s) => s.setSettingsSidebarOpen);
  const layoutRef = useRef<WorkspaceLayoutRef>(null);
  const DIALOGUE_LAYOUT_ID = 'dialogue-mode';

  const handlePanelClosed = useCallback(
    (slotId: string) => {
      const spec = panelSpecs.find((p) => p.id === slotId);
      if (spec) setPanelVisible(spec.key, false);
    },
    [panelSpecs, setPanelVisible]
  );

  useEffect(() => {
    setSettingsViewportId(activeScope);
    return () => setSettingsViewportId(null);
  }, [activeScope, setSettingsViewportId]);

  const viewMenuItems = useMemo(
    () => {
      const panelIcons: Record<string, React.ReactNode> = {
        left: <PanelLeft size={16} />,
        right: <PanelRight size={16} />,
        bottom: <PanelBottom size={16} />,
      };
      const layoutSubmenu = [
        ...panelSpecs.map((spec) => ({
          id: `panel-${spec.id}`,
          label: panelVisibility[spec.key] === false ? `Show ${spec.label}` : `Hide ${spec.label}`,
          icon: panelIcons[spec.id] ?? <LayoutPanelTop size={16} />,
          onSelect: () => setPanelVisible(spec.key, !(panelVisibility[spec.key] !== false)),
        })),
        { id: 'view-sep-layout', type: 'separator' as const },
        {
          id: 'restore-all-panels',
          label: 'Restore all panels',
          icon: <LayoutPanelTop size={16} />,
          onSelect: () => {
            restoreAllPanels();
            layoutRef.current?.resetLayout();
          },
        },
        {
          id: 'reset-layout',
          label: 'Reset layout',
          icon: <LayoutPanelTop size={16} />,
          onSelect: () => layoutRef.current?.resetLayout(),
        },
      ];
      return [
        {
          id: 'layout',
          label: 'Layout',
          icon: <LayoutPanelTop size={16} />,
          submenu: layoutSubmenu,
        },
        {
          id: 'open-settings',
          label: 'Open Settings',
          icon: <Wrench size={16} />,
          onSelect: () => setSettingsSidebarOpen(true),
        },
      ];
    },
    [panelSpecs, panelVisibility, restoreAllPanels, setPanelVisible, setSettingsSidebarOpen]
  );

  const menubarMenus = useMemo(
    () =>
      createEditorMenubarMenus({
        file: fileMenuItems,
        view: viewMenuItems,
      }),
    [fileMenuItems, viewMenuItems]
  );
  useAppMenubarContribution(menubarMenus);

  const narrativeNodeCount = narrativeGraph?.flow.nodes.length ?? 0;
  const storyletNodeCount = storyletGraph?.flow.nodes.length ?? 0;
  const totalNodeCount = narrativeNodeCount + storyletNodeCount;

  const toolbarCounts = `${narrativeGraphs.length} narratives | ${storyletGraphs.length} storylets | ${totalNodeCount} nodes`;

  const headerLinks = [
    { label: 'Admin', href: '/admin', icon: <Shield size={14} /> },
    { label: 'API', href: '/api-doc', icon: <Code size={14} /> },
  ];

  const leftPanel = showLeftPanel === false ? undefined : (
    <WorkspacePanel panelId="dialogue-left" title="Library" hideTitleBar className="h-full">
      <WorkspacePanel.Tab
        id="narratives"
        label="Narratives"
        icon={<BookOpen size={12} />}
        accentColor={GRAPH_META.narrative.accent}
      >
        <ForgeGraphList
          label="Narrative"
          icon={<BookOpen size={12} />}
          graphs={narrativeGraphs}
          activeGraphId={narrativeGraph?.id ?? null}
          onSelect={handleNarrativeSelect}
          onCreate={() => handleCreateGraph('narrative')}
          focusedEditor={activeScope === 'narrative' ? 'narrative' : null}
        />
      </WorkspacePanel.Tab>
      <WorkspacePanel.Tab
        id="storylets"
        label="Storylets"
        icon={<Layers size={12} />}
        accentColor={GRAPH_META.storylet.accent}
      >
        <ForgeGraphList
          label="Storylet"
          icon={<Layers size={12} />}
          graphs={storyletGraphs}
          activeGraphId={storyletGraph?.id ?? null}
          onSelect={handleStoryletSelect}
          onCreate={() => handleCreateGraph('storylet')}
          focusedEditor={activeScope === 'storylet' ? 'storylet' : null}
        />
      </WorkspacePanel.Tab>
      <WorkspacePanel.Tab
        id="nodes"
        label="Nodes"
        icon={<Boxes size={12} />}
        accentColor="var(--status-warning)"
      >
        <NodePalette
          items={nodePaletteItems}
          className="h-full"
          focusedEditor={activeScope}
          categoryLabels={{ dialogue: 'Dialogue', logic: 'Logic' }}
          onItemClick={(item) => {
            openOverlay(CREATE_NODE_OVERLAY_ID, { nodeType: item.dragType });
          }}
        />
      </WorkspacePanel.Tab>
    </WorkspacePanel>
  );

  const mainContent = (
    <div className="flex h-full w-full flex-col gap-[var(--control-gap)] p-[var(--panel-padding)]">
      <ForgeGraphPanel
        scope="narrative"
        graph={narrativeGraph}
        label={GRAPH_META.narrative.label}
        accentColor={GRAPH_META.narrative.accent}
        icon={GRAPH_META.narrative.icon}
        isActive={activeScope === 'narrative'}
        applyOperations={applyNarrativeOperations}
        selectedNodeIds={selectedNarrativeNodeIds}
        selectedEdgeIds={selectedNarrativeEdgeIds}
        isHighlighted={activeScope === 'narrative' ? isHighlighted : undefined}
        onSelectionChange={handleNarrativeSelectionChange}
        onDropCreateNode={handleDropCreateNode('narrative')}
        onRequestCreateNode={() => handleRequestCreateNode('narrative')}
        onCreateGraph={() => handleCreateGraph('narrative')}
        onViewportReady={handleNarrativeViewportReady}
        onFocus={() => setActiveScope('narrative')}
      />
      <ForgeGraphPanel
        scope="storylet"
        graph={storyletGraph}
        label={GRAPH_META.storylet.label}
        accentColor={GRAPH_META.storylet.accent}
        icon={GRAPH_META.storylet.icon}
        isActive={activeScope === 'storylet'}
        applyOperations={applyStoryletOperations}
        selectedNodeIds={selectedStoryletNodeIds}
        selectedEdgeIds={selectedStoryletEdgeIds}
        isHighlighted={activeScope === 'storylet' ? isHighlighted : undefined}
        onSelectionChange={handleStoryletSelectionChange}
        onDropCreateNode={handleDropCreateNode('storylet')}
        onRequestCreateNode={() => handleRequestCreateNode('storylet')}
        onCreateGraph={() => handleCreateGraph('storylet')}
        onViewportReady={handleStoryletViewportReady}
        onFocus={() => setActiveScope('storylet')}
      />
    </div>
  );

  const inspectorContent =
    showRightPanel === false ? undefined : (
      <WorkspacePanel panelId="dialogue-right" hideTitleBar className="h-full">
        <EditorInspector selection={activeSelection} sections={inspectorSections} />
      </WorkspacePanel>
    );

  const isEditorLocked = editorLock.locked || globalLocked === true;
  const mainPanel =
    showMainPanel === false ? undefined : (
      <WorkspacePanel
        panelId="dialogue-main"
        title="Dialogue Graphs"
        hideTitleBar
        scrollable={false}
        locked={isEditorLocked}
        lockedProps={{
          description: editorLock.reason ?? (globalLocked ? 'Editor locked in settings.' : undefined),
        }}
      >
        {mainContent}
      </WorkspacePanel>
    );

  const assistantTransportHeaders = useMemo<Record<string, string> | undefined>(() => {
    if (!langGraphEnabled) return undefined;

    const headers: Record<string, string> = {
      'x-forge-ai-domain': 'forge',
      'x-forge-ai-workspace-id': workspaceId,
      'x-forge-ai-viewport-id': activeScope,
    };
    if (projectId != null) {
      headers['x-forge-ai-project-id'] = String(projectId);
    }
    return headers;
  }, [activeScope, workspaceId, langGraphEnabled, projectId]);

  const yarnContent =
    showYarnPanel === false ? undefined : (
      <div className="h-full min-h-0">
        <YarnPanel graph={activeGraph} graphId={activeGraph?.id ?? null} />
      </div>
    );

  const assistantChatUrl = useAssistantChatUrl();
  const chatContent =
    showChatPanel === false ? undefined : (
      <div className="h-full min-h-0">
        <DialogueAssistantPanel
          apiUrl={assistantChatUrl}
          contract={toolsEnabled ? forgeAssistantContract : undefined}
          toolsEnabled={toolsEnabled}
          executePlan={toolsEnabled ? executePlan : undefined}
          transportHeaders={assistantTransportHeaders}
          composerTrailing={<ModelSwitcher provider="assistantUi" variant="composer" />}
        />
      </div>
    );

  const drawerOpen = Boolean(bottomDrawerOpen && showBottomPanel !== false);

  return (
    <NodeDragProvider>
      <EditorShell
        editorId="dialogue"
        title="Dialogue"
        subtitle={activeGraph?.title}
        domain="dialogue"
        theme={editorTheme}
        density={editorDensity}
        className="flex flex-col h-full min-h-0 bg-canvas"
      >
        <EditorToolbar className="bg-sidebar border-b border-sidebar-border">
          <EditorToolbar.Left>
            <EditorToolbar.Group className="gap-[var(--control-gap)]">
              <EditorToolbar.Menubar menus={menubarMenus} />
              <EditorToolbar.Separator />
              <span className="text-xs text-muted-foreground">{toolbarCounts}</span>
            </EditorToolbar.Group>
          </EditorToolbar.Left>
          <EditorToolbar.Right>
            {headerLinks.map((link) => (
              <EditorToolbar.Button
                key={link.label}
                variant="outline"
                size="sm"
                onClick={() => window.open(link.href, '_blank')}
                className="border-border/70 bg-background px-[var(--control-padding-x)] text-foreground shadow-[var(--shadow-xs)]"
              >
                {link.icon}
                <span className="ml-1.5 text-[11px]">{link.label}</span>
              </EditorToolbar.Button>
            ))}
            {showAgentName !== false && (
              <Badge variant="secondary" className="px-[var(--badge-padding-x)] py-[var(--badge-padding-y)] text-[11px] leading-none">
                Agent: {agentName ?? 'Default'}
              </Badge>
            )}
            <EditorToolbar.Separator />
            {dirtyByScope.narrative && (
              <Badge variant="outline" className="px-[var(--badge-padding-x)] py-[var(--badge-padding-y)] text-[11px] text-amber-500 border-amber-500/50">
                Narrative unsaved
              </Badge>
            )}
            {dirtyByScope.storylet && (
              <Badge variant="outline" className="px-[var(--badge-padding-x)] py-[var(--badge-padding-y)] text-[11px] text-amber-500 border-amber-500/50">
                Storylet unsaved
              </Badge>
            )}

          </EditorToolbar.Right>
        </EditorToolbar>

        <EditorReviewBar
          visible={!!(activeGraph && activeDirty && activePending)}
          onRevert={() => handleRevert(activeScope)}
          onAccept={() => setPendingFromPlan(activeScope, false)}
          label="Pending changes from plan"
        />

        <WorkspaceContextProvider workspaceId="dialogue" viewportId={activeScope ?? 'narrative'}>
          <WorkspaceMenubarContribution>
            <WorkspaceMenubarMenuSlot id="file" label="File" items={fileMenuItems} />
            <WorkspaceMenubarMenuSlot id="view" label="View" items={viewMenuItems} />
          </WorkspaceMenubarContribution>
          <WorkspaceLayout
            ref={layoutRef}
            layoutId={DIALOGUE_LAYOUT_ID}
            viewport={{ viewportId, viewportType: 'react-flow' }}
            slots={{ left: { title: 'Library' }, main: { title: 'Dialogue Graphs' } }}
            onPanelClosed={handlePanelClosed}
          >
            <WorkspaceLayout.Left>
              {leftPanel}
            </WorkspaceLayout.Left>
            <WorkspaceLayout.Main>
              <WorkspaceLayout.Panel id="main" title="Dialogue Graphs" icon={<LayoutDashboard size={14} />}>
                {mainPanel}
              </WorkspaceLayout.Panel>
            </WorkspaceLayout.Main>
            <WorkspaceLayout.Right>
              <WorkspaceLayout.Panel id="right" title="Inspector" icon={<ScanSearch size={14} />}>
                {inspectorContent}
              </WorkspaceLayout.Panel>
              <WorkspaceLayout.Panel id={YARN_PANEL_ID} title="Yarn" icon={<FileCode size={14} />}>
                {yarnContent}
              </WorkspaceLayout.Panel>
              <WorkspaceLayout.Panel id={CHAT_PANEL_ID} title="Chat" icon={<MessageCircle size={14} />}>
                {chatContent}
              </WorkspaceLayout.Panel>
            </WorkspaceLayout.Right>
          </WorkspaceLayout>
        </WorkspaceContextProvider>

        <Drawer open={drawerOpen} onOpenChange={(open: boolean) => setBottomDrawerOpen('dialogue', open)}>
          <DrawerContent className="max-h-[70vh] min-h-[240px] flex flex-col">
            <DrawerTitle className="sr-only">Assistant</DrawerTitle>
            <div className="flex-1 min-h-0 overflow-auto">
              <DialogueDrawerContent workflowPanel={workflowPanel} />
            </div>
          </DrawerContent>
        </Drawer>

        <EditorStatusBar>
          {activeDirty ? 'Unsaved changes' : 'Ready'}
          {activeSelection && isEntity(activeSelection) && (
            <span className="ml-2 text-muted-foreground">
              - {activeSelection.entityType === 'forge.node' ? 'Node' : 'Edge'}: {activeSelection.id}
            </span>
          )}
        </EditorStatusBar>

        <EditorOverlaySurface overlays={overlays} activeOverlay={activeOverlay} onDismiss={dismissOverlay} />
      </EditorShell>
    </NodeDragProvider>
  );
}
