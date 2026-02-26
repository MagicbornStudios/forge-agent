import type { DomainAssistantContract, DomainContextSnapshot, DomainTool } from './domain-contract';

export type ForgeRuntimeToolName = 'forge_open_about_me';

export type ForgeRuntimeToolDefinition = {
  name: ForgeRuntimeToolName;
  label: string;
  description: string;
};

export const FORGE_RUNTIME_TOOL_DEFINITIONS: readonly ForgeRuntimeToolDefinition[] = [
  {
    name: 'forge_open_about_me',
    label: 'Open About Me',
    description: 'Open the developer About Me panel to verify Forge tool execution is wired.',
  },
] as const;

export interface ForgeRuntimeAboutMe {
  name?: string;
  role?: string;
  email?: string;
  summary?: string;
}

export interface ForgeRuntimeToolEnabledMap {
  forge_open_about_me?: boolean;
}

export interface CreateForgeRuntimeContractOptions {
  toolEnabled?: ForgeRuntimeToolEnabledMap;
  aboutMe?: ForgeRuntimeAboutMe;
  onOpenAboutMe?: (aboutMe: ForgeRuntimeAboutMe) => void;
}

const DEFAULT_TOOL_ENABLED: Required<ForgeRuntimeToolEnabledMap> = {
  forge_open_about_me: true,
};

function normalizeToolEnabled(map: ForgeRuntimeToolEnabledMap | undefined): Required<ForgeRuntimeToolEnabledMap> {
  return {
    forge_open_about_me: map?.forge_open_about_me !== false,
  };
}

function normalizeAboutMe(input: ForgeRuntimeAboutMe | undefined): ForgeRuntimeAboutMe {
  return {
    name: String(input?.name || '').trim(),
    role: String(input?.role || '').trim(),
    email: String(input?.email || '').trim(),
    summary: String(input?.summary || '').trim(),
  };
}

function forgeRuntimeInstructions() {
  return [
    'You are the Forge Assistant runtime for workspace operations.',
    'When the user asks to open profile/about/developer info, call forge_open_about_me.',
    'Use tools when available instead of pretending actions were completed.',
  ].join(' ');
}

function createForgeRuntimeTools(input: {
  toolEnabled: Required<ForgeRuntimeToolEnabledMap>;
  aboutMe: ForgeRuntimeAboutMe;
  onOpenAboutMe?: (aboutMe: ForgeRuntimeAboutMe) => void;
}): DomainTool[] {
  const tools: DomainTool[] = [];
  if (input.toolEnabled.forge_open_about_me) {
    tools.push({
      domain: 'forge',
      name: 'forge_open_about_me',
      description: 'Open the About Me panel for the current developer profile.',
      parameters: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        input.onOpenAboutMe?.(input.aboutMe);
        return {
          ok: true,
          action: 'open_about_me',
          aboutMe: input.aboutMe,
          message: 'About Me panel opened.',
        };
      },
    });
  }
  return tools;
}

export function createForgeRuntimeContract(options: CreateForgeRuntimeContractOptions = {}): DomainAssistantContract {
  const toolEnabled = {
    ...DEFAULT_TOOL_ENABLED,
    ...normalizeToolEnabled(options.toolEnabled),
  };
  const aboutMe = normalizeAboutMe(options.aboutMe);
  return {
    domain: 'forge',
    getContextSnapshot: (): DomainContextSnapshot => ({
      domain: 'forge',
      domainState: {
        runtime: 'forge',
        enabledTools: FORGE_RUNTIME_TOOL_DEFINITIONS
          .filter((definition) => toolEnabled[definition.name] !== false)
          .map((definition) => definition.name),
      },
      selectionSummary: null,
    }),
    getInstructions: forgeRuntimeInstructions,
    createTools: () => createForgeRuntimeTools({
      toolEnabled,
      aboutMe,
      onOpenAboutMe: options.onOpenAboutMe,
    }),
    getSuggestions: () => ([
      { title: 'Open About Me', message: 'Open the developer About Me panel.' },
    ]),
    onHighlight: () => {},
    clearHighlights: () => {},
  };
}
