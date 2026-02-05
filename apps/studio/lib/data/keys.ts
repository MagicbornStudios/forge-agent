/**
 * Centralized query keys with service namespaces.
 * Use for cache identity and invalidation; see docs/agent-artifacts/core/decisions.md and plan Slice C.
 */

export const studioKeys = {
  graphs: () => ['studio', 'graphs'] as const,
  graph: (id: number) => ['studio', 'graph', id] as const,
  videoDocs: () => ['studio', 'video-docs'] as const,
  videoDoc: (id: number) => ['studio', 'video-doc', id] as const,
  settingsOverrides: () => ['studio', 'settings-overrides'] as const,
};

export const platformKeys = {
  pricing: () => ['platform', 'pricing'] as const,
};

export const authKeys = {
  me: () => ['auth', 'me'] as const,
};
