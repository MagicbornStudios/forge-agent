export const CAPABILITIES = {
  STUDIO_AI_CHAT: 'studio.ai.chat',
  STUDIO_AI_TOOLS: 'studio.ai.tools',
  STUDIO_MODELS_PAID: 'studio.models.paid',
  STUDIO_AI_ATTACHMENTS: 'studio.ai.attachments',
  STUDIO_AI_DICTATION: 'studio.ai.dictation',
  STUDIO_AI_VOICE_MODE: 'studio.ai.voiceMode',
  STUDIO_VIDEO_EDITOR: 'studio.video.editor',
  STUDIO_STRATEGY_EDITOR: 'studio.strategy.editor',
  FORGE_AI_EDIT: 'forge.ai.edit',
  VIDEO_EXPORT: 'video.export',
  IMAGE_GENERATION: 'studio.ai.imageGeneration',
  // Platform: gate who can list, publish, and monetize (Pro plan). PLATFORM_LIST = create listings; PLATFORM_PUBLISH = set listing status to published; PLATFORM_MONETIZE = set listing price > 0.
  PLATFORM_PUBLISH: 'platform.publish',
  PLATFORM_LIST: 'platform.list',
  PLATFORM_MONETIZE: 'platform.monetize',
} as const;

export type CapabilityId = typeof CAPABILITIES[keyof typeof CAPABILITIES];
