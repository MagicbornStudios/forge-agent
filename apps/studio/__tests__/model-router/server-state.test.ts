/** @jest-environment node */
import {
  getPreferences,
  updatePreferences,
  resolvePrimaryAndFallbacks,
} from '@/lib/model-router/server-state';
import { DEFAULT_FREE_CHAT_MODEL_IDS } from '@/lib/model-router/defaults';
import { getDefaultEnabledIds } from '@/lib/model-router/registry';

describe('model-router server-state', () => {
  it('getPreferences returns an object with mode, manualModelId, enabledModelIds', () => {
    const prefs = getPreferences();
    expect(prefs).toHaveProperty('mode');
    expect(prefs).toHaveProperty('manualModelId');
    expect(prefs).toHaveProperty('enabledModelIds');
    expect(['auto', 'manual']).toContain(prefs.mode);
    expect(Array.isArray(prefs.enabledModelIds)).toBe(true);
  });

  it('updatePreferences merges patch and returns new preferences', () => {
    const before = getPreferences();
    const testId = DEFAULT_FREE_CHAT_MODEL_IDS[0] ?? 'openai/gpt-4o-mini';
    const updated = updatePreferences({
      mode: 'manual',
      manualModelId: testId,
    });
    expect(updated.mode).toBe('manual');
    expect(updated.manualModelId).toBe(testId);
    updatePreferences({ mode: before.mode, manualModelId: before.manualModelId });
  });

  it('resolvePrimaryAndFallbacks returns primary, fallbacks, and mode', () => {
    const { primary, fallbacks, mode } = resolvePrimaryAndFallbacks();
    expect(typeof primary).toBe('string');
    expect(primary.length).toBeGreaterThan(0);
    expect(Array.isArray(fallbacks)).toBe(true);
    expect(['auto', 'manual']).toContain(mode);
  });

  it('resolvePrimaryAndFallbacks in manual mode returns manual model as primary and empty fallbacks', () => {
    const testId = DEFAULT_FREE_CHAT_MODEL_IDS[0] ?? 'openai/gpt-4o-mini';
    updatePreferences({ mode: 'manual', manualModelId: testId });
    const { primary, fallbacks, mode } = resolvePrimaryAndFallbacks();
    expect(mode).toBe('manual');
    expect(primary).toBe(testId);
    expect(fallbacks).toEqual([]);
    updatePreferences({ mode: 'auto', manualModelId: null });
  });

  it('resolvePrimaryAndFallbacks in auto mode with known enabledModelIds returns first as primary and rest as fallbacks', () => {
    const chain = ['openai/gpt-4o-mini', 'meta-llama/llama-3.3-70b-instruct:free', 'qwen/qwen-2.5-72b-instruct:free'];
    updatePreferences({ mode: 'auto', manualModelId: null, enabledModelIds: chain });
    const { primary, fallbacks, mode } = resolvePrimaryAndFallbacks();
    expect(mode).toBe('auto');
    expect(primary).toBe(chain[0]);
    expect(fallbacks).toEqual(chain.slice(1));
    updatePreferences({ enabledModelIds: getDefaultEnabledIds() });
  });
});
