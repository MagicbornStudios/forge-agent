import {
  getPreferences,
  updatePreferences,
  resolveModel,
  getHealthSnapshot,
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
    const updated = updatePreferences({ mode: 'manual', manualModelId: MODEL_REGISTRY[0]?.id ?? 'test' });
    expect(updated.mode).toBe('manual');
    expect(updated.manualModelId).toBe(MODEL_REGISTRY[0]?.id ?? 'test');
    updatePreferences({ mode: before.mode, manualModelId: before.manualModelId });
  });

  it('resolveModel returns modelId and mode', () => {
    const { modelId, mode } = resolveModel();
    expect(typeof modelId).toBe('string');
    expect(modelId.length).toBeGreaterThan(0);
    expect(['auto', 'manual']).toContain(mode);
  });

  it('resolveModel in manual mode returns manual model id', () => {
    const firstId = MODEL_REGISTRY[0]?.id;
    if (!firstId) return;
    updatePreferences({ mode: 'manual', manualModelId: firstId });
    const { modelId, mode } = resolveModel();
    expect(mode).toBe('manual');
    expect(modelId).toBe(firstId);
    updatePreferences({ mode: 'auto', manualModelId: null });
  });

  it('getHealthSnapshot returns a record of model health', () => {
    const health = getHealthSnapshot();
    expect(typeof health).toBe('object');
    expect(health !== null && !Array.isArray(health)).toBe(true);
  });
});
