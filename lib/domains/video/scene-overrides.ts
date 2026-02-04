import type { SceneProperties } from '../forge/scene';

/**
 * A timeline node can override specific scene properties at a point in time.
 *
 * Each override is tied to a forge graph node (via `nodeId`) and specifies
 * a single property to change. Multiple overrides can stack.
 */
export interface SceneOverride {
  /** The forge graph node this override is tied to. */
  nodeId: string;
  /** Key in SceneProperties to override. */
  property: string;
  /** Override value. */
  value: unknown;
  /** When the override starts (in timeline time units). Defaults to 0. */
  startTime?: number;
  /** When the override ends (in timeline time units). Defaults to Infinity. */
  endTime?: number;
  /** Optional transition easing (e.g. 'linear', 'ease-in-out'). */
  easing?: string;
}

/**
 * Resolve the effective scene properties at a given point in time.
 *
 * Starts with the base scene properties and layers all active overrides
 * on top (in array order -- later overrides win for the same property).
 */
export function resolveSceneAtTime(
  base: SceneProperties,
  overrides: SceneOverride[],
  time: number,
): SceneProperties {
  const result = { ...base };
  for (const override of overrides) {
    const start = override.startTime ?? 0;
    const end = override.endTime ?? Infinity;
    if (time >= start && time <= end) {
      result[override.property] = override.value;
    }
  }
  return result;
}
