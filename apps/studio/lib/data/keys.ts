/**
 * Centralized query keys with service namespaces.
 * Use for cache identity and invalidation; see docs/agent-artifacts/core/decisions.md and plan Slice C.
 */

export const studioKeys = {
  graphs: () => ['studio', 'graphs'] as const,
  graph: (id: number) => ['studio', 'graph', id] as const,
  forgeGraphs: (projectId: number, kind: string) => ['studio', 'forge-graphs', projectId, kind] as const,
  forgeGraph: (id: number) => ['studio', 'forge-graph', id] as const,
  videoDocs: () => ['studio', 'video-docs'] as const,
  videoDoc: (id: number) => ['studio', 'video-doc', id] as const,
  settingsOverrides: () => ['studio', 'settings-overrides'] as const,
  projects: (domain?: string) => ['studio', 'projects', domain ?? 'all'] as const,
  characters: (projectId: number) => ['studio', 'characters', projectId] as const,
  character: (id: number) => ['studio', 'character', id] as const,
  relationships: (projectId: number) => ['studio', 'relationships', projectId] as const,
  characterProjects: () => ['studio', 'character-projects'] as const,
  pages: (projectId: number) => ['studio', 'pages', projectId] as const,
  page: (id: number) => ['studio', 'page', id] as const,
  blocks: (pageId: number, parentBlockId?: number) =>
    ['studio', 'blocks', pageId, parentBlockId ?? null] as const,
  block: (id: number) => ['studio', 'block', id] as const,
  elevenlabsVoices: () => ['studio', 'elevenlabs', 'voices'] as const,
  // AI generation mutation keys
  generateImage: () => ['studio', 'ai', 'generate-image'] as const,
  structuredOutput: () => ['studio', 'ai', 'structured-output'] as const,
  createForgePlan: () => ['studio', 'ai', 'forge-plan'] as const,
  generateVideo: () => ['studio', 'ai', 'generate-video'] as const,
};

export const platformKeys = {
  pricing: () => ['platform', 'pricing'] as const,
};

export const authKeys = {
  me: () => ['auth', 'me'] as const,
};
