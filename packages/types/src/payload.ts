import type { Config } from './payload-types';

export type PayloadCollections = Config['collections'];

export type ForgeGraphRecord = PayloadCollections['forge-graphs'];
export type VideoDocRecord = PayloadCollections['video-docs'];
export type SettingsSnapshotRecord = PayloadCollections['settings-snapshots'];
export type AgentSessionRecord = PayloadCollections['agent-sessions'];
