/**
 * Base Node Handler
 */
import type { ForgeReactFlowNode, ForgeNodeType } from '@forge/types';
import type { NodeHandler, YarnConverterContext, YarnNodeBlock, YarnTextBuilder } from '../types';
import { YarnTextBuilder as YarnTextBuilderImpl } from '../builders/yarn-text-builder';

export abstract class BaseNodeHandler implements NodeHandler {
  abstract canHandle(nodeType: ForgeNodeType): boolean;
  abstract exportNode(
    node: ForgeReactFlowNode,
    builder: YarnTextBuilder,
    context?: YarnConverterContext
  ): Promise<string>;
  abstract importNode(yarnBlock: YarnNodeBlock, context?: YarnConverterContext): Promise<ForgeReactFlowNode>;

  protected createBuilder(): YarnTextBuilder {
    return new YarnTextBuilderImpl();
  }

  protected getNodeData(node: ForgeReactFlowNode) {
    if (!node.data) throw new Error(`Node ${node.id} has no data`);
    return node.data;
  }
}
