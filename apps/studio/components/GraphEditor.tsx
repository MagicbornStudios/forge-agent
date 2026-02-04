'use client';

import { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type ReactFlowInstance,
  type FitViewOptions,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '@/lib/store';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { CharacterNode } from './nodes/CharacterNode';
import { PlayerNode } from './nodes/PlayerNode';
import { ConditionalNode } from './nodes/ConditionalNode';
import { FlowBackground, FlowControls, FlowMiniMap, FlowPanel } from './forge';

const nodeTypes = {
  character: CharacterNode,
  player: PlayerNode,
  conditional: ConditionalNode,
};

const AI_NODE_HIGHLIGHT_CLASS = 'ring-2 ring-amber-400 ring-offset-2';
const AI_EDGE_HIGHLIGHT_CLASS = 'stroke-amber-400 stroke-2';

export interface ForgeViewportHandle {
  fitView: (options?: FitViewOptions) => boolean;
  fitViewToNodes: (nodeIds: string[]) => boolean;
  getNode: (id: string) => ReturnType<ReactFlowInstance['getNode']>;
}

export interface AIHighlightIds {
  nodeIds: string[];
  edgeIds: string[];
}

export interface GraphEditorProps {
  selectedNodeIds?: string[];
  selectedEdgeIds?: string[];
  /** @deprecated Use `isHighlighted` callback instead. */
  aiHighlightIds?: AIHighlightIds;
  /** Callback to check if an entity is highlighted by the AI. */
  isHighlighted?: (entityType: string, id: string) => boolean;
  onSelectionChange?: (selectedNodeIds: string[], selectedEdgeIds: string[]) => void;
  onViewportReady?: (handle: ForgeViewportHandle) => void;
  onRequestCreateNode?: () => void;
}

export function GraphEditor({
  selectedNodeIds = [],
  selectedEdgeIds = [],
  aiHighlightIds = { nodeIds: [], edgeIds: [] },
  isHighlighted,
  onSelectionChange,
  onViewportReady,
  onRequestCreateNode,
}: GraphEditorProps) {
  const { graph, applyOperations } = useGraphStore();
  const viewportRef = useRef<ReactFlowInstance | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!graph) return;

      applyNodeChanges(changes, graph.flow.nodes);

      const moveOps = changes
        .filter((change): change is NodeChange & { type: 'position'; id: string; position: { x: number; y: number }; dragging?: boolean } =>
          change.type === 'position' &&
          !!(change as { position?: { x: number; y: number }; dragging?: boolean }).position &&
          !(change as { dragging?: boolean }).dragging
        )
        .map((change) => ({
          type: 'moveNode' as const,
          nodeId: change.id,
          position: change.position,
        }));

      if (moveOps.length > 0) {
        applyOperations(moveOps);
      }
    },
    [graph, applyOperations]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!graph) return;

      applyEdgeChanges(changes, graph.flow.edges);

      const deleteOps = changes
        .filter((change) => change.type === 'remove')
        .map((change: EdgeChange & { id: string }) => ({
          type: 'deleteEdge' as const,
          edgeId: change.id,
        }));

      if (deleteOps.length > 0) {
        applyOperations(deleteOps);
      }
    },
    [graph, applyOperations]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      applyOperations([
        {
          type: 'createEdge',
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle ?? undefined,
          targetHandle: connection.targetHandle ?? undefined,
        },
      ]);
    },
    [applyOperations]
  );

  const handleSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: { id: string; selected?: boolean }[]; edges: { id: string; selected?: boolean }[] }) => {
      const selectedNodes = nodes.filter((n) => n.selected);
      const selectedEdges = edges.filter((e) => e.selected);
      onSelectionChange?.(
        selectedNodes.map((n) => n.id),
        selectedEdges.map((e) => e.id)
      );
    },
    [onSelectionChange]
  );

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      viewportRef.current = instance;
      onViewportReady?.({
        fitView: (opts) => instance.fitView(opts),
        fitViewToNodes: (nodeIds) => {
          if (nodeIds.length === 0) return instance.fitView();
          return instance.fitView({ nodes: nodeIds.map((id) => ({ id })), padding: 0.2 });
        },
        getNode: (id) => instance.getNode(id),
      });
    },
    [onViewportReady]
  );

  const hasSelection = selectedNodeIds.length > 0 || selectedEdgeIds.length > 0;
  const selectionNodeIds = useMemo(() => {
    if (selectedNodeIds.length > 0) return selectedNodeIds;
    if (!graph || selectedEdgeIds.length === 0) return [];
    const ids = selectedEdgeIds.flatMap((edgeId) => {
      const edge = graph.flow.edges.find((item) => item.id === edgeId);
      return edge ? [edge.source, edge.target] : [];
    });
    return Array.from(new Set(ids));
  }, [graph, selectedEdgeIds, selectedNodeIds]);

  const handleFitView = useCallback(() => {
    viewportRef.current?.fitView();
  }, []);

  const handleFitSelection = useCallback(() => {
    const instance = viewportRef.current;
    if (!instance) return;
    if (selectionNodeIds.length === 0) {
      instance.fitView();
      return;
    }
    instance.fitView({ nodes: selectionNodeIds.map((id) => ({ id })), padding: 0.2 });
  }, [selectionNodeIds]);

  const handleClearSelection = useCallback(() => {
    onSelectionChange?.([], []);
  }, [onSelectionChange]);

  if (!graph) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No graph loaded
      </div>
    );
  }

  const nodes = graph.flow.nodes.map((n) => ({
    ...n,
    selected: selectedNodeIds.includes(n.id),
    className:
      (isHighlighted?.('forge.node', n.id) ?? aiHighlightIds.nodeIds.includes(n.id))
        ? AI_NODE_HIGHLIGHT_CLASS
        : undefined,
  }));
  const edges = graph.flow.edges.map((e) => ({
    ...e,
    selected: selectedEdgeIds.includes(e.id),
    className:
      (isHighlighted?.('forge.edge', e.id) ?? aiHighlightIds.edgeIds.includes(e.id))
        ? AI_EDGE_HIGHLIGHT_CLASS
        : undefined,
  }));

  return (
    <div className="h-full w-full">
      <ContextMenu>
        <ContextMenuTrigger className="h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={handleSelectionChange}
            onInit={handleInit}
            nodeTypes={nodeTypes}
            fitView
          >
            <FlowBackground />
            <FlowControls />
            <FlowMiniMap />
            <FlowPanel position="top-left">
              <span className="text-xs text-muted-foreground">Forge editor</span>
            </FlowPanel>
          </ReactFlow>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem
            disabled={!onRequestCreateNode}
            onSelect={() => onRequestCreateNode?.()}
          >
            Add node
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={handleFitView}>Fit view</ContextMenuItem>
          <ContextMenuItem disabled={!hasSelection} onSelect={handleFitSelection}>
            Fit to selection
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem disabled={!hasSelection} onSelect={handleClearSelection}>
            Clear selection
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
