import type { McpAppDescriptor, McpToolDescriptor } from './types';

export interface DomainToolLike {
  domain?: string;
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export function domainToolToMcp(tool: DomainToolLike): McpToolDescriptor {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: {
      type: 'object',
      properties: tool.parameters.properties ?? {},
      ...(Array.isArray(tool.parameters.required) && tool.parameters.required.length > 0
        ? { required: tool.parameters.required }
        : {}),
    },
    ...(tool.domain ? { domain: tool.domain } : {}),
  };
}

export function buildMcpAppDescriptor(input: {
  id: string;
  name: string;
  description?: string;
  tools: DomainToolLike[];
  metadata?: Record<string, unknown>;
}): McpAppDescriptor {
  return {
    id: input.id,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    tools: input.tools.map(domainToolToMcp),
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}
