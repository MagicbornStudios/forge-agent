import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createOpenRouterChatModel, invokeText } from '../model/chat-openrouter';

export interface StoryBuilderCharacter {
  name: string;
  description: string;
  personality?: string;
}

export interface StoryBuilderScene {
  title: string;
  speaker: string;
  dialogue: string;
}

export interface ForgeStoryBuilderInput {
  premise: string;
  characterCount?: number;
  sceneCount?: number;
  openRouterApiKey: string;
  openRouterBaseUrl: string;
  modelId: string;
  headers?: Record<string, string>;
}

export interface ForgeStoryBuilderOutput {
  steps: Record<string, unknown>[];
  characters: StoryBuilderCharacter[];
  scenes: StoryBuilderScene[];
  summary: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildFallbackCharacters(premise: string, count: number): StoryBuilderCharacter[] {
  const seed = premise.trim().split(/\s+/).slice(0, 2).join(' ') || 'Story';
  return Array.from({ length: count }, (_, index) => ({
    name: `${seed} Character ${index + 1}`,
    description: `Main cast member ${index + 1} for the premise: ${premise}`,
    personality: index % 2 === 0 ? 'Bold and impulsive' : 'Thoughtful and strategic',
  }));
}

function buildFallbackScenes(premise: string, count: number, characters: StoryBuilderCharacter[]): StoryBuilderScene[] {
  return Array.from({ length: count }, (_, index) => {
    const speaker = characters[index % characters.length]?.name ?? 'Narrator';
    return {
      title: `Scene ${index + 1}`,
      speaker,
      dialogue: `${speaker}: ${premise}. Beat ${index + 1} advances the story.`,
    };
  });
}

function structureToSteps(scenes: StoryBuilderScene[]): Record<string, unknown>[] {
  const steps: Record<string, unknown>[] = [];
  const nodeIds: string[] = [];

  for (let i = 0; i < scenes.length; i += 1) {
    const scene = scenes[i];
    const nodeId = `story_scene_${i + 1}`;
    nodeIds.push(nodeId);

    steps.push({
      type: 'createNode',
      id: nodeId,
      nodeType: 'CHARACTER',
      label: scene.title,
      speaker: scene.speaker,
      content: scene.dialogue,
      x: 160 + i * 260,
      y: 180,
    });
  }

  for (let i = 0; i < nodeIds.length - 1; i += 1) {
    steps.push({
      type: 'createEdge',
      source: nodeIds[i],
      target: nodeIds[i + 1],
    });
  }

  return steps;
}

function fallbackOutput(input: ForgeStoryBuilderInput): ForgeStoryBuilderOutput {
  const characterCount = clamp(input.characterCount ?? 3, 2, 8);
  const sceneCount = clamp(input.sceneCount ?? 5, 3, 12);
  const characters = buildFallbackCharacters(input.premise, characterCount);
  const scenes = buildFallbackScenes(input.premise, sceneCount, characters);

  return {
    steps: structureToSteps(scenes),
    characters,
    scenes,
    summary: `Created story scaffold with ${characters.length} characters and ${scenes.length} scenes.`,
  };
}

function parseStoryBuilderCharacter(value: unknown): StoryBuilderCharacter | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.name !== 'string') return null;

  const description =
    typeof record.description === 'string' ? record.description : '';
  const personality =
    typeof record.personality === 'string' ? record.personality : undefined;

  if (personality) {
    return {
      name: record.name,
      description,
      personality,
    };
  }

  return {
    name: record.name,
    description,
  };
}

function parseStoryBuilderScene(
  value: unknown,
  fallbackSpeaker: string,
): StoryBuilderScene | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.title !== 'string') return null;

  return {
    title: record.title,
    speaker: typeof record.speaker === 'string' ? record.speaker : fallbackSpeaker,
    dialogue: typeof record.dialogue === 'string' ? record.dialogue : '',
  };
}

export async function runForgeStoryBuilderWorkflow(
  input: ForgeStoryBuilderInput,
): Promise<ForgeStoryBuilderOutput> {
  if (!input.premise.trim()) return fallbackOutput({ ...input, premise: 'Untitled premise' });

  const model = createOpenRouterChatModel({
    apiKey: input.openRouterApiKey,
    baseURL: input.openRouterBaseUrl,
    model: input.modelId,
    headers: input.headers,
    temperature: 0.7,
  });

  const characterCount = clamp(input.characterCount ?? 3, 2, 8);
  const sceneCount = clamp(input.sceneCount ?? 5, 3, 12);

  const system = new SystemMessage(
    'You generate story scaffolds for dialogue graphs. Return ONLY JSON with keys ' +
      '{"summary", "characters", "scenes"}. characters: [{name,description,personality}], ' +
      'scenes: [{title,speaker,dialogue}].'
  );

  const user = new HumanMessage(
    `Premise: ${input.premise}\nCharacter count: ${characterCount}\nScene count: ${sceneCount}`
  );

  try {
    const raw = await invokeText({ model, messages: [system, user] });
    const parsed = JSON.parse(raw) as {
      summary?: unknown;
      characters?: unknown[];
      scenes?: unknown[];
    };

    const characters = Array.isArray(parsed.characters)
      ? parsed.characters
          .map(parseStoryBuilderCharacter)
          .filter((item): item is StoryBuilderCharacter => item != null)
      : [];

    const scenes = Array.isArray(parsed.scenes)
      ? parsed.scenes
          .map((item) =>
            parseStoryBuilderScene(item, characters[0]?.name ?? 'Narrator'),
          )
          .filter((item): item is StoryBuilderScene => item != null)
      : [];

    if (characters.length === 0 || scenes.length === 0) {
      return fallbackOutput(input);
    }

    return {
      steps: structureToSteps(scenes),
      characters,
      scenes,
      summary:
        typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
          ? parsed.summary
          : `Created story scaffold with ${characters.length} characters and ${scenes.length} scenes.`,
    };
  } catch {
    return fallbackOutput(input);
  }
}
