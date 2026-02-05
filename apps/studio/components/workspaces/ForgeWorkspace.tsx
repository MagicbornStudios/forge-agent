'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { GraphEditor, type ForgeViewportHandle } from '@/components/GraphEditor';
import { useGraphStore } from '@/lib/store';
import { useSaveGraph } from '@/lib/data/hooks';
import { AiService } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAppShellStore } from '@/lib/app-shell/store';
import { WORKSPACE_EDITOR_IDS } from '@/lib/app-shell/workspace-metadata';
import { useSettingsStore } from '@/lib/settings/store';
import { useAIHighlight } from '@forge/shared/copilot/use-ai-highlight';
import { useDomainCopilot } from '@forge/shared/copilot/use-domain-copilot';
import { useForgeContract } from '@forge/domain-forge/copilot';
import { Card } from '@forge/ui/card';
import { Badge } from '@forge/ui/badge';
import { WorkspaceReviewBar } from '@forge/shared/components/workspace';
import {
  WorkspaceShell,
  WorkspaceHeader,
  WorkspaceToolbar,
  WorkspaceLayoutGrid,
  WorkspaceInspector,
  WorkspaceStatusBar,
  WorkspaceOverlaySurface,
} from '@forge/shared/components/workspace';
import { CreateNodeModal } from '@/components/CreateNodeModal';
import { forgeInspectorSections, ForgeWorkflowPanel, ForgeWorkspaceDrawer } from '@/components/forge';
import { ModelSwitcher } from '@/components/model-switcher';
import { SettingsMenu } from '@/components/settings/SettingsMenu';
import { ForgePlanCard } from '@/components/copilot/ForgePlanCard';
import type { OverlaySpec, ActiveOverlay, Selection } from '@forge/shared/workspace';
import { isEntity } from '@forge/shared/workspace';
import type { ForgeNodeType } from '@forge/types/graph';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';

const CREATE_NODE_OVERLAY_ID = 'create-node';

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

