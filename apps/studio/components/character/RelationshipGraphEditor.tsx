'use client';

import React, { useCallback, useImperativeHandle, useMemo, useRef, forwardRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type OnSelectionChangeParams,
  type ReactFlowInstance,
  type FitViewOptions,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CharacterCardNode } from './CharacterCardNode';
import { RelationshipEdge } from './RelationshipEdge';
import { computeCircularLayout, getInitials, resolveRelId } from '@/lib/domains/character/operations';
import type { CharacterDoc, RelationshipDoc, CharacterCardNodeData, RelationshipEdgeData } from '@/lib/domains/character/types';

// ---------------------------------------------------------------------------
// Node / edge type registries (stable references)
// ---------------------------------------------------------------------------

const nodeTypes = { characterCard: CharacterCardNode };
const edgeTypes = { relationship: RelationshipEdge };

// ---------------------------------------------------------------------------
// Viewport handle
// ---------------------------------------------------------------------------

export interface CharacterViewportHandle {
  fitView: (options?: FitViewOptions) => void;
  fitViewToNodes: (nodeIds: string[]) => void;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  characters: CharacterDoc[];
  relationships: RelationshipDoc[];
  activeCharacterId: number | null;
  isHighlighted?: (entityType: string, id: string) => boolean;
  onCharacterSelect: (id: number | null) => void;
  onRelationshipSelect: (id: number | null) => void;
  /** Called when the user drags a new edge between two character nodes. */
  onConnect: (sourceId: number, targetId: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const RelationshipGraphEditor = forwardRef<CharacterViewportHandle, Props>(
  function RelationshipGraphEditor(props, ref) {
    const {
      characters,
      relationships,
      activeCharacterId,
      isHighlighted,
      onCharacterSelect,
      onRelationshipSelect,
      onConnect,
    } = props;

    const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

    // ----- Derive nodes from characters + layout algorithm -----------------
    const positions = useMemo(
      () => computeCircularLayout(characters, activeCharacterId),
      [characters, activeCharacterId],
    );

    const derivedNodes = useMemo<Node<CharacterCardNodeData>[]>(
      () =>
        characters.map((char) => {
          const pos = positions.get(char.id) ?? { x: 0, y: 0 };
          const highlighted = isHighlighted?.('character.node', String(char.id));
          return {
            id: String(char.id),
            type: 'characterCard',
            position: pos,
            data: {
              characterId: char.id,
              name: char.name,
              subtitle: char.description?.slice(0, 60) ?? undefined,
              imageUrl: char.imageUrl,
              initials: getInitials(char.name),
              isActive: char.id === activeCharacterId,
            },
            className: highlighted ? 'ring-2 ring-amber-400 ring-offset-2' : undefined,
          };
        }),
      [characters, positions, activeCharacterId, isHighlighted],
    );

    const derivedEdges = useMemo<Edge<RelationshipEdgeData>[]>(
      () =>
        relationships.map((rel) => {
          const highlighted = isHighlighted?.('character.relationship', String(rel.id));
          return {
            id: String(rel.id),
            type: 'relationship',
            source: String(resolveRelId(rel.sourceCharacter)),
            target: String(resolveRelId(rel.targetCharacter)),
            data: {
              relationshipId: rel.id,
              label: rel.label,
              description: rel.description ?? undefined,
            },
            className: highlighted ? 'stroke-amber-400' : undefined,
          };
        }),
      [relationships, isHighlighted],
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(derivedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(derivedEdges);

    // Sync derived data → React Flow state when characters/relationships change.
    React.useEffect(() => {
      setNodes(derivedNodes);
    }, [derivedNodes, setNodes]);

    React.useEffect(() => {
      setEdges(derivedEdges);
    }, [derivedEdges, setEdges]);

    // ----- Selection -------------------------------------------------------
    const handleSelectionChange = useCallback(
      ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
        if (selectedNodes.length === 1) {
          onCharacterSelect(Number(selectedNodes[0].id));
          onRelationshipSelect(null);
        } else if (selectedEdges.length === 1) {
          onRelationshipSelect(Number(selectedEdges[0].id));
          onCharacterSelect(null);
        } else {
          onCharacterSelect(null);
          onRelationshipSelect(null);
        }
      },
      [onCharacterSelect, onRelationshipSelect],
    );

    // ----- Connect ---------------------------------------------------------
    const handleConnect = useCallback(
      (connection: Connection) => {
        if (connection.source && connection.target) {
          onConnect(Number(connection.source), Number(connection.target));
        }
      },
      [onConnect],
    );

    // ----- Viewport handle -------------------------------------------------
    useImperativeHandle(ref, () => ({
      fitView: (options) => rfInstanceRef.current?.fitView(options),
      fitViewToNodes: (nodeIds) => {
        rfInstanceRef.current?.fitView({ nodes: nodeIds.map((id) => ({ id })), padding: 0.3 });
      },
    }));

    const handleInit = useCallback((instance: ReactFlowInstance) => {
      rfInstanceRef.current = instance;
      setTimeout(() => instance.fitView({ padding: 0.2 }), 100);
    }, []);

    return (
      <div className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onSelectionChange={handleSelectionChange}
          onInit={handleInit}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-muted/30"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="!bg-background !border"
          />
        </ReactFlow>
      </div>
    );
  },
);
