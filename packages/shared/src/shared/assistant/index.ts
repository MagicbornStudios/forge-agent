export type {
  DomainAssistantContract,
  DomainContextSnapshot,
  DomainTool,
  DomainToolContext,
  DomainToolParameters,
} from './domain-contract';
export type {
  ForgeRuntimeAboutMe,
  ForgeRuntimeToolDefinition,
  ForgeRuntimeToolEnabledMap,
  ForgeRuntimeToolName,
  CreateForgeRuntimeContractOptions,
} from './forge-runtime-contract';
export {
  FORGE_RUNTIME_TOOL_DEFINITIONS,
  createForgeRuntimeContract,
} from './forge-runtime-contract';
export { DomainToolsRenderer } from './domain-tools-renderer';
export { useDomainAssistant, type UseDomainAssistantOptions } from './use-domain-assistant';
export {
  useAIHighlight,
  type AIHighlightPayload,
  type AIHighlightState,
  type UseAIHighlightReturn,
} from './highlight';
