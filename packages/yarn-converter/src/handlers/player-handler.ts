/**
 * Player Node Handler
 */
import { BaseNodeHandler } from './base-handler';
import { NodeBlockBuilder } from '../builders/node-block-builder';
import type { ForgeReactFlowNode, ForgeNodeType, ForgeNode, ForgeChoice } from '@forge/types';
import type { YarnConverterContext, YarnNodeBlock, YarnTextBuilder } from '../types';
import { FORGE_NODE_TYPE } from '@forge/types';
import { parseCondition } from '../utils/condition-parser';
import { extractSetCommands } from '../utils/content-formatter';

export class PlayerHandler extends BaseNodeHandler {
  canHandle(nodeType: ForgeNodeType): boolean {
    return nodeType === FORGE_NODE_TYPE.PLAYER;
  }

  async exportNode(
    node: ForgeReactFlowNode,
    builder: YarnTextBuilder,
    _context?: YarnConverterContext
  ): Promise<string> {
    const data = this.getNodeData(node);
    const blockBuilder = new NodeBlockBuilder(node.id || 'unknown');
    blockBuilder.startNode();
    if (data.choices && data.choices.length > 0) {
      blockBuilder.addChoices(data.choices);
    }
    return blockBuilder.endNode();
  }

  async importNode(yarnBlock: YarnNodeBlock, _context?: YarnConverterContext): Promise<ForgeReactFlowNode> {
    const lines = yarnBlock.lines;
    const choices: ForgeChoice[] = [];
    let inConditionalChoice = false;
    let currentChoiceCondition: ReturnType<typeof parseCondition> = [];
    let currentChoice: ForgeChoice | null = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('->')) {
        const choiceText = trimmed.slice(2).trim();
        const setCommands = extractSetCommands(choiceText);
        let cleanText = choiceText;
        if (setCommands.length > 0) {
          setCommands.forEach((cmd) => {
            cleanText = cleanText.replace(cmd, '').trim();
          });
        }
        currentChoice = {
          id: `c_${Date.now()}_${choices.length}`,
          text: cleanText,
          nextNodeId: '',
          conditions: inConditionalChoice && currentChoiceCondition.length > 0 ? currentChoiceCondition : undefined,
          setFlags:
            setCommands.length > 0
              ? setCommands
                  .map((cmd) => {
                    const m = cmd.match(/<<set\s+\$(\w+)/);
                    return m ? m[1] : '';
                  })
                  .filter(Boolean)
              : undefined,
        };
        choices.push(currentChoice);
        inConditionalChoice = false;
        currentChoiceCondition = [];
      } else if (trimmed.startsWith('<<jump')) {
        const m = trimmed.match(/<<jump\s+(\S+)>>/);
        if (m && currentChoice) currentChoice.nextNodeId = m[1];
      } else if (trimmed.startsWith('<<set')) {
        const m = trimmed.match(/<<set\s+\$(\w+)/);
        if (m && currentChoice) {
          if (!currentChoice.setFlags) currentChoice.setFlags = [];
          currentChoice.setFlags.push(m[1]);
        }
      } else if (trimmed.startsWith('<<if')) {
        const condStr = trimmed.replace(/<<if\s+/, '').replace(/>>/, '').trim();
        currentChoiceCondition = parseCondition(condStr);
        inConditionalChoice = true;
      } else if (trimmed.startsWith('<<endif')) {
        inConditionalChoice = false;
        currentChoiceCondition = [];
      }
    });

    const nodeData: ForgeNode = {
      id: yarnBlock.nodeId,
      type: FORGE_NODE_TYPE.PLAYER,
      choices: choices.length > 0 ? choices : undefined,
    };

    return {
      id: yarnBlock.nodeId,
      type: FORGE_NODE_TYPE.PLAYER,
      position: { x: 0, y: 0 },
      data: nodeData,
    };
  }
}
