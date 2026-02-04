import type { DomainSuggestion } from '@/shared/copilot/types';
import type { Selection } from '@/shared/workspace/selection';
import { isEntity } from '@/shared/workspace/selection';
import type { ForgeGraphDoc } from '@/types/graph';

export interface ForgeSuggestionsDeps {
  graph: ForgeGraphDoc | null;
  selection: Selection | null;
}

/** Produce context-aware chat suggestions for the forge domain. */
export function getForgeSuggestions(deps: ForgeSuggestionsDeps): DomainSuggestion[] {
  const { graph, selection } = deps;
  const suggestions: DomainSuggestion[] = [];

  if (!graph || graph.flow.nodes.length === 0) {
    suggestions.push({
      title: 'Create a dialogue',
      message:
        'Create a character dialogue with 3 connected nodes: a narrator introduction, a character greeting, and a player response.',
    });
    return suggestions;
  }

  if (graph.flow.nodes.length > 0 && graph.flow.edges.length === 0) {
    suggestions.push({
      title: 'Connect nodes',
      message: 'Connect the existing nodes in a logical dialogue flow.',
    });
  }

  if (selection && isEntity(selection) && selection.entityType === 'forge.node') {
    suggestions.push({
      title: 'Add response',
      message: `Add a player response node connected to the selected node "${selection.meta?.label ?? selection.id}".`,
    });
  }

  if (graph.flow.nodes.length > 3) {
    suggestions.push({
      title: 'Summarize graph',
      message: 'Describe the current dialogue flow and suggest improvements.',
    });
  }

  return suggestions;
}
