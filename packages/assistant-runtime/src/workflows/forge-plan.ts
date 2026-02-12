import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createOpenRouterChatModel, invokeText } from '../model/chat-openrouter';

export interface ForgePlanWorkflowInput {
  goal: string;
  graphSummary?: unknown;
  openRouterApiKey: string;
  openRouterBaseUrl: string;
  modelId: string;
  headers?: Record<string, string>;
}

export interface ForgePlanWorkflowOutput {
  steps: Record<string, unknown>[];
  summary: string;
}

function normalizeStep(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') {
    return {
      type: 'createNode',
      nodeType: 'CHARACTER',
      label: 'Node',
      x: 0,
      y: 0,
    };
  }

  const step = raw as Record<string, unknown>;
  const type = String(step.type ?? 'createNode');

  if (type === 'createEdge') {
    return {
      type: 'createEdge',
      source: step.source ?? step.sourceNodeId,
      target: step.target ?? step.targetNodeId,
    };
  }

  if (type === 'updateNode') {
    return {
      type: 'updateNode',
      nodeId: step.nodeId,
      updates: typeof step.updates === 'object' && step.updates ? step.updates : {},
    };
  }

  if (type === 'deleteNode') {
    return {
      type: 'deleteNode',
      nodeId: step.nodeId,
    };
  }

  return {
    type: 'createNode',
    ...(typeof step.id === 'string' && step.id.trim().length > 0
      ? { id: step.id.trim() }
      : {}),
    nodeType: step.nodeType ?? 'CHARACTER',
    label: step.label ?? 'Node',
    content: step.content,
    speaker: step.speaker,
    x: typeof step.x === 'number' ? step.x : 0,
    y: typeof step.y === 'number' ? step.y : 0,
  };
}

function fallbackPlan(goal: string): ForgePlanWorkflowOutput {
  return {
    summary: `Fallback plan for: ${goal}`,
    steps: [
      {
        type: 'createNode',
        nodeType: 'CHARACTER',
        label: goal.slice(0, 50) || 'New dialogue node',
        x: 0,
        y: 0,
      },
    ],
  };
}

export async function runForgePlanWorkflow(
  input: ForgePlanWorkflowInput,
): Promise<ForgePlanWorkflowOutput> {
  if (!input.goal.trim()) {
    return fallbackPlan('Untitled goal');
  }

  const model = createOpenRouterChatModel({
    apiKey: input.openRouterApiKey,
    baseURL: input.openRouterBaseUrl,
    model: input.modelId,
    headers: input.headers,
    temperature: 0.2,
  });

  const system = new SystemMessage(
    'You are a graph-planning assistant. Return ONLY valid JSON in this shape: ' +
      '{"summary": string, "steps": Array<step>}. Each step type must be one of ' +
      'createNode, updateNode, deleteNode, createEdge. Keep steps minimal and deterministic.'
  );

  const user = new HumanMessage(
    `Goal: ${input.goal}\n\nGraph summary: ${JSON.stringify(input.graphSummary ?? {})}`
  );

  try {
    const text = await invokeText({ model, messages: [system, user] });
    const parsed = JSON.parse(text) as {
      summary?: unknown;
      steps?: unknown[];
    };

    const steps = Array.isArray(parsed.steps) ? parsed.steps.map(normalizeStep) : [];
    if (steps.length === 0) return fallbackPlan(input.goal);

    return {
      summary:
        typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
          ? parsed.summary
          : `Plan for: ${input.goal}`,
      steps,
    };
  } catch {
    return fallbackPlan(input.goal);
  }
}
