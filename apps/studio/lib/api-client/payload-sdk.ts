/**
 * Payload REST API client (Option A). Used for collection CRUD only.
 * Custom endpoints (auth, settings, AI, SSE) are handled manually (AuthService,
 * SettingsService, AiService, workflows.ts, etc.).
 */

import { PayloadSDK } from '@payloadcms/sdk';
import type { Config } from '@forge/types';

export const payloadSdk = new PayloadSDK<Config>({
  baseURL: typeof window !== 'undefined' ? '/api' : process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api` : 'http://localhost:3000/api',
  baseInit: { credentials: 'include' },
});

/** Collection slug for forge graphs (Payload REST: /api/forge-graphs). */
export const FORGE_GRAPHS_SLUG = 'forge-graphs';

/** Collection slug for video docs (Payload REST: /api/video-docs). */
export const VIDEO_DOCS_SLUG = 'video-docs';
