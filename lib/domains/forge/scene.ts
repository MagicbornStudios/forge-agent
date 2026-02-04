/**
 * Scene model for the Forge domain.
 *
 * A Scene holds the base visual/audio properties for a graph.
 * Individual timeline nodes can override these properties via
 * SceneOverride (defined in the video domain).
 */

/** Extensible key-value properties that define a scene's state. */
export interface SceneProperties {
  background?: string;
  lighting?: 'day' | 'night' | 'dusk' | 'dawn' | 'custom';
  ambience?: string;
  music?: string;
  mood?: string;
  cameraAngle?: string;
  /** Allow arbitrary additional properties. */
  [key: string]: unknown;
}

/** A scene is associated with a graph (or a sub-section of a graph). */
export interface Scene {
  id: string;
  graphId: string | number;
  name: string;
  properties: SceneProperties;
}
