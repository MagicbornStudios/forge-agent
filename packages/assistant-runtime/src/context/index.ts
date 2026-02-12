import {
  assembleCharacterContext,
  formatCharacterContext,
  type CharacterContextSnapshot,
} from './assemblers/character';
import {
  assembleForgeContext,
  formatForgeContext,
  type ForgeContextSnapshot,
} from './assemblers/forge';
import {
  assemblePagesContext,
  formatPagesContext,
  type PagesContextSnapshot,
} from './assemblers/pages';
import type { AssistantDomain } from '../sessions/types';

interface PayloadClient {
  find(args: Record<string, unknown>): Promise<{ docs: Array<Record<string, unknown>> }>;
}

export interface AssistantContextBundle {
  forge?: ForgeContextSnapshot;
  character?: CharacterContextSnapshot;
  pages?: PagesContextSnapshot;
}

export async function assembleAssistantContext(input: {
  payload: PayloadClient;
  domain: AssistantDomain;
  projectId: number;
}): Promise<AssistantContextBundle> {
  const [forge, character, pages] = await Promise.all([
    input.domain === 'forge' ? assembleForgeContext({ payload: input.payload, projectId: input.projectId }) : Promise.resolve(undefined),
    input.domain === 'character'
      ? assembleCharacterContext({ payload: input.payload, projectId: input.projectId })
      : Promise.resolve(undefined),
    assemblePagesContext({
      payload: input.payload,
      projectId: input.projectId,
      maxPages: 5,
      maxBlocksPerPage: 3,
      maxCharsPerSnippet: 500,
    }),
  ]);

  return { forge, character, pages };
}

export function formatAssistantContextAddendum(bundle: AssistantContextBundle): string {
  const sections: string[] = [];

  if (bundle.forge) sections.push(formatForgeContext(bundle.forge));
  if (bundle.character) sections.push(formatCharacterContext(bundle.character));
  if (bundle.pages) sections.push(formatPagesContext(bundle.pages));

  if (sections.length === 0) {
    return 'No project context available.';
  }

  return sections.join('\n\n');
}
