import type { AssistantSessionRecord, SessionCheckpoint, SessionLocator, SessionStore } from './types';
import { buildSessionKey, buildThreadId } from './types';

type PayloadDoc = Record<string, unknown>;

interface PayloadCollectionClient {
  find(args: Record<string, unknown>): Promise<{ docs: unknown[] }>;
  create(args: Record<string, unknown>): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<unknown>;
}

function asObject(value: unknown): PayloadDoc {
  return value && typeof value === 'object' ? (value as PayloadDoc) : {};
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (typeof value === 'object' && value != null && 'id' in value) {
    return asNumber((value as { id?: unknown }).id);
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function parseSession(docInput: unknown): AssistantSessionRecord {
  const doc = asObject(docInput);
  const user = asNumber(doc.user) ?? 0;
  const project = asNumber(doc.project);
  const domain = (asString(doc.domain) ?? 'app') as AssistantSessionRecord['domain'];
  const editor = (asString(doc.editor) ?? 'app') as AssistantSessionRecord['editor'];

  return {
    id: asNumber(doc.id) ?? 0,
    sessionKey: asString(doc.sessionKey) ?? '',
    threadId: asString(doc.threadId) ?? '',
    user,
    project,
    domain,
    editor,
    summary: asString(doc.summary),
    events: doc.events,
    checkpoint: (doc.checkpoint as SessionCheckpoint | null | undefined) ?? null,
    messageCount: asNumber(doc.messageCount) ?? 0,
    lastModelId: asString(doc.lastModelId),
    updatedAt: asString(doc.updatedAt) ?? undefined,
    createdAt: asString(doc.createdAt) ?? undefined,
  };
}

export class PayloadSessionStore implements SessionStore {
  private payload: PayloadCollectionClient;

  constructor(payload: PayloadCollectionClient) {
    this.payload = payload;
  }

  async getOrCreateSession(locator: SessionLocator): Promise<AssistantSessionRecord> {
    if (locator.projectId == null) {
      throw new Error('LangGraph session requires projectId.');
    }

    const sessionKey = buildSessionKey(locator);
    const existing = await this.payload.find({
      collection: 'agent-sessions',
      where: {
        and: [
          { sessionKey: { equals: sessionKey } },
          { user: { equals: locator.userId } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      return parseSession(existing.docs[0]);
    }

    const created = await this.payload.create({
      collection: 'agent-sessions',
      data: {
        user: locator.userId,
        project: locator.projectId,
        domain: locator.domain,
        editor: locator.editorId,
        sessionKey,
        threadId: buildThreadId(locator),
        summary: '',
        events: [],
        checkpoint: {
          updatedAt: new Date().toISOString(),
        },
        messageCount: 0,
      },
      overrideAccess: true,
    });

    return parseSession(created);
  }

  async saveCheckpoint(input: {
    locator: SessionLocator;
    checkpoint: SessionCheckpoint;
    summary?: string;
    events?: unknown;
    messageCountDelta?: number;
    lastModelId?: string;
  }): Promise<AssistantSessionRecord> {
    const current = await this.getOrCreateSession(input.locator);
    const nextMessageCount = Math.max(0, current.messageCount + (input.messageCountDelta ?? 0));

    const updated = await this.payload.update({
      collection: 'agent-sessions',
      id: current.id,
      data: {
        checkpoint: input.checkpoint,
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.events !== undefined ? { events: input.events } : {}),
        messageCount: nextMessageCount,
        ...(input.lastModelId ? { lastModelId: input.lastModelId } : {}),
      },
      overrideAccess: true,
    });

    return parseSession(updated);
  }
}
