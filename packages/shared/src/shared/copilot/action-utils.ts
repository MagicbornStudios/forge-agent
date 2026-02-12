/**
 * Minimal action utilities for domain actions.
 * CopilotKit removed; these types support legacy domain copilot code (e.g. createForgeActions)
 * that may still be referenced by tests. No @copilotkit deps.
 */

/** Prefix an action name with the domain (e.g. forge_createNode). */
export function createDomainAction<T extends { name: string }>(
  domain: string,
  action: T
): T {
  return { ...action, name: `${domain}_${action.name}` };
}
