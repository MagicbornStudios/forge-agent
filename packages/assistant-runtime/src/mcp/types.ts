export interface McpToolDescriptor {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  domain?: string;
}

export interface McpAppDescriptor {
  id: string;
  name: string;
  description?: string;
  tools: McpToolDescriptor[];
  metadata?: Record<string, unknown>;
}
