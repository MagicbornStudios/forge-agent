/**
 * Character Node Handler
 */
import { BaseNodeHandler } from './base-handler';
import { NodeBlockBuilder } from '../builders/node-block-builder';
import type { ForgeReactFlowNode, ForgeNodeType, ForgeNode } from '@forge/types';
import type { YarnConverterContext, YarnNodeBlock, YarnTextBuilder } from '../types';
import { FORGE_NODE_TYPE } from '@forge/types';
import { removeSetCommands, extractSetCommands } from '../utils/content-formatter';
import { parseCondition } from '../utils/condition-parser';
import { CONDITION_BLOCK_TYPE } from '../constants';

export class CharacterHandler extends BaseNodeHandler {
  canHandle(nodeType: ForgeNodeType): boolean {
    return nodeType === FORGE_NODE_TYPE.CHARACTER;
  }

  async exportNode(
    node: ForgeReactFlowNode,
    builder: YarnTextBuilder,
    _context?: YarnConverterContext
  ): Promise<string> {
    const data = this.getNodeData(node);
    const blockBuilder = new NodeBlockBuilder(node.id || 'unknown');
    blockBuilder.startNode();

    if (data.conditionalBlocks && data.conditionalBlocks.length > 0) {
      blockBuilder.addConditionalBlocks(data.conditionalBlocks);
    } else {
      const content = data.content ?? '';
      blockBuilder.addContent(removeSetCommands(content), data.speaker);
    }

    const setCommands = data.content ? extractSetCommands(data.content) : [];
    if (setCommands.length === 0 && data.setFlags?.length) {
      blockBuilder.addFlags(data.setFlags);
    }

    if (data.defaultNextNodeId) {
      blockBuilder.addNextNode(data.defaultNextNodeId);
    }

    return blockBuilder.endNode();
  }

  async importNode(yarnBlock: YarnNodeBlock, _context?: YarnConverterContext): Promise<ForgeReactFlowNode> {
    const lines = yarnBlock.lines;
    let dialogueContent = '';
    let speaker = '';
    const setFlags: string[] = [];
    let nextNodeId = '';
    const conditionalBlocks: Array<Record<string, unknown>> = [];
    let inConditionalBlock = false;
    let currentBlock: Record<string, unknown> | null = null;
    let blockContent: string[] = [];
    let blockSpeaker = '';

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('<<jump')) {
        const m = trimmed.match(/<<jump\s+(\S+)>>/);
        if (m) nextNodeId = m[1];
      } else if (trimmed.startsWith('<<set')) {
        const m = trimmed.match(/<<set\s+\$(\w+)/);
        if (m) setFlags.push(m[1]);
      } else if (trimmed.startsWith('<<if')) {
        if (inConditionalBlock && currentBlock) {
          currentBlock.content = blockContent.join('\n').trim();
          currentBlock.speaker = blockSpeaker || undefined;
          conditionalBlocks.push(currentBlock);
        }
        inConditionalBlock = true;
        const condStr = trimmed.replace(/<<if\s+/, '').replace(/>>/, '').trim();
        currentBlock = {
          id: `block_${Date.now()}_${conditionalBlocks.length}`,
          type: CONDITION_BLOCK_TYPE.IF,
          condition: parseCondition(condStr),
          content: '',
        };
        blockContent = [];
        blockSpeaker = '';
      } else if (trimmed.startsWith('<<elseif')) {
        if (currentBlock) {
          currentBlock.content = blockContent.join('\n').trim();
          currentBlock.speaker = blockSpeaker || undefined;
          conditionalBlocks.push(currentBlock);
        }
        const condStr = trimmed.replace(/<<elseif\s+/, '').replace(/>>/, '').trim();
        currentBlock = {
          id: `block_${Date.now()}_${conditionalBlocks.length}`,
          type: CONDITION_BLOCK_TYPE.ELSEIF,
          condition: parseCondition(condStr),
          content: '',
        };
        blockContent = [];
        blockSpeaker = '';
      } else if (trimmed.startsWith('<<else')) {
        if (currentBlock) {
          currentBlock.content = blockContent.join('\n').trim();
          currentBlock.speaker = blockSpeaker || undefined;
          conditionalBlocks.push(currentBlock);
        }
        currentBlock = {
          id: `block_${Date.now()}_${conditionalBlocks.length}`,
          type: CONDITION_BLOCK_TYPE.ELSE,
          condition: undefined,
          content: '',
        };
        blockContent = [];
        blockSpeaker = '';
      } else if (trimmed.startsWith('<<endif')) {
        if (currentBlock) {
          currentBlock.content = blockContent.join('\n').trim();
          currentBlock.speaker = blockSpeaker || undefined;
          conditionalBlocks.push(currentBlock);
          inConditionalBlock = false;
          currentBlock = null;
          blockContent = [];
          blockSpeaker = '';
        }
      } else if (inConditionalBlock) {
        if (trimmed.includes(':') && !trimmed.startsWith('<<')) {
          const [spk, ...rest] = trimmed.split(':');
          blockSpeaker = spk.trim();
          blockContent.push(rest.join(':').trim());
        } else if (!trimmed.startsWith('<<')) {
          blockContent.push(trimmed);
        }
      } else if (trimmed.includes(':') && !trimmed.startsWith('<<')) {
        const [spk, ...rest] = trimmed.split(':');
        speaker = spk.trim();
        dialogueContent += rest.join(':').trim() + '\n';
      } else if (!trimmed.startsWith('<<')) {
        dialogueContent += trimmed + '\n';
      }
    });

    const nodeData: ForgeNode = {
      id: yarnBlock.nodeId,
      type: FORGE_NODE_TYPE.CHARACTER,
      speaker: speaker || undefined,
      content: dialogueContent.trim(),
      defaultNextNodeId: nextNodeId || undefined,
      setFlags: setFlags.length > 0 ? setFlags : undefined,
      conditionalBlocks:
        conditionalBlocks.length > 0 ? (conditionalBlocks as ForgeNode['conditionalBlocks']) : undefined,
    };

    return {
      id: yarnBlock.nodeId,
      type: FORGE_NODE_TYPE.CHARACTER,
      position: { x: 0, y: 0 },
      data: nodeData,
    };
  }
}
