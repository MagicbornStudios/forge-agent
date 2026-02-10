/** @jest-environment node */

import type { ModelDef } from '@/lib/model-router/types';
import { getDefaultChatModelId } from '@/lib/model-router/defaults';
import { resolveModelIdFromRegistry } from '@/lib/model-router/selection';

const MODELS: ModelDef[] = [
  {
    id: getDefaultChatModelId(),
    label: 'Default free',
    provider: 'openai',
    tier: 'free',
    speed: 'standard',
    supportsTools: true,
    supportsResponsesV2: true,
    enabledByDefault: false,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    label: 'Llama 3.3 70B',
    provider: 'meta-llama',
    tier: 'free',
    speed: 'standard',
    supportsTools: true,
    supportsResponsesV2: null,
    enabledByDefault: false,
  },
  {
    id: 'google/gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'google',
    tier: 'paid',
    speed: 'standard',
    supportsTools: true,
    supportsResponsesV2: false,
    enabledByDefault: false,
  },
];

describe('model-router selection helper', () => {
  it('keeps selected model when present in registry', () => {
    expect(resolveModelIdFromRegistry('google/gemini-2.5-flash', MODELS)).toBe(
      'google/gemini-2.5-flash',
    );
  });

  it('falls back to responses-v2 model for copilot-required path', () => {
    expect(
      resolveModelIdFromRegistry('google/gemini-2.0-flash-exp:free', MODELS, {
        requireResponsesV2: true,
      }),
    ).toBe(getDefaultChatModelId());
  });

  it('falls back to default/free model when selected model is missing', () => {
    expect(resolveModelIdFromRegistry('google/gemini-2.0-flash-exp:free', MODELS)).toBe(
      getDefaultChatModelId(),
    );
  });
});
