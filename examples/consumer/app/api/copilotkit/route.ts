import { createForgeCopilotRuntime } from '@forge/dev-kit';

const handler = createForgeCopilotRuntime({
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
  modelId: process.env.OPENROUTER_MODEL ?? 'openrouter/auto',
});

export { handler as POST };
