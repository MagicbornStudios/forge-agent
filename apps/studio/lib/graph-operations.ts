import type { ForgeGraphDoc, ForgeGraphPatchOp, ForgeReactFlowNode, ForgeReactFlowEdge } from '@forge/types/graph';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function applyPatchOperation(
  graph: ForgeGraphDoc,
  operation: ForgeGraphPatchOp
): ForgeGraphDoc {
  const newGraph = deepClone(graph);

  switch (operation.type) {
    case 'createNode': {
      const nodeId = operation.id ?? `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newNode: ForgeReactFlowNode = {
        id: nodeId,
        type: operation.nodeType.toLowerCase(),
        position: operation.position,
        data: {
          id: nodeId,
          type: operation.nodeType,
          label: operation.data?.label || `New ${operation.nodeType} Node`,
          ...operation.data,
        },
      };
      newGraph.flow.nodes.push(newNode);
      break;
    }

    case 'deleteNode': {
      newGraph.flow.nodes = newGraph.flow.nodes.filter((n) => n.id !== operation.nodeId);
      // Also remove connected edges
      newGraph.flow.edges = newGraph.flow.edges.filter(
        (e) => e.source !== operation.nodeId && e.target !== operation.nodeId
      );
      break;
    }

    case 'updateNode': {
      const nodeIndex = newGraph.flow.nodes.findIndex((n) => n.id === operation.nodeId);
      if (nodeIndex >= 0) {
        newGraph.flow.nodes[nodeIndex] = {
          ...newGraph.flow.nodes[nodeIndex],
          data: {
            ...newGraph.flow.nodes[nodeIndex].data,
            ...operation.updates,
          },
        };
      }
      break;
    }

    case 'moveNode': {
      const nodeIndex = newGraph.flow.nodes.findIndex((n) => n.id === operation.nodeId);
      if (nodeIndex >= 0) {
        newGraph.flow.nodes[nodeIndex].position = operation.position;
      }
      break;
    }

    case 'createEdge': {
      const newEdge: ForgeReactFlowEdge = {
        id: `edge_${operation.source}_${operation.target}_${Date.now()}`,
        source: operation.source,
        target: operation.target,
        sourceHandle: operation.sourceHandle,
        targetHandle: operation.targetHandle,
      };
      newGraph.flow.edges.push(newEdge);
      break;
    }

    case 'deleteEdge': {
      newGraph.flow.edges = newGraph.flow.edges.filter((e) => e.id !== operation.edgeId);
      break;
    }
  }

  return newGraph;
}

export function applyPatchOperations(
  graph: ForgeGraphDoc,
  operations: ForgeGraphPatchOp[]
): ForgeGraphDoc {
  let result = graph;
  for (const operation of operations) {
    result = applyPatchOperation(result, operation);
  }
  return result;
}

