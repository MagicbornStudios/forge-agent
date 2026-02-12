export type AssistantDomain = 'forge' | 'character' | 'writer' | 'video' | 'app';

export type AssistantEditorId = 'dialogue' | 'character' | 'writer' | 'app';

export interface SessionLocator {
  userId: number;
  projectId: number | null;
  domain: AssistantDomain;
  editorId: AssistantEditorId;
}

export interface SessionCheckpoint {
  updatedAt: string;
  lastIntent?: string;
  lastWorkflow?: string;
  workflowHints?: string[];
  contextSummary?: string;
  payload?: Record<string, unknown>;
}

export interface AssistantSessionRecord {
  id: number;
  sessionKey: string;
  threadId: string;
  user: number;
  project: number | null;
  domain: AssistantDomain;
  editor: AssistantEditorId;
  summary?: string | null;
  events?: unknown;
  checkpoint?: SessionCheckpoint | null;
  messageCount: number;
  lastModelId?: string | null;
  updatedAt?: string;
  createdAt?: string;
}

export interface SessionStore {
  getOrCreateSession(locator: SessionLocator): Promise<AssistantSessionRecord>;
  saveCheckpoint(input: {
    locator: SessionLocator;
    checkpoint: SessionCheckpoint;
    summary?: string;
    events?: unknown;
    messageCountDelta?: number;
    lastModelId?: string;
  }): Promise<AssistantSessionRecord>;
}

export function buildSessionKey(locator: SessionLocator): string {
  const projectPart = locator.projectId == null ? 'none' : String(locator.projectId);
  return `session:${locator.userId}:${locator.editorId}:${projectPart}`;
}

export function buildThreadId(locator: SessionLocator): string {
  const sessionKey = buildSessionKey(locator);
  return sessionKey.replace(/[^a-zA-Z0-9:_-]/g, '_');
}
