import {
  getPreferences,
  updatePreferences,
  resolvePrimaryAndFallbacks,
  resolveModel,
} from '@/lib/model-router/server-state';
import { MODEL_REGISTRY } from '@/lib/model-router/registry';

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
    const updated = updatePreferences({
      mode: 'manual',
      manualModelId: MODEL_REGISTRY[0]?.id ?? 'test',
    });
    expect(updated.mode).toBe('manual');
    expect(updated.manualModelId).toBe(MODEL_REGISTRY[0]?.id ?? 'test');
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
    const firstId = MODEL_REGISTRY[0]?.id;
    if (!firstId) return;
    updatePreferences({ mode: 'manual', manualModelId: firstId });
    const { primary, fallbacks, mode } = resolvePrimaryAndFallbacks();
    expect(mode).toBe('manual');
    expect(primary).toBe(firstId);
    expect(fallbacks).toEqual([]);
    updatePreferences({ mode: 'auto', manualModelId: null });
  });

  it('resolveModel (deprecated) returns modelId and mode', () => {
    const { modelId, mode } = resolveModel();
    expect(typeof modelId).toBe('string');
    expect(modelId.length).toBeGreaterThan(0);
    expect(['auto', 'manual']).toContain(mode);
  });
});
