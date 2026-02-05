export const CAPABILITIES = {
  STUDIO_AI_CHAT: 'studio.ai.chat',
  STUDIO_AI_TOOLS: 'studio.ai.tools',
  STUDIO_MODELS_PAID: 'studio.models.paid',
  FORGE_AI_EDIT: 'forge.ai.edit',
  VIDEO_EXPORT: 'video.export',
  IMAGE_GENERATION: 'studio.ai.imageGeneration',
} as const;

export type CapabilityId = typeof CAPABILITIES[keyof typeof CAPABILITIES];
