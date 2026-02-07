/**
 * Notion-inspired page and block types for WriterMode.
 * Data structure aligns with Notion's API concepts; no Notion SDK or integration.
 */

import type { PageRecord, BlockRecord } from './payload';

/** Parent location: workspace (top-level), page, block, database, or data source. */
export type PageParent =
  | { type: 'workspace'; workspace: true }
  | { type: 'page_id'; page_id: string }
  | { type: 'block_id'; block_id: string }
  | { type: 'database_id'; database_id: string }
  | { type: 'data_source_id'; data_source_id: string; database_id?: string };

/** Block parent (page or block). */
export type BlockParent =
  | { type: 'page_id'; page_id: string }
  | { type: 'block_id'; block_id: string };

/** Page document from Payload (our stored shape). */
export type PageDoc = PageRecord;

/** Block document from Payload. */
export type BlockDoc = BlockRecord;

export type { PageRecord, BlockRecord } from './payload';
