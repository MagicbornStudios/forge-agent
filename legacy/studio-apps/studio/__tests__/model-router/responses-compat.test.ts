/** @jest-environment node */
import { classifyResponsesV2Compatibility } from '@/lib/model-router/responses-compat';

describe('responses-compat classifyResponsesV2Compatibility', () => {
  it('returns true for known compatible IDs', () => {
    expect(classifyResponsesV2Compatibility('openai/gpt-4o')).toBe(true);
    expect(classifyResponsesV2Compatibility('openai/gpt-4o-mini')).toBe(true);
    expect(classifyResponsesV2Compatibility('deepseek/deepseek-chat')).toBe(true);
    expect(classifyResponsesV2Compatibility('meta-llama/llama-3.3-70b-instruct')).toBe(true);
  });

  it('returns true for openai/ prefix', () => {
    expect(classifyResponsesV2Compatibility('openai/gpt-4o-nano')).toBe(true);
  });

  it('returns false for google/gemini and anthropic/claude prefixes', () => {
    expect(classifyResponsesV2Compatibility('google/gemini-2.0-flash-exp:free')).toBe(false);
    expect(classifyResponsesV2Compatibility('anthropic/claude-3.5-sonnet')).toBe(false);
  });

  it('returns null for empty or unknown model IDs', () => {
    expect(classifyResponsesV2Compatibility('')).toBe(null);
    expect(classifyResponsesV2Compatibility('qwen/qwen-2.5-72b-instruct:free')).toBe(null);
    expect(classifyResponsesV2Compatibility('mistralai/mistral-small')).toBe(null);
  });
});
