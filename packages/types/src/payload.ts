import type { Config } from './payload-types';

export type { Config };
export type PayloadCollections = Config['collections'];

export type UserRecord = PayloadCollections['users'];
export type ProjectRecord = PayloadCollections['projects'];
export type ForgeGraphRecord = PayloadCollections['forge-graphs'];
export type VideoDocRecord = PayloadCollections['video-docs'];
export type SettingsOverrideRecord = PayloadCollections['settings-overrides'];
export type AgentSessionRecord = PayloadCollections['agent-sessions'];
