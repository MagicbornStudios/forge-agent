import type { DomainContextSnapshot } from '@forge/shared/copilot/types';
import type { Selection } from '@forge/shared';
import { isEntity } from '@forge/shared';
import type { ForgeGraphDoc } from '@forge/types/graph';

export interface ForgeContextDeps {
  graph: ForgeGraphDoc | null;
  selection: Selection | null;
  isDirty: boolean;
}

/** Build a CopilotKit-readable context snapshot for the forge domain. */
export function buildForgeContext(deps: ForgeContextDeps): DomainContextSnapshot {
  const { graph, selection, isDirty } = deps;

  let selectionSummary: string | null = null;
  if (selection && isEntity(selection)) {
    selectionSummary =
      selection.entityType === 'forge.node'
        ? `Node: ${selection.id}${selection.meta?.label ? ` (${selection.meta.label})` : ''}`
        : `Edge: ${selection.id}`;
  }

  return {
    domain: 'forge',
    workspaceId: 'forge',
    selection,
    selectionSummary,
    domainState: {
      editorType: 'reactflow',
      graphTitle: graph?.title ?? null,
      graphKind: graph?.kind ?? null,
      nodeCount: graph?.flow.nodes.length ?? 0,
      edgeCount: graph?.flow.edges.length ?? 0,
      nodeIds: graph?.flow.nodes.map((n) => n.id) ?? [],
      isDirty,
    },
  };
}

