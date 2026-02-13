/**
 * @forge/yarn-converter - Yarn Spinner export/import
 */
import type { ForgeGraphDoc, ForgeReactFlowNode } from '@forge/types';
import { FORGE_GRAPH_KIND } from '@forge/types';
import type { YarnConverterContext, YarnNodeBlock } from './types';
import { defaultRegistry } from './registry';
import { YarnTextBuilder } from './builders/yarn-text-builder';
import { createMinimalContext } from './workspace-context';
import { CharacterHandler } from './handlers/character-handler';
import { PlayerHandler } from './handlers/player-handler';
import { ConditionalHandler } from './handlers/conditional-handler';
import { StoryletHandler } from './handlers/storylet-handler';
import { DetourHandler } from './handlers/detour-handler';
import { FORGE_NODE_TYPE } from '@forge/types';
import { logRuntimeExportDiagnostics, prepareGraphForYarnExport, ensureGraphExportFields } from './utils/runtime-export';

// Register handlers
defaultRegistry.registerHandler(FORGE_NODE_TYPE.CHARACTER, new CharacterHandler());
defaultRegistry.registerHandler(FORGE_NODE_TYPE.PLAYER, new PlayerHandler());
defaultRegistry.registerHandler(FORGE_NODE_TYPE.CONDITIONAL, new ConditionalHandler());
defaultRegistry.registerHandler(FORGE_NODE_TYPE.STORYLET, new StoryletHandler());
defaultRegistry.registerHandler(FORGE_NODE_TYPE.DETOUR, new DetourHandler());

export async function exportToYarn(
  graph: ForgeGraphDoc,
  context?: YarnConverterContext
): Promise<string> {
  const conversionContext = context ?? createMinimalContext();
  const graphWithFields = ensureGraphExportFields(graph);

  let yarn = '';
  const { nodes: exportableNodes, diagnostics } = prepareGraphForYarnExport(graphWithFields);
  logRuntimeExportDiagnostics(graphWithFields, diagnostics);

  for (const node of exportableNodes) {
    if (!node.data?.type) {
      console.warn(`Node ${node.id} has no type, skipping`);
      continue;
    }
    try {
      const handler = defaultRegistry.getHandler(node.data.type);
      const builder = new YarnTextBuilder();
      yarn += await handler.exportNode(node, builder, conversionContext);
    } catch (error) {
      console.error(`Failed to export node ${node.id}:`, error);
    }
  }

  return yarn;
}

export async function importFromYarn(
  yarnContent: string,
  title = 'Imported Dialogue',
  _context?: YarnConverterContext
): Promise<ForgeGraphDoc> {
  const nodeBlocks = parseYarnContent(yarnContent);
  const nodes: ForgeReactFlowNode[] = [];

  for (const block of nodeBlocks) {
    try {
      const nodeType = determineNodeTypeFromYarn(block);
      if (!nodeType) {
        console.warn(`Could not determine node type for block ${block.nodeId}, skipping`);
        continue;
      }
      const handler = defaultRegistry.getHandler(nodeType);
      const node = await handler.importNode(block);
      nodes.push(node);
    } catch (error) {
      console.error(`Failed to import node ${block.nodeId}:`, error);
    }
  }

  const startNodeId = nodes[0]?.id ?? 'start';

  return {
    id: 0,
    project: 0,
    kind: FORGE_GRAPH_KIND.STORYLET,
    title,
    startNodeId,
    endNodeIds: [],
    flow: {
      nodes,
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  } as unknown as ForgeGraphDoc;
}

function parseYarnContent(yarnContent: string): YarnNodeBlock[] {
  const blocks: YarnNodeBlock[] = [];
  yarnContent.split('===').filter((b) => b.trim()).forEach((block) => {
    const titleMatch = block.match(/title:\s*(\S+)/);
    if (!titleMatch) return;
    const nodeId = titleMatch[1];
    const contentStart = block.indexOf('---');
    if (contentStart === -1) return;
    const content = block.slice(contentStart + 3).trim();
    const lines = content.split('\n').filter((l) => l.trim());
    blocks.push({ nodeId, lines, rawContent: content });
  });
  return blocks;
}

function determineNodeTypeFromYarn(block: YarnNodeBlock): (typeof FORGE_NODE_TYPE)[keyof typeof FORGE_NODE_TYPE] | null {
  const hasOptions = block.lines.some((l) => l.trim().startsWith('-> '));
  const hasConditionals = block.lines.some(
    (l) =>
      l.includes(YARN_SYNTAX.IF_COMMAND) ||
      l.includes(YARN_SYNTAX.ELSEIF_COMMAND) ||
      l.includes(YARN_SYNTAX.ELSE_COMMAND)
  );

  if (hasOptions) return FORGE_NODE_TYPE.PLAYER;
  if (hasConditionals && !hasOptions) {
    const conditionalLines = block.lines.filter(
      (l) =>
        l.includes(YARN_SYNTAX.IF_COMMAND) ||
        l.includes(YARN_SYNTAX.ELSEIF_COMMAND) ||
        l.includes(YARN_SYNTAX.ELSE_COMMAND) ||
        l.includes(YARN_SYNTAX.ENDIF_COMMAND)
    );
    if (conditionalLines.length > block.lines.length / 2) {
      return FORGE_NODE_TYPE.CONDITIONAL;
    }
  }
  return FORGE_NODE_TYPE.CHARACTER;
}

const YARN_SYNTAX = {
  IF_COMMAND: '<<if ',
  ELSEIF_COMMAND: '<<elseif ',
  ELSE_COMMAND: '<<else>>',
  ENDIF_COMMAND: '<<endif>>',
};

export type { YarnConverterContext };
export { createPayloadGraphContext, createMinimalContext } from './workspace-context';
export { defaultRegistry } from './registry';
export { YarnTextBuilder } from './builders/yarn-text-builder';
export { NodeBlockBuilder } from './builders/node-block-builder';
export { CONDITION_BLOCK_TYPE, type ConditionBlockType } from './constants';