export function ForgeWorkspace() {
  const { graph, applyOperations, isDirty, loadGraph, pendingFromPlan, setPendingFromPlan } = useGraphStore();
  const saveGraphMutation = useSaveGraph();
  const saveGraph = useCallback(() => {
    saveGraphMutation.mutate(undefined, {
      onSuccess: (data: { title?: string } | undefined) => {
        if (data?.title && useSettingsStore.getState().getSettingValue('ui.toastsEnabled') !== false) {
          toast.success('Graph saved', { description: `Saved ${data.title}.` });
        }
      },
      onError: () => {
        if (useSettingsStore.getState().getSettingValue('ui.toastsEnabled') !== false) {
          toast.error('Save failed', { description: 'The server rejected the save request.' });
        }
      },
    });
  }, [saveGraphMutation]);
  const workspaceTheme = useAppShellStore((s) => s.workspaceThemes.forge);
  const bottomDrawerOpen = useAppShellStore((s) => s.bottomDrawerOpen.forge);
  const toggleBottomDrawer = useAppShellStore((s) => s.toggleBottomDrawer);
  const editorId = WORKSPACE_EDITOR_IDS.forge;
  const agentName = useSettingsStore((s) =>
    s.getSettingValue('ai.agentName', { workspaceId: 'forge', editorId })
  ) as string | undefined;
  const showAgentName = useSettingsStore((s) =>
    s.getSettingValue('ai.showAgentName', { workspaceId: 'forge' })
  ) as boolean | undefined;
  const toolsEnabledSetting = useSettingsStore((s) =>
    s.getSettingValue('ai.toolsEnabled', { workspaceId: 'forge', editorId })
  ) as boolean | undefined;
  const entitlements = useEntitlements();
  const toolsEnabled =
    toolsEnabledSetting !== false &&
    entitlements.has(CAPABILITIES.STUDIO_AI_TOOLS) &&
    entitlements.has(CAPABILITIES.FORGE_AI_EDIT);
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const viewportHandleRef = useRef<ForgeViewportHandle | null>(null);

  const forgeSelection = useForgeSelection(selectedNodeIds, selectedEdgeIds, graph);

  const { onAIHighlight, clearHighlights, isHighlighted } = useAIHighlight();

  const openOverlay = useCallback((id: string, payload?: Record<string, unknown>) => {
    setActiveOverlay({ id, payload });
  }, []);
  const dismissOverlay = useCallback(() => setActiveOverlay(null), []);

  const handleSelectionChange = useCallback(
    (nodeIds: string[], edgeIds: string[]) => {
      setSelectedNodeIds(nodeIds);
      setSelectedEdgeIds(edgeIds);
      clearHighlights();
    },
    [clearHighlights],
  );

  const handleViewportReady = useCallback((handle: ForgeViewportHandle) => {
    viewportHandleRef.current = handle;
  }, []);

  const fitView = useCallback(() => {
    viewportHandleRef.current?.fitView();
  }, []);

  const revealSelection = useCallback(() => {
    const handle = viewportHandleRef.current;
    if (!handle) return;
    if (forgeSelection && isEntity(forgeSelection)) {
      if (forgeSelection.entityType === 'forge.node') {
        handle.fitViewToNodes([forgeSelection.id]);
      } else if (forgeSelection.entityType === 'forge.edge' && graph) {
        const edge = graph.flow.edges.find((e) => e.id === forgeSelection.id);
        if (edge) handle.fitViewToNodes([edge.source, edge.target]);
      }
    } else {
      handle.fitView();
    }
  }, [forgeSelection, graph]);

  const createPlanApi = useCallback(async (goal: string, graphSummary: unknown) => {
    return AiService.postApiForgePlan({ goal, graphSummary });
  }, []);

  const commitGraph = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      saveGraphMutation.mutate(undefined, {
        onSuccess: () => resolve(),
        onError: () => reject(new Error('Save failed')),
      });
    });
  }, [saveGraphMutation]);

  const forgeContract = useForgeContract({
    graph,
    selection: forgeSelection,
    isDirty,
    applyOperations,
    openOverlay,
    revealSelection,
    onAIHighlight,
    clearAIHighlights: clearHighlights,
    createNodeOverlayId: CREATE_NODE_OVERLAY_ID,
    createPlanApi,
    setPendingFromPlan,
    commitGraph,
    renderPlan: (props) => <ForgePlanCard {...(props as React.ComponentProps<typeof ForgePlanCard>)} />,
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
              applyOperations([
                { type: 'createNode', nodeType, position, data: { label, content, speaker } },
              ]);
            }}
          />
        ),
      },
    ],
    [applyOperations],
  );

  const workflowSection = useMemo(
    () => ({
      id: 'forge-ai-workflow',
      title: 'AI Workflow',
      when: () => true,
      render: () => (
        <ForgeWorkflowPanel
          graph={graph}
          selection={forgeSelection}
          toolsEnabled={toolsEnabled}
          applyOperations={applyOperations}
          commitGraph={commitGraph}
          onAIHighlight={onAIHighlight}
        />
      ),
    }),
    [applyOperations, commitGraph, forgeSelection, graph, toolsEnabled],
  );

  const inspectorSections = useMemo(
    () => [...forgeInspectorSections({ graph, applyOperations }), workflowSection],
    [graph, applyOperations, workflowSection],
  );

  const mainContent = graph ? (
    <GraphEditor
      selectedNodeIds={selectedNodeIds}
      selectedEdgeIds={selectedEdgeIds}
      isHighlighted={isHighlighted}
      onSelectionChange={handleSelectionChange}
      onViewportReady={handleViewportReady}
      onRequestCreateNode={() => openOverlay(CREATE_NODE_OVERLAY_ID)}
    />
  ) : (
    <div className="flex items-center justify-center h-full">
      <Card className="p-6 max-w-md">
        <h2 className="text-xl font-semibold mb-2">No Graph Loaded</h2>
        <p className="text-muted-foreground">
          Loading your last graph or creating a new one...
        </p>
      </Card>
    </div>
  );

  const inspectorContent = (
    <WorkspaceInspector selection={forgeSelection} sections={inspectorSections} />
  );

  const hasSelection = selectedNodeIds.length > 0 || selectedEdgeIds.length > 0;
  const projectOptions = graph ? [{ value: String(graph.id), label: graph.title }] : [];
  const fileMenuItems = useMemo(
    () => [
      {
        id: 'new',
        label: 'New graph',
        onSelect: () => {
          console.info('[Forge] New graph action not implemented yet.');
        },
      },
      {
        id: 'open',
        label: 'Open graph',
        onSelect: () => {
          console.info('[Forge] Open graph action not implemented yet.');
        },
      },
      { id: 'separator-1', type: 'separator' as const },
      {
        id: 'save',
        label: 'Save',
        disabled: !isDirty,
        onSelect: () => saveGraph(),
        shortcut: 'Ctrl+S',
      },
      {
        id: 'save-as',
        label: 'Save As...',
        onSelect: () => {
          console.info('[Forge] Save As action not implemented yet.');
        },
      },
      { id: 'separator-2', type: 'separator' as const },
      {
        id: 'export',
        label: 'Export',
        onSelect: () => {
          console.info('[Forge] Export action not implemented yet.');
        },
      },
    ],
    [isDirty, saveGraph]
  );
  const editMenuItems = useMemo(
    () => [
      {
        id: 'add-node',
        label: 'Add node',
        onSelect: () => openOverlay(CREATE_NODE_OVERLAY_ID),
      },
      {
        id: 'clear-selection',
        label: 'Clear selection',
        disabled: !hasSelection,
        onSelect: () => handleSelectionChange([], []),
      },
    ],
    [handleSelectionChange, hasSelection, openOverlay]
  );
  const viewMenuItems = useMemo(
    () => [
      {
        id: 'fit-view',
        label: 'Fit view',
        onSelect: fitView,
      },
      {
        id: 'fit-selection',
        label: 'Fit to selection',
        disabled: !hasSelection,
        onSelect: revealSelection,
      },
    ],
    [fitView, hasSelection, revealSelection]
  );
  const menubarMenus = useMemo(
    () => [
      { id: 'file', label: 'File', items: fileMenuItems },
      { id: 'edit', label: 'Edit', items: editMenuItems },
      { id: 'view', label: 'View', items: viewMenuItems },
    ],
    [editMenuItems, fileMenuItems, viewMenuItems]
  );

  return (
    <WorkspaceShell
      workspaceId="forge"
      title="Forge"
      subtitle={graph?.title}
      domain="forge"
      theme={workspaceTheme}
      className="flex flex-col h-full min-h-0 bg-background"
    >
      <WorkspaceHeader>
        <WorkspaceHeader.Left>
          <h1 className="text-lg font-bold">Forge</h1>
        </WorkspaceHeader.Left>
        <WorkspaceHeader.Center>
          {graph && <span className="text-sm text-muted-foreground">{graph.title}</span>}
        </WorkspaceHeader.Center>
      </WorkspaceHeader>

      <WorkspaceToolbar>
        <WorkspaceToolbar.Left>
          <WorkspaceToolbar.Group className="gap-2">
            <WorkspaceToolbar.Menubar menus={menubarMenus} />
            <WorkspaceToolbar.ProjectSelect
              value={graph ? String(graph.id) : undefined}
              options={projectOptions}
              placeholder="Select graph"
              disabled={!graph}
              tooltip="Active graph"
              onValueChange={(value) => loadGraph(Number(value))}
              className="min-w-[180px]"
            />
          </WorkspaceToolbar.Group>
          <span className="text-xs text-muted-foreground">
            {graph ? `Graph: ${graph.title}` : 'No graph loaded'}
          </span>
        </WorkspaceToolbar.Left>
        <WorkspaceToolbar.Right>
          {showAgentName !== false && (
            <Badge variant="secondary" className="text-xs">
              Agent: {agentName ?? 'Default'}
            </Badge>
          )}
          <ModelSwitcher />
          <WorkspaceToolbar.Separator />
          <SettingsMenu workspaceId="forge" editorId={editorId} />
          <WorkspaceToolbar.Button
            onClick={() => toggleBottomDrawer('forge')}
            variant="outline"
            size="sm"
            tooltip={bottomDrawerOpen ? 'Close workbench' : 'Open workbench'}
          >
            Workbench
          </WorkspaceToolbar.Button>
          <WorkspaceToolbar.Button
            onClick={() => openOverlay(CREATE_NODE_OVERLAY_ID)}
            variant="outline"
            size="sm"
            tooltip="Add a node to the graph"
          >
            Add node
          </WorkspaceToolbar.Button>
          {isDirty && (
            <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/50">
              Unsaved changes
            </Badge>
          )}
          <WorkspaceToolbar.Button
            onClick={saveGraph}
            disabled={!isDirty}
            variant="default"
            size="sm"
            tooltip={isDirty ? 'Save graph' : 'No changes to save'}
          >
            Save
          </WorkspaceToolbar.Button>
        </WorkspaceToolbar.Right>
      </WorkspaceToolbar>

      <WorkspaceReviewBar
        visible={!!(isDirty && pendingFromPlan && graph)}
        onRevert={() => graph && loadGraph(graph.id)}
        onAccept={() => setPendingFromPlan(false)}
        label="Pending changes from plan"
      />

      <WorkspaceLayoutGrid
        main={mainContent}
        right={inspectorContent}
        bottom={bottomDrawerOpen ? <ForgeWorkspaceDrawer /> : undefined}
        editor={{ editorId, editorType: 'react-flow' }}
      />

      <WorkspaceStatusBar>
        {isDirty ? 'Unsaved changes' : 'Ready'}
        {forgeSelection && isEntity(forgeSelection) && (
          <span className="ml-2 text-muted-foreground">
            - {forgeSelection.entityType === 'forge.node' ? 'Node' : 'Edge'}: {forgeSelection.id}
          </span>
        )}
      </WorkspaceStatusBar>

      <WorkspaceOverlaySurface
        overlays={overlays}
        activeOverlay={activeOverlay}
        onDismiss={dismissOverlay}
      />
    </WorkspaceShell>
  );
}


