/** @jest-environment node */
import {
  getModelIds,
  setModelId,
  getCopilotModelId,
  getAssistantUiModelId,
} from '@/lib/model-router/server-state';

describe('model-router server-state', () => {
  it('getModelIds returns copilotModelId and assistantUiModelId', () => {
    const ids = getModelIds();
    expect(ids).toHaveProperty('copilotModelId');
    expect(ids).toHaveProperty('assistantUiModelId');
    expect(typeof ids.copilotModelId).toBe('string');
    expect(ids.copilotModelId.length).toBeGreaterThan(0);
    expect(typeof ids.assistantUiModelId).toBe('string');
    expect(ids.assistantUiModelId.length).toBeGreaterThan(0);
  });

  it('getCopilotModelId and getAssistantUiModelId return strings', () => {
    expect(typeof getCopilotModelId()).toBe('string');
    expect(getCopilotModelId().length).toBeGreaterThan(0);
    expect(typeof getAssistantUiModelId()).toBe('string');
    expect(getAssistantUiModelId().length).toBeGreaterThan(0);
  });

  it('setModelId updates slot and getters reflect it', () => {
    const before = getModelIds();
    const testId = 'openai/gpt-4o-mini';
    setModelId('copilot', testId);
    expect(getCopilotModelId()).toBe(testId);
    expect(getAssistantUiModelId()).toBe(before.assistantUiModelId);
    setModelId('assistantUi', testId);
    expect(getAssistantUiModelId()).toBe(testId);
    setModelId('copilot', before.copilotModelId);
    setModelId('assistantUi', before.assistantUiModelId);
  });
});
