import { applyPatchOperation, applyPatchOperations } from '@/lib/graph-operations';
import type { ForgeGraphDoc, ForgeGraphPatchOp } from '@/types/graph';
import { FORGE_NODE_TYPE } from '@/types/graph';

describe('Graph Operations', () => {
  const mockGraph: ForgeGraphDoc = {
    id: 1,
    title: 'Test Graph',
    flow: {
      nodes: [
        {
          id: 'node1',
          type: 'character',
          position: { x: 0, y: 0 },
          data: {
            id: 'node1',
            type: FORGE_NODE_TYPE.CHARACTER,
            label: 'Test Node',
            speaker: 'Test Speaker',
            content: 'Test content',
          },
        },
      ],
      edges: [],
    },
  };

  describe('createNode operation', () => {
    it('should add a new node to the graph', () => {
      const operation: ForgeGraphPatchOp = {
        type: 'createNode',
        nodeType: FORGE_NODE_TYPE.CHARACTER,
        position: { x: 100, y: 100 },
        data: {
          label: 'New Node',
          speaker: 'New Speaker',
        },
      };

      const result = applyPatchOperation(mockGraph, operation);

      expect(result.flow.nodes).toHaveLength(2);
      expect(result.flow.nodes[1].position).toEqual({ x: 100, y: 100 });
      expect(result.flow.nodes[1].data.label).toBe('New Node');
      expect(result.flow.nodes[1].data.speaker).toBe('New Speaker');
    });
  });

  describe('updateNode operation', () => {
    it('should update node properties', () => {
      const operation: ForgeGraphPatchOp = {
        type: 'updateNode',
        nodeId: 'node1',
        updates: {
          label: 'Updated Label',
          content: 'Updated content',
        },
      };

      const result = applyPatchOperation(mockGraph, operation);

      expect(result.flow.nodes[0].data.label).toBe('Updated Label');
      expect(result.flow.nodes[0].data.content).toBe('Updated content');
      expect(result.flow.nodes[0].data.speaker).toBe('Test Speaker'); // unchanged
    });
  });

  describe('deleteNode operation', () => {
    it('should remove a node from the graph', () => {
      const operation: ForgeGraphPatchOp = {
        type: 'deleteNode',
        nodeId: 'node1',
      };

      const result = applyPatchOperation(mockGraph, operation);

      expect(result.flow.nodes).toHaveLength(0);
    });

    it('should remove connected edges when deleting a node', () => {
      const graphWithEdge: ForgeGraphDoc = {
        ...mockGraph,
        flow: {
          ...mockGraph.flow,
          nodes: [
            ...mockGraph.flow.nodes,
            {
              id: 'node2',
              type: 'character',
              position: { x: 200, y: 200 },
              data: {
                id: 'node2',
                type: FORGE_NODE_TYPE.CHARACTER,
                label: 'Node 2',
              },
            },
          ],
          edges: [
            {
              id: 'edge1',
              source: 'node1',
              target: 'node2',
            },
          ],
        },
      };

      const operation: ForgeGraphPatchOp = {
        type: 'deleteNode',
        nodeId: 'node1',
      };

      const result = applyPatchOperation(graphWithEdge, operation);

      expect(result.flow.nodes).toHaveLength(1);
      expect(result.flow.edges).toHaveLength(0);
    });
  });

  describe('createEdge operation', () => {
    it('should add a new edge to the graph', () => {
      const graphWithTwoNodes: ForgeGraphDoc = {
        ...mockGraph,
        flow: {
          ...mockGraph.flow,
          nodes: [
            ...mockGraph.flow.nodes,
            {
              id: 'node2',
              type: 'character',
              position: { x: 200, y: 200 },
              data: {
                id: 'node2',
                type: FORGE_NODE_TYPE.CHARACTER,
                label: 'Node 2',
              },
            },
          ],
        },
      };

      const operation: ForgeGraphPatchOp = {
        type: 'createEdge',
        source: 'node1',
        target: 'node2',
      };

      const result = applyPatchOperation(graphWithTwoNodes, operation);

      expect(result.flow.edges).toHaveLength(1);
      expect(result.flow.edges[0].source).toBe('node1');
      expect(result.flow.edges[0].target).toBe('node2');
    });
  });

  describe('deleteEdge operation', () => {
    it('should remove an edge from the graph', () => {
      const graphWithEdge: ForgeGraphDoc = {
        ...mockGraph,
        flow: {
          ...mockGraph.flow,
          edges: [
            {
              id: 'edge1',
              source: 'node1',
              target: 'node2',
            },
          ],
        },
      };

      const operation: ForgeGraphPatchOp = {
        type: 'deleteEdge',
        edgeId: 'edge1',
      };

      const result = applyPatchOperation(graphWithEdge, operation);

      expect(result.flow.edges).toHaveLength(0);
    });
  });

  describe('applyPatchOperations', () => {
    it('should apply multiple operations in sequence', () => {
      const operations: ForgeGraphPatchOp[] = [
        {
          type: 'createNode',
          nodeType: FORGE_NODE_TYPE.PLAYER,
          position: { x: 100, y: 100 },
          data: { label: 'Player Node' },
        },
        {
          type: 'createNode',
          nodeType: FORGE_NODE_TYPE.CHARACTER,
          position: { x: 200, y: 200 },
          data: { label: 'Character Node' },
        },
        {
          type: 'updateNode',
          nodeId: 'node1',
          updates: { label: 'Updated Original' },
        },
      ];

      const result = applyPatchOperations(mockGraph, operations);

      expect(result.flow.nodes).toHaveLength(3);
      expect(result.flow.nodes[0].data.label).toBe('Updated Original');
      expect(result.flow.nodes[1].data.label).toBe('Player Node');
      expect(result.flow.nodes[2].data.label).toBe('Character Node');
    });
  });
});
