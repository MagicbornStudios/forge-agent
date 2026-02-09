/** @jest-environment node */
import {
  resolveCopilotKitModel,
  resolveAssistantChatModel,
  getRequestedModelFromAssistantChatBody,
} from '@/lib/model-router/resolve-for-routes';

const mockGetState = () => ({
  primary: 'openai/gpt-4o-mini',
  fallbacks: ['meta-llama/llama-3.3-70b-instruct:free', 'qwen/qwen-2.5-72b-instruct:free'],
  mode: 'auto',
});

describe('resolve-for-routes', () => {
  describe('resolveCopilotKitModel', () => {
    it('returns primary and fallbacks when x-forge-model is missing', () => {
      const req = new Request('http://localhost/api/copilotkit', { method: 'POST' });
      const result = resolveCopilotKitModel(req, mockGetState);
      expect(result.modelId).toBe('openai/gpt-4o-mini');
      expect(result.fallbacks).toEqual([
        'meta-llama/llama-3.3-70b-instruct:free',
        'qwen/qwen-2.5-72b-instruct:free',
      ]);
    });

    it('returns primary and fallbacks when x-forge-model is "auto"', () => {
      const req = new Request('http://localhost/api/copilotkit', {
        method: 'POST',
        headers: { 'x-forge-model': 'auto' },
      });
      const result = resolveCopilotKitModel(req, mockGetState);
      expect(result.modelId).toBe('openai/gpt-4o-mini');
      expect(result.fallbacks).toHaveLength(2);
    });

    it('returns requested model and empty fallbacks when x-forge-model is set', () => {
      const req = new Request('http://localhost/api/copilotkit', {
        method: 'POST',
        headers: { 'x-forge-model': 'anthropic/claude-3.5-sonnet' },
      });
      const result = resolveCopilotKitModel(req, mockGetState);
      expect(result.modelId).toBe('anthropic/claude-3.5-sonnet');
      expect(result.fallbacks).toEqual([]);
    });
  });

  describe('getRequestedModelFromAssistantChatBody and resolveAssistantChatModel', () => {
    it('getRequestedModelFromAssistantChatBody returns null for missing or invalid config', () => {
      expect(getRequestedModelFromAssistantChatBody(null)).toBeNull();
      expect(getRequestedModelFromAssistantChatBody(undefined)).toBeNull();
      expect(getRequestedModelFromAssistantChatBody({})).toBeNull();
      expect(getRequestedModelFromAssistantChatBody({ modelName: '' })).toBeNull();
      expect(getRequestedModelFromAssistantChatBody({ modelName: 'auto' })).toBeNull();
      expect(getRequestedModelFromAssistantChatBody({ modelName: 123 })).toBeNull();
    });

    it('getRequestedModelFromAssistantChatBody returns trimmed model name', () => {
      expect(getRequestedModelFromAssistantChatBody({ modelName: ' openai/gpt-4o ' })).toBe(
        'openai/gpt-4o',
      );
    });

    it('resolveAssistantChatModel returns primary and fallbacks when body.config has no modelName', () => {
      const body = { messages: [], config: {} };
      const result = resolveAssistantChatModel(body, mockGetState);
      expect(result.primary).toBe('openai/gpt-4o-mini');
      expect(result.fallbacks).toHaveLength(2);
    });

    it('resolveAssistantChatModel returns requested model and empty fallbacks when config.modelName is set', () => {
      const body = { messages: [], config: { modelName: 'anthropic/claude-3.5-sonnet' } };
      const result = resolveAssistantChatModel(body, mockGetState);
      expect(result.primary).toBe('anthropic/claude-3.5-sonnet');
      expect(result.fallbacks).toEqual([]);
    });
  });
});
