/**
 * Studio API client. Collection CRUD uses Payload SDK (payloadSdk); custom endpoints
 * use the OpenAPI-generated services (Auth, Settings, Model, AI). SSE (e.g. workflows)
 * is handled manually in lib/api-client/workflows.ts. Use the hooks in ./hooks for
 * server state; do not add hand-rolled fetch for /api/*.
 */

export { payloadSdk, FORGE_GRAPHS_SLUG, VIDEO_DOCS_SLUG } from '@/lib/api-client/payload-sdk';
export { streamWorkflowRun } from '@/lib/api-client/workflows';
export {
  AuthService,
  SettingsService,
  ModelService,
  AiService,
  OpenAPI,
  ApiError,
} from '@/lib/api-client';
export type { OpenAPIConfig } from '@/lib/api-client';

/** Type aliases for app use; payload-types also define these. */
export type ForgeGraphDoc = {
  id: number;
  title: string;
  flow: unknown;
  createdAt?: string;
  updatedAt?: string;
};

export type VideoDocRecord = {
  id: number;
  title: string;
  graphId?: string | null;
  doc: unknown;
  createdAt?: string;
  updatedAt?: string;
};

export type StudioUser = {
  id: number | string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  plan?: string | null;
};

export type StudioMeResponse = {
  user: StudioUser | null;
};
