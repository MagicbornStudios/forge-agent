import {
  createForgeRuntimeContract,
  type ForgeRuntimeAboutMe,
  type ForgeRuntimeToolEnabledMap,
} from '@forge/shared';
import type {
  RepoWorkspaceExtension,
  RepoWorkspaceExtensionAboutWorkspace,
  RepoWorkspaceExtensionForgeTool,
} from '@/lib/api/types';

const EXTENSION_TOOL_NAME = 'forge_open_about_workspace';
const EXTENSION_TOOL_ACTION = 'open_about_workspace';
type ForgeRuntimeContract = ReturnType<typeof createForgeRuntimeContract>;
type ForgeRuntimeContextSnapshot = ReturnType<ForgeRuntimeContract['getContextSnapshot']>;
type ForgeRuntimeTool = ReturnType<ForgeRuntimeContract['createTools']>[number];

export type CreateRepoForgeRuntimeContractOptions = {
  activeWorkspaceId: string;
  extension: RepoWorkspaceExtension | null;
  toolEnabled?: ForgeRuntimeToolEnabledMap;
  aboutMe?: ForgeRuntimeAboutMe;
  onOpenAboutMe?: (aboutMe: ForgeRuntimeAboutMe) => void;
  onOpenAboutWorkspace?: (payload: RepoWorkspaceExtensionAboutWorkspace & { workspaceId: string; label: string }) => void;
};

function resolveAboutWorkspaceTool(extension: RepoWorkspaceExtension | null | undefined) {
  const tools = Array.isArray(extension?.assistant?.forge?.tools)
    ? extension?.assistant?.forge?.tools as RepoWorkspaceExtensionForgeTool[]
    : [];
  const tool = tools.find((entry) => {
    const name = String(entry?.name || '').trim();
    const action = String(entry?.action || '').trim();
    return name === EXTENSION_TOOL_NAME && action === EXTENSION_TOOL_ACTION;
  });
  const aboutWorkspace = extension?.assistant?.forge?.aboutWorkspace;
  if (!tool || !aboutWorkspace) return null;
  return {
    tool,
    aboutWorkspace,
  };
}

function createExtensionTool(input: {
  workspaceId: string;
  label: string;
  tool: RepoWorkspaceExtensionForgeTool;
  aboutWorkspace: RepoWorkspaceExtensionAboutWorkspace;
  onOpenAboutWorkspace?: (payload: RepoWorkspaceExtensionAboutWorkspace & { workspaceId: string; label: string }) => void;
}): ForgeRuntimeTool {
  return {
    domain: 'forge',
    name: EXTENSION_TOOL_NAME,
    description: input.tool.description,
    parameters: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      const payload = {
        ...input.aboutWorkspace,
        workspaceId: input.workspaceId,
        label: input.label,
      };
      input.onOpenAboutWorkspace?.(payload);
      return {
        ok: true,
        action: EXTENSION_TOOL_ACTION,
        workspaceId: input.workspaceId,
        label: input.label,
        aboutWorkspace: payload,
        message: 'About Workspace panel opened.',
      };
    },
  };
}

export function createRepoForgeRuntimeContract(
  options: CreateRepoForgeRuntimeContractOptions,
): ForgeRuntimeContract {
  const baseContract = createForgeRuntimeContract({
    toolEnabled: options.toolEnabled,
    aboutMe: options.aboutMe,
    onOpenAboutMe: options.onOpenAboutMe,
  });

  const extensionTool = resolveAboutWorkspaceTool(options.extension);

  return {
    domain: 'forge',
    getContextSnapshot: (): ForgeRuntimeContextSnapshot => {
      const snapshot = baseContract.getContextSnapshot();
      return {
        ...snapshot,
        domainState: {
          ...snapshot.domainState,
          activeWorkspaceId: options.activeWorkspaceId,
          activeExtensionWorkspaceId: options.extension?.workspaceId || null,
          activeExtensionWorkspaceLabel: options.extension?.label || null,
        },
      };
    },
    getInstructions: () => {
      const instructions = [baseContract.getInstructions()];
      if (extensionTool) {
        instructions.push('When the user asks about this workspace context, call forge_open_about_workspace.');
      }
      return instructions.join(' ');
    },
    createTools: () => {
      const tools = [...baseContract.createTools()];
      if (extensionTool && options.extension) {
        tools.push(createExtensionTool({
          workspaceId: options.extension.workspaceId,
          label: options.extension.label,
          tool: extensionTool.tool,
          aboutWorkspace: extensionTool.aboutWorkspace,
          onOpenAboutWorkspace: options.onOpenAboutWorkspace,
        }));
      }
      return tools;
    },
    getSuggestions: () => {
      const suggestions = [...baseContract.getSuggestions()];
      if (extensionTool) {
        suggestions.push({
          title: extensionTool.tool.label,
          message: 'Open the active workspace context panel.',
        });
      }
      return suggestions;
    },
    onHighlight: (...args) => baseContract.onHighlight(...args),
    clearHighlights: () => baseContract.clearHighlights(),
  };
}
