// Public API (shared types and registry -- safe for client + server)
export * from './types';
export { MODEL_REGISTRY, getModelDef, getToolCapableModels, getDefaultEnabledIds } from './registry';
export { autoSelectModel, createHealth, isInCooldown, recordError, recordSuccess } from './auto-switch';
