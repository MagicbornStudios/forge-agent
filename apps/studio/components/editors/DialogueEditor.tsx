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
import { ModelSwitcher } from '@/components/model-switcher';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { dialogueInspectorSections, FlowMiniMap } from '@/components/forge';
import { AgentWorkflowPanel } from '@/components/ai/AgentWorkflowPanel';
import { DialogueDrawerContent } from '@/components/editors/dialogue/DialogueDrawerContent';
import { useForgeGraphsStore, FORGE_DRAFT_KEY, type ForgeGraphScope } from '@/lib/domains/forge/store';
import {
  useForgeGraphs,
  useCreateForgeGraph,
  useUpdateForgeGraph,
  useProjects,
  useCreateProject,
} from '@/lib/data/hooks';
import { useEditorStore } from '@/lib/app-shell/store';
import { EDITOR_VIEWPORT_IDS } from '@/lib/app-shell/editor-metadata';
import { useSettingsStore } from '@/lib/settings/store';
import { useAIHighlight } from '@forge/shared/copilot/use-ai-highlight';
import { useDomainCopilot } from '@forge/shared/copilot/use-domain-copilot';
import { useForgeContract } from '@forge/domain-forge/copilot';
import { useCreateForgePlan } from '@/lib/data/hooks';
import {
  EditorShell,
  EditorToolbar,
  EditorStatusBar,
  EditorOverlaySurface,
  EditorReviewBar,
  DockLayout,
  DockPanel,
  usePanelLock,
  type PanelTabDef,
  EditorInspector,
} from '@forge/shared';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { Card } from '@forge/ui/card';
import { Drawer, DrawerContent, DrawerTitle } from '@forge/ui';
import { Library, ScanSearch, Wrench } from 'lucide-react';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';
import type { OverlaySpec, ActiveOverlay, Selection } from '@forge/shared';
import { isEntity } from '@forge/shared';
import type { ForgeGraphDoc, ForgeGraphKind, ForgeGraphPatchOp, ForgeNodeType } from '@forge/types/graph';
import { FORGE_GRAPH_KIND, FORGE_NODE_TYPE } from '@forge/types/graph';
import {
  BookOpen,
  Boxes,
  Code,
  FilePlus2,
  Focus,
  GitBranch,
  Layers,
  Maximize2,
  PanelBottom,
  Plus,
  Save,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { cn } from '@forge/shared/lib/utils';

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

function getSelectionNodeIds(
  selectedNodeIds: string[],
  selectedEdgeIds: string[],
  graph: ForgeGraphDoc | null
) {
  if (selectedNodeIds.length > 0) return selectedNodeIds;
  if (!graph || selectedEdgeIds.length === 0) return [];
  const ids = selectedEdgeIds.flatMap((edgeId) => {
    const edge = graph.flow.edges.find((item) => item.id === edgeId);
    return edge ? [edge.source, edge.target] : [];
  });
  return Array.from(new Set(ids));
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
          tooltip: `Create ${label}`,
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
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
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
                    'w-full justify-start px-2 py-1.5 text-left text-xs transition-colors duration-200 focus:ring-0 focus-visible:ring-0 focus-visible:outline-none',
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
  onFitView: () => void;
  onFitSelection: () => void;
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
  onFitView,
  onFitSelection,
}: ForgeGraphPanelProps) {
  const [showMiniMap, setShowMiniMap] = useState(true);

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
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-editor-border bg-card">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-semibold text-foreground">{label}</span>
          <span className="text-muted-foreground truncate max-w-[200px]">{graph?.title ?? 'Untitled'}</span>
        </div>
        <GraphEditorToolbar label={label} onCreateNew={onCreateGraph} />
      </div>
      <div className="flex-1 min-h-0">
        {graph ? (
          <GraphEditor
            graph={graph}
            applyOperations={applyOperations}
            selectedNodeIds={selectedNodeIds}
            selectedEdgeIds={selectedEdgeIds}
            isHighlighted={isHighlighted}
            onSelectionChange={onSelectionChange}
            onViewportReady={onViewportReady}
            onRequestCreateNode={onRequestCreateNode}
            onDropCreateNode={onDropCreateNode}
          >
            <GraphLeftToolbar
              showMiniMap={showMiniMap}
              onToggleMiniMap={() => setShowMiniMap((prev) => !prev)}
              onFitView={onFitView}
            />
            <GraphLayoutControls onFitView={onFitView} onFitSelection={onFitSelection} />
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

export function DialogueEditor() {
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

  const activeProjectId = useEditorStore((s) => s.activeProjectId);
  const bottomDrawerOpen = useEditorStore((s) => s.bottomDrawerOpen.dialogue);
  const setBottomDrawerOpen = useEditorStore((s) => s.setBottomDrawerOpen);
  const toggleBottomDrawer = useEditorStore((s) => s.toggleBottomDrawer);

  // Sync app-level project into forge store so this editor uses the shared project context.
  useEffect(() => {
    setProject(activeProjectId);
  }, [activeProjectId, setProject]);

  const narrativeGraphsQuery = useForgeGraphs(projectId, FORGE_GRAPH_KIND.NARRATIVE);
  const storyletGraphsQuery = useForgeGraphs(projectId, FORGE_GRAPH_KIND.STORYLET);
  const createForgeGraphMutation = useCreateForgeGraph();
  const updateForgeGraphMutation = useUpdateForgeGraph();
  const createForgePlanMutation = useCreateForgePlan();

  const narrativeGraphs = narrativeGraphsQuery.data ?? [];
  const storyletGraphs = storyletGraphsQuery.data ?? [];

  const editorId = 'dialogue';
  const viewportId = EDITOR_VIEWPORT_IDS.dialogue;
  const editorTheme = useSettingsStore((s) =>
    s.getSettingValue('ui.theme', { editorId }),
  ) as string | undefined;
  const editorDensity = useSettingsStore((s) =>
    s.getSettingValue('ui.density', { editorId }),
  ) as string | undefined;
  const agentName = useSettingsStore((s) =>
    s.getSettingValue('ai.agentName', { editorId, viewportId }),
  ) as string | undefined;
  const showAgentName = useSettingsStore((s) =>
    s.getSettingValue('ai.showAgentName', { editorId }),
  ) as boolean | undefined;
  const toolsEnabledSetting = useSettingsStore((s) =>
    s.getSettingValue('ai.toolsEnabled', { editorId, viewportId }),
  ) as boolean | undefined;
  const toastsEnabled = useSettingsStore((s) => s.getSettingValue('ui.toastsEnabled')) as boolean | undefined;
  const globalLocked = useSettingsStore((s) => s.getSettingValue('editor.locked')) as boolean | undefined;
  const showLeftPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.dialogue-left', { editorId, viewportId }),
  ) as boolean | undefined;
  const showRightPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.dialogue-right', { editorId, viewportId }),
  ) as boolean | undefined;
  const showBottomPanel = useSettingsStore((s) =>
    s.getSettingValue('panel.visible.dialogue-bottom', { editorId, viewportId }),
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

  const fitViewNarrative = useCallback(() => {
    narrativeViewportRef.current?.fitView();
  }, []);

  const fitViewStorylet = useCallback(() => {
    storyletViewportRef.current?.fitView();
  }, []);

  const fitSelectionNarrative = useCallback(() => {
    const handle = narrativeViewportRef.current;
    const nodeIds = getSelectionNodeIds(selectedNarrativeNodeIds, selectedNarrativeEdgeIds, narrativeGraph);
    if (!handle) return;
    if (nodeIds.length === 0) {
      handle.fitView();
      return;
    }
    handle.fitViewToNodes(nodeIds);
  }, [selectedNarrativeNodeIds, selectedNarrativeEdgeIds, narrativeGraph]);

  const fitSelectionStorylet = useCallback(() => {
    const handle = storyletViewportRef.current;
    const nodeIds = getSelectionNodeIds(selectedStoryletNodeIds, selectedStoryletEdgeIds, storyletGraph);
    if (!handle) return;
    if (nodeIds.length === 0) {
      handle.fitView();
      return;
    }
    handle.fitViewToNodes(nodeIds);
  }, [selectedStoryletNodeIds, selectedStoryletEdgeIds, storyletGraph]);

  const fitViewActive = useCallback(() => {
    if (activeScope === 'narrative') {
      fitViewNarrative();
      return;
    }
    fitViewStorylet();
  }, [activeScope, fitViewNarrative, fitViewStorylet]);

  const fitSelectionActive = useCallback(() => {
    if (activeScope === 'narrative') {
      fitSelectionNarrative();
      return;
    }
    fitSelectionStorylet();
  }, [activeScope, fitSelectionNarrative, fitSelectionStorylet]);

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

  const forgeContract = useForgeContract({
    graph: activeGraph,
    selection: activeSelection,
    isDirty: activeDirty,
    applyOperations: applyActiveOperations,
    openOverlay,
    revealSelection,
    onAIHighlight,
    clearAIHighlights: clearHighlights,
    createNodeOverlayId: CREATE_NODE_OVERLAY_ID,
    createPlanApi,
    setPendingFromPlan: setPendingFromPlanActive,
    commitGraph,
  });

  useDomainCopilot(forgeContract, { toolsEnabled });

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
            onSubmit={({ nodeType, label, content, speaker }) => {
              const position = { x: Math.random() * 400, y: Math.random() * 400 };
              applyOperations(activeScope, [
                { type: 'createNode', nodeType, position, data: { label, content, speaker } },
              ]);
            }}
          />
        ),
      },
    ],
    [activeScope, applyOperations]
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

  const nodePaletteItems: NodePaletteItem[] = useMemo(
    () => [
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
        label: 'Save active',
        icon: <Save size={16} />,
        disabled: !activeDirty,
        onSelect: () => saveActiveGraph(),
        shortcut: 'Ctrl+S',
      },
    ],
    [handleCreateGraph, activeDirty, saveActiveGraph]
  );

  const viewMenuItems = useMemo(
    () => [
      {
        id: 'fit-view',
        label: 'Fit view',
        icon: <Maximize2 size={16} />,
        onSelect: fitViewActive,
      },
      {
        id: 'fit-selection',
        label: 'Fit to selection',
        icon: <Focus size={16} />,
        onSelect: fitSelectionActive,
      },
    ],
    [fitViewActive, fitSelectionActive]
  );

  const stateMenuItems = useMemo(
    () => [
      {
        id: 'workbench',
        label: bottomDrawerOpen ? 'Close workbench' : 'Open workbench',
        icon: <PanelBottom size={16} />,
        onSelect: () => toggleBottomDrawer('dialogue'),
      },
    ],
    [bottomDrawerOpen, toggleBottomDrawer]
  );

  const menubarMenus = useMemo(
    () => [
      { id: 'file', label: 'File', items: fileMenuItems },
      { id: 'view', label: 'View', items: viewMenuItems },
      { id: 'state', label: 'State', items: stateMenuItems },
    ],
    [fileMenuItems, viewMenuItems, stateMenuItems]
  );

  const narrativeNodeCount = narrativeGraph?.flow.nodes.length ?? 0;
  const storyletNodeCount = storyletGraph?.flow.nodes.length ?? 0;
  const totalNodeCount = narrativeNodeCount + storyletNodeCount;

  const toolbarCounts = `${narrativeGraphs.length} narratives | ${storyletGraphs.length} storylets | ${totalNodeCount} nodes`;

  const headerLinks = [
    { label: 'Admin', href: '/admin', icon: <Shield size={14} /> },
    { label: 'API', href: '/api-doc', icon: <Code size={14} /> },
  ];

  const sidebarTabs: PanelTabDef[] = [
    {
      id: 'narratives',
      label: 'Narratives',
      icon: <BookOpen size={12} />,
      content: (
        <ForgeGraphList
          label="Narrative"
          icon={<BookOpen size={12} />}
          graphs={narrativeGraphs}
          activeGraphId={narrativeGraph?.id ?? null}
          onSelect={handleNarrativeSelect}
          onCreate={() => handleCreateGraph('narrative')}
          focusedEditor={activeScope === 'narrative' ? 'narrative' : null}
        />
      ),
      accentColor: GRAPH_META.narrative.accent,
    },
    {
      id: 'storylets',
      label: 'Storylets',
      icon: <Layers size={12} />,
      content: (
        <ForgeGraphList
          label="Storylet"
          icon={<Layers size={12} />}
          graphs={storyletGraphs}
          activeGraphId={storyletGraph?.id ?? null}
          onSelect={handleStoryletSelect}
          onCreate={() => handleCreateGraph('storylet')}
          focusedEditor={activeScope === 'storylet' ? 'storylet' : null}
        />
      ),
      accentColor: GRAPH_META.storylet.accent,
    },
    {
      id: 'nodes',
      label: 'Nodes',
      icon: <Boxes size={12} />,
      content: (
        <NodePalette
          items={nodePaletteItems}
          className="h-full"
          focusedEditor={activeScope}
          categoryLabels={{ dialogue: 'Dialogue', logic: 'Logic' }}
          onItemClick={(item) => {
            openOverlay(CREATE_NODE_OVERLAY_ID, { nodeType: item.dragType });
          }}
        />
      ),
      accentColor: 'var(--status-warning)',
    },
  ];

  const leftPanel = showLeftPanel === false ? undefined : (
    <DockPanel panelId="dialogue-left" title="Library" tabs={sidebarTabs} hideTitleBar className="h-full" />
  );

  const mainContent = (
    <div className="flex h-full w-full flex-col gap-2 p-2">
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
        onFitView={fitViewNarrative}
        onFitSelection={fitSelectionNarrative}
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
        onFitView={fitViewStorylet}
        onFitSelection={fitSelectionStorylet}
      />
    </div>
  );

  const inspectorContent =
    showRightPanel === false ? undefined : (
      <DockPanel panelId="dialogue-right" title="Inspector" hideTitleBar className="h-full">
        <EditorInspector selection={activeSelection} sections={inspectorSections} />
      </DockPanel>
    );

  const isEditorLocked = editorLock.locked || globalLocked === true;
  const mainPanel = (
    <DockPanel
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
    </DockPanel>
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
            <EditorToolbar.Group className="gap-2">
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
                tooltip={link.label}
                className="border-border text-foreground"
              >
                {link.icon}
                <span className="ml-1.5 text-xs">{link.label}</span>
              </EditorToolbar.Button>
            ))}
            {showAgentName !== false && (
              <Badge variant="secondary" className="text-xs">
                Agent: {agentName ?? 'Default'}
              </Badge>
            )}
            <ModelSwitcher />
            <EditorToolbar.Separator />
            <SettingsMenu editorId={editorId} viewportId={viewportId} />
            <EditorToolbar.Button
              onClick={() => toggleBottomDrawer('dialogue')}
              variant="outline"
              size="sm"
              tooltip={bottomDrawerOpen ? 'Close workbench' : 'Open workbench'}
              className="border-0 text-foreground"
            >
              <PanelBottom className="size-3 shrink-0" />
              Workbench
            </EditorToolbar.Button>
            {dirtyByScope.narrative && (
              <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
                Narrative unsaved
              </Badge>
            )}
            {dirtyByScope.storylet && (
              <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
                Storylet unsaved
              </Badge>
            )}
            <EditorToolbar.Button
              onClick={saveActiveGraph}
              disabled={!activeDirty}
              variant="default"
              size="sm"
              tooltip={activeDirty ? 'Save active graph' : 'No changes to save'}
            >
              Save
            </EditorToolbar.Button>
          </EditorToolbar.Right>
        </EditorToolbar>

        <EditorReviewBar
          visible={!!(activeGraph && activeDirty && activePending)}
          onRevert={() => handleRevert(activeScope)}
          onAccept={() => setPendingFromPlan(activeScope, false)}
          label="Pending changes from plan"
        />

        <DockLayout
          left={leftPanel}
          main={mainPanel}
          right={inspectorContent}
          slots={{
            left: { title: 'Library' },
            main: { title: 'Dialogue Graphs' },
            right: { title: 'Inspector' },
          }}
          viewport={{ viewportId, viewportType: 'react-flow' }}
          layoutId="dialogue-mode"
        />

        <Drawer open={drawerOpen} onOpenChange={(open: boolean) => setBottomDrawerOpen('dialogue', open)}>
          <DrawerContent className="max-h-[70vh] min-h-[240px] flex flex-col">
            <DrawerTitle className="sr-only">Workbench</DrawerTitle>
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
