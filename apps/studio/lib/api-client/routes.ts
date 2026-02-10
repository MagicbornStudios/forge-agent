/**
 * Studio custom API route paths. Single source of truth for client calls.
 * Use these constants instead of magic strings. See docs/agent-artifacts/core/standard-practices.md.
 */

export const API_ROUTES = {
  // Auth
  ME: '/api/me',

  // Settings
  SETTINGS: '/api/settings',

  // Model
  MODEL_SETTINGS: '/api/model-settings',

  // AI
  FORGE_PLAN: '/api/forge/plan',
  IMAGE_GENERATE: '/api/image-generate',
  STRUCTURED_OUTPUT: '/api/structured-output',

  // Workflows
  WORKFLOWS_RUN: '/api/workflows/run',

  // ElevenLabs
  ELEVENLABS_VOICES: '/api/elevenlabs/voices',
  ELEVENLABS_SPEECH: '/api/elevenlabs/speech',

  // Media
  MEDIA: '/api/media',
  /** Base path for file URL; append doc id: `${API_ROUTES.MEDIA_FILE(docId)}` */
  MEDIA_FILE: (id: number) => `/api/media/file/${id}`,

  // Stripe
  STRIPE_CONNECT_CREATE_ACCOUNT: '/api/stripe/connect/create-account',
  STRIPE_CONNECT_ONBOARDING_LINK: '/api/stripe/connect/onboarding-link',

  // Dev
  DEV_LOG: '/api/dev/log',

  // CopilotKit / Assistant
  COPILOTKIT: '/api/copilotkit',
  ASSISTANT_CHAT: '/api/assistant-chat',

  // Docs (Swagger)
  DOCS: '/api/docs',
} as const;
