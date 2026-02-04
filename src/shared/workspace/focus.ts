/**
 * Shared focus model. Chat can request "focus viewport" or "focus inspector" without
 * caring about editor internals. Store in each workspace viewState slice (consistent field name).
 */

export type FocusTarget =
  | 'chat'
  | 'viewport'
  | 'inspector'
  | { custom: string };

export function focusTargetToString(target: FocusTarget): string {
  if (typeof target === 'string') return target;
  return target.custom;
}
