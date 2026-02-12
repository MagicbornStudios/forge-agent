import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { MemorySaver } from '@langchain/langgraph-checkpoint';
import {
  assembleAssistantContext,
  formatAssistantContextAddendum,
  type AssistantContextBundle,
} from '../context';
import { runCharacterCoreWorkflow } from '../workflows/character-core';
import type { SessionStore } from '../sessions/types';
import type {
  AssistantGraphState,
  ChatOrchestratorInput,
  ChatOrchestratorResult,
  IntentClass,
} from './state';

interface PayloadClient {
  find(args: Record<string, unknown>): Promise<{ docs: Array<Record<string, unknown>> }>;
}

export interface AssistantChatOrchestrator {
  compiledGraph: unknown;
  run(input: ChatOrchestratorInput): Promise<ChatOrchestratorResult>;
}

function classifyIntentText(latestUserMessage: string, domain: string): IntentClass {
  const intent = latestUserMessage.toLowerCase();

  if (domain === 'forge') {
    if (
      intent.includes('story') ||
      intent.includes('premise') ||
      intent.includes('scene') ||
      intent.includes('story builder')
    ) {
      return 'forge_story_builder';
    }

    if (
      intent.includes('plan') ||
      intent.includes('branch') ||
      intent.includes('connect') ||
      intent.includes('node') ||
      intent.includes('edge')
    ) {
      return 'forge_plan';
    }
  }

  if (domain === 'character') {
    return 'character_core';
  }

  return 'general';
}

function routeWorkflowHints(input: {
  intentClass: IntentClass;
  latestUserMessage: string;
  context?: AssistantContextBundle;
}): string[] {
  if (input.intentClass === 'forge_story_builder') {
    return [
      'Use forge_createStoryFromPremise when user requests premise-to-graph generation.',
      'Return structured steps so client applies graph mutations.',
    ];
  }

  if (input.intentClass === 'forge_plan') {
    return [
      'Use forge_createPlan for multi-step graph edits.',
      'Keep operations minimal and deterministic; do not mutate server state directly.',
    ];
  }

  if (input.intentClass === 'character_core') {
    const characterFlow = runCharacterCoreWorkflow({
      intent: input.latestUserMessage,
      context: input.context?.character,
    });

    return [
      `Character workflow kind: ${characterFlow.kind}`,
      ...characterFlow.hints,
      'Prefer character_* tools and highlight affected entities.',
    ];
  }

  return ['General assistant workflow: respond conversationally and use available tools carefully.'];
}

function buildSystemAddendum(input: {
  threadId: string;
  intentClass: IntentClass;
  workflowHints: string[];
  contextAddendum: string;
}): string {
  const hintLines = input.workflowHints.map((hint) => `- ${hint}`).join('\n');
  return [
    '[LangGraph orchestration metadata]',
    `Thread: ${input.threadId}`,
    `Intent class: ${input.intentClass}`,
    'Workflow hints:',
    hintLines,
    '',
    '[Project retrieval context]',
    input.contextAddendum,
  ].join('\n');
}

function createCompiledGraph(): unknown {
  try {
    const StateAnnotation = Annotation.Root({
      input: Annotation<ChatOrchestratorInput>(),
      locator: Annotation<AssistantGraphState['locator']>(),
      session: Annotation<AssistantGraphState['session']>(),
      context: Annotation<AssistantGraphState['context']>(),
      intentClass: Annotation<AssistantGraphState['intentClass']>(),
      workflowHints: Annotation<string[]>({
        reducer: (_previous, next) => next ?? [],
        default: () => [],
      }),
      contextAddendum: Annotation<string>(),
      systemAddendum: Annotation<string>(),
    });

    return new StateGraph(StateAnnotation)
      .addNode('load_session', async (state: AssistantGraphState) => state)
      .addNode('assemble_context', async (state: AssistantGraphState) => state)
      .addNode('classify_intent', async (state: AssistantGraphState) => state)
      .addNode('route_workflow', async (state: AssistantGraphState) => state)
      .addNode('persist_session', async (state: AssistantGraphState) => state)
      .addEdge(START, 'load_session')
      .addEdge('load_session', 'assemble_context')
      .addEdge('assemble_context', 'classify_intent')
      .addEdge('classify_intent', 'route_workflow')
      .addEdge('route_workflow', 'persist_session')
      .addEdge('persist_session', END)
      .compile({ checkpointer: new MemorySaver() });
  } catch {
    return null;
  }
}

export function createAssistantChatOrchestrator(input: {
  payload: PayloadClient;
  sessionStore: SessionStore;
}): AssistantChatOrchestrator {
  const compiledGraph = createCompiledGraph();

  async function run(orchestratorInput: ChatOrchestratorInput): Promise<ChatOrchestratorResult> {
    const locator = {
      userId: orchestratorInput.metadata.userId,
      projectId: orchestratorInput.metadata.projectId,
      domain: orchestratorInput.metadata.domain,
      editorId: orchestratorInput.metadata.editorId,
    } as const;

    const session = await input.sessionStore.getOrCreateSession(locator);

    const context = await assembleAssistantContext({
      payload: input.payload,
      domain: locator.domain,
      projectId: locator.projectId,
    });

    const contextAddendum = formatAssistantContextAddendum(context);
    const intentClass = classifyIntentText(orchestratorInput.latestUserMessage, locator.domain);
    const workflowHints = routeWorkflowHints({
      intentClass,
      latestUserMessage: orchestratorInput.latestUserMessage,
      context,
    });

    const checkpoint = {
      updatedAt: new Date().toISOString(),
      lastIntent: orchestratorInput.latestUserMessage,
      lastWorkflow: intentClass,
      workflowHints,
      contextSummary: contextAddendum.slice(0, 2000),
      payload: {
        viewportId: orchestratorInput.metadata.viewportId,
      },
    };

    await input.sessionStore.saveCheckpoint({
      locator,
      checkpoint,
      summary: orchestratorInput.latestUserMessage.slice(0, 300),
      messageCountDelta: 1,
      lastModelId: orchestratorInput.selectedModelId,
    });

    const systemAddendum = buildSystemAddendum({
      threadId: session.threadId,
      intentClass,
      workflowHints,
      contextAddendum,
    });

    return {
      sessionKey: session.sessionKey,
      threadId: session.threadId,
      intentClass,
      workflowHints,
      contextAddendum,
      systemAddendum,
    };
  }

  return {
    compiledGraph,
    run,
  };
}
