/**
 * Types for Yarn Converter
 */

import type { ForgeGraphDoc, ForgeReactFlowNode, ForgeNodeType } from '@forge/types';

export interface YarnConverterContext {
  getGraphFromCache?: (graphId: string | number) => ForgeGraphDoc | undefined;
  ensureGraph?: (graphId: number) => Promise<ForgeGraphDoc>;
  visitedGraphs?: Set<number>;
}

export interface YarnNodeBlock {
  nodeId: string;
  lines: string[];
  rawContent: string;
}

export interface YarnTextBuilder {
  addNodeTitle(nodeId: string): YarnTextBuilder;
  addNodeSeparator(): YarnTextBuilder;
  addLine(content: string, speaker?: string): YarnTextBuilder;
  addOption(choiceText: string, indent?: number): YarnTextBuilder;
  addCommand(command: string, args?: string): YarnTextBuilder;
  addConditionalBlock(type: 'if' | 'elseif' | 'else', condition?: string): YarnTextBuilder;
  addEndConditional(): YarnTextBuilder;
  addJump(targetNodeId: string, indent?: number): YarnTextBuilder;
  addSetCommand(flag: string, value?: unknown, indent?: number): YarnTextBuilder;
  build(): string;
  clear(): void;
}

export interface NodeHandler {
  canHandle(nodeType: ForgeNodeType): boolean;
  exportNode(
    node: ForgeReactFlowNode,
    builder: YarnTextBuilder,
    context?: YarnConverterContext
  ): Promise<string>;
  importNode(yarnBlock: YarnNodeBlock, context?: YarnConverterContext): Promise<ForgeReactFlowNode>;
}
