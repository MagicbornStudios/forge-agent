/**
 * Node Handler Registry
 */
import type { ForgeNodeType } from '@forge/types';
import type { NodeHandler } from './types';

export class NodeHandlerRegistry {
  private handlers = new Map<ForgeNodeType, NodeHandler>();

  registerHandler(nodeType: ForgeNodeType, handler: NodeHandler): void {
    this.handlers.set(nodeType, handler);
  }

  getHandler(nodeType: ForgeNodeType): NodeHandler {
    const handler = this.handlers.get(nodeType);
    if (!handler) throw new Error(`No handler registered for node type: ${nodeType}`);
    return handler;
  }

  hasHandler(nodeType: ForgeNodeType): boolean {
    return this.handlers.has(nodeType);
  }
}

export const defaultRegistry = new NodeHandlerRegistry();
