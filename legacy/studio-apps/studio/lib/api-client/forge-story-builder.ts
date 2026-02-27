import { API_ROUTES } from './routes';

export interface ForgeStoryBuilderRequest {
  premise: string;
  characterCount?: number;
  sceneCount?: number;
}

export interface ForgeStoryBuilderResponse {
  steps: Record<string, unknown>[];
  characters: Array<{ name: string; description?: string; personality?: string }>;
  scenes: Array<{ title: string; speaker: string; dialogue: string }>;
  summary: string;
}

async function readJsonOrThrow(
  response: Response,
): Promise<Record<string, unknown>> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof payload?.error === 'string' && payload.error.trim().length > 0
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return payload as Record<string, unknown>;
}

export async function createForgeStoryFromPremise(
  request: ForgeStoryBuilderRequest,
): Promise<ForgeStoryBuilderResponse> {
  const response = await fetch(API_ROUTES.FORGE_STORY_BUILDER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  const payload = await readJsonOrThrow(response);
  return {
    steps: Array.isArray(payload?.steps) ? payload.steps : [],
    characters: Array.isArray(payload?.characters) ? payload.characters : [],
    scenes: Array.isArray(payload?.scenes) ? payload.scenes : [],
    summary: typeof payload?.summary === 'string' ? payload.summary : 'Story scaffold created.',
  };
}
