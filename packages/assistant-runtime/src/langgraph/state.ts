import type { AssistantContextBundle } from '../context';
import type {
  AssistantDomain,
  AssistantWorkspaceId,
  AssistantSessionRecord,
  SessionLocator,
} from '../sessions/types';

export type IntentClass =
  | 'forge_plan'
  | 'forge_story_builder'
  | 'character_core'
  | 'general';

export interface ChatRequestMetadata {
  userId: number;
  projectId: number;
  domain: AssistantDomain;
  workspaceId: AssistantWorkspaceId;
  viewportId?: string;
}

export interface ChatOrchestratorInput {
  metadata: ChatRequestMetadata;
  latestUserMessage: string;
  selectedModelId: string;
}

export interface AssistantGraphState {
  input: ChatOrchestratorInput;
  locator: SessionLocator;
  session?: AssistantSessionRecord;
  context?: AssistantContextBundle;
  intentClass?: IntentClass;
  workflowHints: string[];
  contextAddendum?: string;
  systemAddendum?: string;
}

export interface ChatOrchestratorResult {
  sessionKey: string;
  threadId: string;
  intentClass: IntentClass;
  workflowHints: string[];
  contextAddendum: string;
  systemAddendum: string;
}
