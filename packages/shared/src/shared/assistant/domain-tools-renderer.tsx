'use client';

import * as React from 'react';
import { makeAssistantTool } from '@assistant-ui/react';
import type { DomainAssistantContract, DomainTool } from './domain-contract';

/**
 * Renders Assistant UI tool components for each tool in the contract.
 * Mount inside AssistantRuntimeProvider. When enabled, tools are registered
 * and included in API requests.
 */
export function DomainToolsRenderer({
  contract,
  enabled = true,
}: {
  contract: DomainAssistantContract;
  enabled?: boolean;
}) {
  const tools = React.useMemo(() => (enabled ? contract.createTools() : []), [enabled, contract]);

  return (
    <>
      {tools.map((tool) => (
        <DomainToolComponent key={tool.name} tool={tool} contract={contract} />
      ))}
    </>
  );
}

function DomainToolComponent({
  tool,
  contract,
}: {
  tool: DomainTool;
  contract: DomainAssistantContract;
}) {
  const contractRef = React.useRef(contract);
  const toolRef = React.useRef(tool);
  contractRef.current = contract;
  toolRef.current = tool;

  const ToolComponent = React.useMemo(() => {
    return makeAssistantTool<Record<string, unknown>, unknown>({
      toolName: tool.name,
      description: tool.description,
      parameters: tool.parameters as never,
      execute: async (args, ctx) => {
        const c = contractRef.current;
        const t = toolRef.current;
        const snapshot = c.getContextSnapshot();
        return t.execute(args, {
          snapshot,
          emit: (event) => (ctx as { emit?: (e: unknown) => void }).emit?.(event),
        });
      },
      render: tool.render
        ? (props) => {
            const node = toolRef.current.render!(props.result);
            return node ?? null;
          }
        : undefined,
    });
  }, [tool.name, !!tool.render]); // Recreate when tool name or render presence changes; execute reads from refs

  return <ToolComponent />;
}
