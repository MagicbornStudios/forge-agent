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

/** Collection slug for projects (Payload REST: /api/projects). */
export const PROJECTS_SLUG = 'projects';

/** Collection slug for characters (Payload REST: /api/characters). */
export const CHARACTERS_SLUG = 'characters';

/** Collection slug for character relationships (Payload REST: /api/relationships). */
export const RELATIONSHIPS_SLUG = 'relationships';

/** Collection slug for media uploads (Payload REST: /api/media). */
export const MEDIA_SLUG = 'media';

/** Collection slug for WriterMode pages (Payload REST: /api/pages). */
export const PAGES_SLUG = 'pages';

/** Collection slug for WriterMode blocks (Payload REST: /api/blocks). */
export const BLOCKS_SLUG = 'blocks';
