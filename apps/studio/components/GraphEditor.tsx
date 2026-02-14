'use client';

import { useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type ReactFlowInstance,
  type FitViewOptions,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { ForgeGraphDoc, ForgeGraphPatchOp, ForgeNodeType } from '@forge/types/graph';
import { FORGE_NODE_TYPE } from '@forge/types/graph';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@forge/ui/context-menu';
import { cn } from '@forge/ui/lib/utils';
import { CharacterNode } from './nodes/CharacterNode';
import { PlayerNode } from './nodes/PlayerNode';
import { ConditionalNode } from './nodes/ConditionalNode';
import { PageNode } from './nodes/PageNode';
import { FlowBackground } from './forge';

const nodeTypes = {
  character: CharacterNode,
  player: PlayerNode,
  conditional: ConditionalNode,
  page: PageNode,
  CHARACTER: CharacterNode,
  PLAYER: PlayerNode,
  CONDITIONAL: ConditionalNode,
  PAGE: PageNode,
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
  graph: ForgeGraphDoc | null;
  applyOperations: (ops: ForgeGraphPatchOp[]) => void;
  selectedNodeIds?: string[];
  selectedEdgeIds?: string[];
  /** @deprecated Use `isHighlighted` callback instead. */
  aiHighlightIds?: AIHighlightIds;
  /** Callback to check if an entity is highlighted by the AI. */
  isHighlighted?: (entityType: string, id: string) => boolean;
  onSelectionChange?: (selectedNodeIds: string[], selectedEdgeIds: string[]) => void;
  onViewportReady?: (handle: ForgeViewportHandle) => void;
  onRequestCreateNode?: () => void;
  onDropCreateNode?: (nodeType: ForgeNodeType, position: { x: number; y: number }) => void;
  nodeTypes?: Record<string, React.ComponentType<any>>;
  edgeTypes?: Record<string, React.ComponentType<any>>;
  /** Applied to the root wrapper. Use "dialogue-graph-editor" for Dialogue graphs (enables per-type CSS). */
  className?: string;
  children?: React.ReactNode;
  /** Allow dragging nodes. Default true. */
  nodesDraggable?: boolean;
  /** Called when the user clicks the pane (graph background). Use to switch active viewport. */
  onPaneClick?: (event: React.MouseEvent) => void;
  /** Called when user clicks a node. Use to immediately set scope + selection (supplements onSelectionChange). */
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  /** Called when user clicks an edge. Use to immediately set scope + selection. */
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
}

export function GraphEditor({
  graph,
  applyOperations,
  selectedNodeIds = [],
  selectedEdgeIds = [],
  aiHighlightIds = { nodeIds: [], edgeIds: [] },
  isHighlighted,
  onSelectionChange,
  onViewportReady,
  onRequestCreateNode,
  onDropCreateNode,
  nodeTypes: nodeTypesProp,
  edgeTypes: edgeTypesProp,
  className,
  children,
  nodesDraggable = true,
  onPaneClick,
  onNodeClick,
  onEdgeClick,
}: GraphEditorProps) {
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

  const handleClearSelection = useCallback(() => {
    onSelectionChange?.([], []);
  }, [onSelectionChange]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    if (!onDropCreateNode) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, [onDropCreateNode]);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      if (!onDropCreateNode) return;
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/reactflow') as ForgeNodeType;
      if (!nodeType || !Object.values(FORGE_NODE_TYPE).includes(nodeType)) return;
      const instance = viewportRef.current;
      if (!instance) return;
      const position = instance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      onDropCreateNode(nodeType, position);
    },
    [onDropCreateNode]
  );

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
    animated: true,
    className:
      (isHighlighted?.('forge.edge', e.id) ?? aiHighlightIds.edgeIds.includes(e.id))
        ? AI_EDGE_HIGHLIGHT_CLASS
        : undefined,
  }));

  return (
    <div className={cn('h-full w-full', className)}>
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
            nodeTypes={nodeTypesProp ?? nodeTypes}
            edgeTypes={edgeTypesProp}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            nodesDraggable={nodesDraggable}
            onPaneClick={onPaneClick}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            fitView
          >
            <FlowBackground />
            {children}
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
          <ContextMenuItem disabled={!hasSelection} onSelect={handleClearSelection}>
            Clear selection
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
