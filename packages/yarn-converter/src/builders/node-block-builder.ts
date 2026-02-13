/**
 * Node Block Builder - builds complete Yarn node blocks
 */
import { YarnTextBuilder } from './yarn-text-builder';
import type { ForgeConditionalBlock, ForgeChoice } from '@forge/types';
import { formatConditions } from '../utils/condition-formatter';
import { extractSetCommands } from '../utils/content-formatter';
import { CONDITION_BLOCK_TYPE } from '../constants';

export class NodeBlockBuilder {
  private builder: YarnTextBuilder;

  constructor(private nodeId: string) {
    this.builder = new YarnTextBuilder();
  }

  startNode(): this {
    this.builder.addNodeTitle(this.nodeId);
    this.builder.addNodeSeparator();
    return this;
  }

  addContent(content: string, speaker?: string): this {
    const setCommands = extractSetCommands(content);
    let cleanContent = content;
    if (setCommands.length > 0) {
      setCommands.forEach((cmd) => {
        cleanContent = cleanContent.replace(cmd, '').trim();
      });
    }
    if (cleanContent) {
      this.builder.addLine(cleanContent, speaker);
    }
    if (setCommands.length > 0) {
      setCommands.forEach((cmd) => {
        this.builder.addRaw(cmd + '\n');
      });
    }
    return this;
  }

  addConditionalBlocks(blocks: ForgeConditionalBlock[]): this {
    blocks.forEach((block) => {
      if (block.type === CONDITION_BLOCK_TYPE.IF || block.type === CONDITION_BLOCK_TYPE.ELSEIF) {
        const conditionStr = block.condition ? formatConditions(block.condition) : '';
        this.builder.addConditionalBlock(block.type, conditionStr);
      } else if (block.type === CONDITION_BLOCK_TYPE.ELSE) {
        this.builder.addConditionalBlock('else');
      }
      if (block.content) {
        this.addContent(block.content, block.speaker);
      }
      if (block.nextNodeId) {
        this.builder.addJump(block.nextNodeId);
      }
    });
    this.builder.addEndConditional();
    return this;
  }

  addChoices(choices: ForgeChoice[]): this {
    choices.forEach((choice) => {
      if (choice.conditions && choice.conditions.length > 0) {
        this.builder.addConditionalBlock('if', formatConditions(choice.conditions));
      }
      const setCommands = extractSetCommands(choice.text);
      let choiceText = choice.text;
      if (setCommands.length > 0) {
        setCommands.forEach((cmd) => {
          choiceText = choiceText.replace(cmd, '').trim();
        });
      }
      this.builder.addOption(choiceText, 0);
      if (setCommands.length > 0) {
        setCommands.forEach((cmd) => {
          this.builder.addRaw('    ' + cmd + '\n');
        });
      } else if (choice.setFlags?.length) {
        choice.setFlags.forEach((flag) => {
          this.builder.addSetCommand(flag, true, 1);
        });
      }
      if (choice.nextNodeId) {
        this.builder.addJump(choice.nextNodeId, 1);
      }
      if (choice.conditions && choice.conditions.length > 0) {
        this.builder.addEndConditional();
      }
    });
    return this;
  }

  addFlags(flags: string[]): this {
    flags.forEach((flag) => this.builder.addSetCommand(flag, true));
    return this;
  }

  addNextNode(nextNodeId: string): this {
    this.builder.addJump(nextNodeId);
    return this;
  }

  endNode(): string {
    this.builder.addNodeEnd();
    return this.builder.build();
  }

  getBuilder(): YarnTextBuilder {
    return this.builder;
  }
}
