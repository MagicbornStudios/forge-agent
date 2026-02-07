import type { Config } from './payload-types';

export type { Config };
export type PayloadCollections = Config['collections'];

export type UserRecord = PayloadCollections['users'];
export type ProjectRecord = PayloadCollections['projects'];
export type ForgeGraphRecord = PayloadCollections['forge-graphs'];
export type VideoDocRecord = PayloadCollections['video-docs'];
export type SettingsOverrideRecord = PayloadCollections['settings-overrides'];
export type AgentSessionRecord = PayloadCollections['agent-sessions'];
export type CharacterRecord = PayloadCollections['characters'];
export type RelationshipRecord = PayloadCollections['relationships'];
export type MediaRecord = PayloadCollections['media'];
export type PageRecord = PayloadCollections['pages'];
export type BlockRecord = PayloadCollections['blocks'];
