/**
 * Studio API client. All HTTP is done via the OpenAPI-generated client.
 * Use the hooks in ./hooks (useGraphs, useGraph, useSaveGraph, useCreateGraph, etc.)
 * or the generated services directly. Do not add hand-rolled fetch here.
 */

export {
  GraphsService,
  VideoDocsService,
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
