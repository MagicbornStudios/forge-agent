import {
  createHealth,
  recordError,
  recordSuccess,
  isInCooldown,
  autoSelectModel,
} from '@/lib/model-router/auto-switch';
import type { ModelDef, ModelHealth } from '@/lib/model-router/types';

const FREE_MODEL: ModelDef = {
  id: 'free/model',
  label: 'Free',
  tier: 'free',
  speed: 'fast',
  supportsTools: true,
  enabledByDefault: true,
};

const PAID_MODEL: ModelDef = {
  id: 'paid/model',
  label: 'Paid',
  tier: 'paid',
  speed: 'fast',
  supportsTools: true,
  enabledByDefault: false,
};

describe('auto-switch', () => {
  describe('createHealth', () => {
    it('returns health with zero error count and no cooldown', () => {
      const h = createHealth('model-1');
      expect(h.modelId).toBe('model-1');
      expect(h.errorCount).toBe(0);
      expect(h.lastErrorAt).toBeNull();
      expect(h.cooldownUntil).toBeNull();
    });
  });

  describe('recordError', () => {
    it('increments error count and sets cooldown after threshold', () => {
      const h = createHealth('m');
      const next = recordError(h);
      expect(next.errorCount).toBe(1);
      expect(next.cooldownUntil).not.toBeNull();
      expect(next.cooldownUntil! > Date.now()).toBe(true);
    });

    it('increases cooldown on repeated errors', () => {
      let h = createHealth('m');
      h = recordError(h);
      const firstCooldown = h.cooldownUntil!;
      h = recordError(h);
      expect(h.errorCount).toBe(2);
      expect(h.cooldownUntil! >= firstCooldown).toBe(true);
    });
  });

  describe('recordSuccess', () => {
    it('resets error count and cooldown', () => {
      let h = createHealth('m');
      h = recordError(h);
      expect(h.errorCount).toBe(1);
      h = recordSuccess(h);
      expect(h.errorCount).toBe(0);
      expect(h.cooldownUntil).toBeNull();
      expect(h.lastErrorAt).toBeNull();
      expect(h.lastSuccessAt).not.toBeNull();
    });
  });

  describe('isInCooldown', () => {
    it('returns false when cooldownUntil is null', () => {
      const h = createHealth('m');
      expect(isInCooldown(h)).toBe(false);
    });

    it('returns true when cooldownUntil is in the future', () => {
      const h: ModelHealth = {
        ...createHealth('m'),
        cooldownUntil: Date.now() + 60_000,
      };
      expect(isInCooldown(h)).toBe(true);
    });

    it('returns false when cooldownUntil is in the past', () => {
      const h: ModelHealth = {
        ...createHealth('m'),
        cooldownUntil: Date.now() - 1000,
      };
      expect(isInCooldown(h)).toBe(false);
    });
  });

  describe('autoSelectModel', () => {
    const registry: ModelDef[] = [FREE_MODEL, PAID_MODEL];
    const enabledIds = [FREE_MODEL.id, PAID_MODEL.id];

    it('returns first available enabled model when none in cooldown', () => {
      const health: Record<string, ModelHealth> = {};
      const selected = autoSelectModel(registry, enabledIds, health);
      expect(selected).not.toBeNull();
      expect(selected!.id).toBe(FREE_MODEL.id);
    });

    it('prefers free over paid when both available', () => {
      const health: Record<string, ModelHealth> = {};
      const selected = autoSelectModel(registry, enabledIds, health);
      expect(selected!.tier).toBe('free');
    });

    it('skips models in cooldown and returns next available', () => {
      const now = Date.now();
      const health: Record<string, ModelHealth> = {
        [FREE_MODEL.id]: {
          ...createHealth(FREE_MODEL.id),
          cooldownUntil: now + 60_000,
        },
      };
      const selected = autoSelectModel(registry, enabledIds, health, now);
      expect(selected).not.toBeNull();
      expect(selected!.id).toBe(PAID_MODEL.id);
    });

    it('when all in cooldown returns model expiring soonest', () => {
      const now = Date.now();
      const health: Record<string, ModelHealth> = {
        [FREE_MODEL.id]: {
          ...createHealth(FREE_MODEL.id),
          cooldownUntil: now + 100_000,
        },
        [PAID_MODEL.id]: {
          ...createHealth(PAID_MODEL.id),
          cooldownUntil: now + 5_000,
        },
      };
      const selected = autoSelectModel(registry, enabledIds, health, now);
      expect(selected).not.toBeNull();
      expect(selected!.id).toBe(PAID_MODEL.id);
    });

    it('returns null when no enabled tool-capable models', () => {
      const selected = autoSelectModel(registry, [], {});
      expect(selected).toBeNull();
    });

    it('filters to enabled ids only', () => {
      const selected = autoSelectModel(
        registry,
        [PAID_MODEL.id],
        {},
      );
      expect(selected).not.toBeNull();
      expect(selected!.id).toBe(PAID_MODEL.id);
    });
  });
});
