/**
 * Yarn Text Builder
 */
import type { YarnTextBuilder as IYarnTextBuilder } from '../types';

export const YARN_SYNTAX = {
  NODE_TITLE_PREFIX: 'title: ',
  NODE_SEPARATOR: '---',
  NODE_END: '===',
  OPTION_PREFIX: '-> ',
  JUMP_COMMAND: '<<jump ',
  SET_COMMAND: '<<set ',
  IF_COMMAND: '<<if ',
  ELSEIF_COMMAND: '<<elseif ',
  ELSE_COMMAND: '<<else>>',
  ENDIF_COMMAND: '<<endif>>',
  COMMAND_CLOSE: '>>',
  INDENT: '    ',
  NEWLINE: '\n',
} as const;

export class YarnTextBuilder implements IYarnTextBuilder {
  private lines: string[] = [];

  addNodeTitle(nodeId: string): this {
    this.lines.push(`${YARN_SYNTAX.NODE_TITLE_PREFIX}${nodeId}${YARN_SYNTAX.NEWLINE}`);
    return this;
  }

  addNodeSeparator(): this {
    this.lines.push(`${YARN_SYNTAX.NODE_SEPARATOR}${YARN_SYNTAX.NEWLINE}`);
    return this;
  }

  addLine(content: string, speaker?: string): this {
    if (speaker) {
      const formatted = content.replace(/\n/g, `\n${speaker}: `);
      this.lines.push(`${speaker}: ${formatted}${YARN_SYNTAX.NEWLINE}`);
    } else {
      this.lines.push(`${content}${YARN_SYNTAX.NEWLINE}`);
    }
    return this;
  }

  addOption(choiceText: string, indent = 0): this {
    const indentStr = indent > 0 ? YARN_SYNTAX.INDENT.repeat(indent) : '';
    this.lines.push(`${indentStr}${YARN_SYNTAX.OPTION_PREFIX}${choiceText}${YARN_SYNTAX.NEWLINE}`);
    return this;
  }

  addCommand(command: string, args?: string): this {
    const argsStr = args ? ` ${args}` : '';
    this.lines.push(`<<${command}${argsStr}>>${YARN_SYNTAX.NEWLINE}`);
    return this;
  }

  addConditionalBlock(type: 'if' | 'elseif' | 'else', condition?: string): this {
    if (type === 'else') {
      this.lines.push(`${YARN_SYNTAX.ELSE_COMMAND}${YARN_SYNTAX.NEWLINE}`);
    } else {
      const cmd = type === 'if' ? YARN_SYNTAX.IF_COMMAND : YARN_SYNTAX.ELSEIF_COMMAND;
      this.lines.push(`${cmd}${condition ?? ''}>>${YARN_SYNTAX.NEWLINE}`);
    }
    return this;
  }

  addEndConditional(): this {
    this.lines.push(`${YARN_SYNTAX.ENDIF_COMMAND}${YARN_SYNTAX.NEWLINE}`);
    return this;
  }

  addJump(targetNodeId: string, indent = 0): this {
    const indentStr = indent > 0 ? YARN_SYNTAX.INDENT.repeat(indent) : '';
    this.lines.push(`${indentStr}${YARN_SYNTAX.JUMP_COMMAND}${targetNodeId}>>${YARN_SYNTAX.NEWLINE}`);
    return this;
  }

  addSetCommand(flag: string, value: unknown = true, indent = 0): this {
    const indentStr = indent > 0 ? YARN_SYNTAX.INDENT.repeat(indent) : '';
    const valueStr = typeof value === 'string' ? `"${value}"` : String(value);
    this.lines.push(`${indentStr}${YARN_SYNTAX.SET_COMMAND}$${flag} = ${valueStr}>>${YARN_SYNTAX.NEWLINE}`);
    return this;
  }

  addNodeEnd(): this {
    this.lines.push(`${YARN_SYNTAX.NODE_END}${YARN_SYNTAX.NEWLINE}${YARN_SYNTAX.NEWLINE}`);
    return this;
  }

  addRaw(text: string): this {
    this.lines.push(text);
    return this;
  }

  build(): string {
    return this.lines.join('');
  }

  clear(): void {
    this.lines = [];
  }
}
