/**
 * Detour Node Handler - inlines referenced graphs with return
 */
import { BaseNodeHandler } from './base-handler';
import { NodeBlockBuilder } from '../builders/node-block-builder';
import type { ForgeReactFlowNode, ForgeNodeType, ForgeGraphDoc, ForgeNode } from '@forge/types';
import type { YarnConverterContext, YarnNodeBlock, YarnTextBuilder } from '../types';
import { FORGE_NODE_TYPE } from '@forge/types';
import { defaultRegistry } from '../registry';
import {
  logRuntimeExportDiagnostics,
  prepareGraphForYarnExport,
  ensureGraphExportFields,
} from '../utils/runtime-export';

export class DetourHandler extends BaseNodeHandler {
  canHandle(nodeType: ForgeNodeType): boolean {
    return nodeType === FORGE_NODE_TYPE.DETOUR;
  }

  async exportNode(
    node: ForgeReactFlowNode,
    builder: YarnTextBuilder,
    context?: YarnConverterContext
  ): Promise<string> {
    const data = this.getNodeData(node);

    if (!data.storyletCall) {
      const blockBuilder = new NodeBlockBuilder(node.id || 'unknown');
      blockBuilder.startNode();
      if (data.content) blockBuilder.addContent(data.content, data.speaker);
      return blockBuilder.endNode();
    }

    const targetGraphId = data.storyletCall.targetGraphId;
    const targetStartNodeId = data.storyletCall.targetStartNodeId;
    const returnNodeId = data.storyletCall.returnNodeId;
    const returnGraphId = data.storyletCall.returnGraphId;

    if (context?.visitedGraphs?.has(targetGraphId)) {
      console.warn(`Circular reference: graph ${targetGraphId} already visited`);
      const blockBuilder = new NodeBlockBuilder(node.id || 'unknown');
      blockBuilder.startNode();
      blockBuilder.addContent(`[Detour: ${targetGraphId}]`, data.speaker);
      blockBuilder.addNextNode(targetStartNodeId ?? `detour_${targetGraphId}_start`);
      return blockBuilder.endNode();
    }

    context?.visitedGraphs?.add(targetGraphId);

    try {
      let referencedGraph: ForgeGraphDoc | undefined;
      if (context?.getGraphFromCache) {
        referencedGraph = context.getGraphFromCache(targetGraphId);
      }
      if (!referencedGraph && context?.ensureGraph) {
        referencedGraph = await context.ensureGraph(targetGraphId);
      }
      if (!referencedGraph) {
        throw new Error(`Could not load referenced graph ${targetGraphId}`);
      }

      const graphWithFields = ensureGraphExportFields(referencedGraph);
      const startNodeId = targetStartNodeId ?? graphWithFields.startNodeId;
      const endNodeIds = graphWithFields.endNodeIds ?? [];

      const blockBuilder = new NodeBlockBuilder(node.id || 'unknown');
      blockBuilder.startNode();
      if (data.content) blockBuilder.addContent(data.content, data.speaker);
      if (startNodeId) blockBuilder.addNextNode(startNodeId);

      const detourNodeText = blockBuilder.endNode();
      const referencedNodesText = await this.exportReferencedGraph(
        graphWithFields,
        context,
        returnNodeId,
        returnGraphId,
        endNodeIds
      );

      return detourNodeText + referencedNodesText;
    } catch (error) {
      console.error(`Failed to export detour node ${node.id}:`, error);
      const blockBuilder = new NodeBlockBuilder(node.id || 'unknown');
      blockBuilder.startNode();
      blockBuilder.addContent(`[Detour: ${targetGraphId} - Error loading]`, data.speaker);
      return blockBuilder.endNode();
    } finally {
      context?.visitedGraphs?.delete(targetGraphId);
    }
  }

  private async exportReferencedGraph(
    graph: ForgeGraphDoc,
    context?: YarnConverterContext,
    returnNodeId?: string,
    _returnGraphId?: number,
    endNodeIds: Array<{ nodeId: string }> = []
  ): Promise<string> {
    let yarn = '';
    const { nodes: exportableNodes, diagnostics } = prepareGraphForYarnExport(graph);
    logRuntimeExportDiagnostics(graph, diagnostics);

    const endIds = new Set(endNodeIds.map((e) => e.nodeId));

    for (const node of exportableNodes) {
      if (!node.data?.type) continue;
      const handler = defaultRegistry.getHandler(node.data.type);
      const builder = this.createBuilder();
      let nodeText = await handler.exportNode(node, builder, context);

      if (returnNodeId && endIds.has(node.id)) {
        if (nodeText.includes('<<jump')) {
          const lines = nodeText.split('\n');
          let lastJumpIndex = -1;
          for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('<<jump')) {
              lastJumpIndex = i;
              break;
            }
          }
          if (lastJumpIndex >= 0) {
            lines[lastJumpIndex] = `    <<jump ${returnNodeId}>>`;
            nodeText = lines.join('\n');
          }
        } else {
          nodeText = nodeText.replace('===', `    <<jump ${returnNodeId}>>\n===`);
        }
      }

      yarn += nodeText;
    }
    return yarn;
  }

  async importNode(yarnBlock: YarnNodeBlock, _context?: YarnConverterContext): Promise<ForgeReactFlowNode> {
    const lines = yarnBlock.lines;
    let content = '';
    let defaultNextNodeId: string | undefined;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const m = trimmed.match(/<<jump\s+(\S+)>>/);
      if (m) defaultNextNodeId = m[1];
      else content += (content ? '\n' : '') + trimmed;
    }

    const nodeData: ForgeNode = {
      id: yarnBlock.nodeId,
      type: FORGE_NODE_TYPE.DETOUR,
      content: content.trim() || undefined,
      defaultNextNodeId,
    };

    return {
      id: yarnBlock.nodeId,
      type: FORGE_NODE_TYPE.DETOUR,
      position: { x: 0, y: 0 },
      data: nodeData,
    };
  }
}
