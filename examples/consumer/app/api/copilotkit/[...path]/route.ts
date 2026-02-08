import { createForgeCopilotRuntime } from '@forge/shared/copilot/next/runtime';

const handler = createForgeCopilotRuntime({
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
  modelId: process.env.OPENROUTER_MODEL ?? 'openrouter/auto',
});

export { handler as POST, handler as GET };
