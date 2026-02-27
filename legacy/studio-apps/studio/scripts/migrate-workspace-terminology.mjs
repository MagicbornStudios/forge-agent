#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPayload } from 'payload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const studioRoot = path.resolve(__dirname, '..');

async function loadPayload() {
  const payloadConfig = await import(path.resolve(studioRoot, 'payload.config.ts'));
  const config = payloadConfig.default ?? payloadConfig;
  return getPayload({ config });
}

async function migrateSettingsOverrides(payload) {
  let page = 1;
  const limit = 100;
  let scanned = 0;
  let updated = 0;

  while (true) {
    const result = await payload.find({
      collection: 'settings-overrides',
      page,
      limit,
      depth: 0,
      overrideAccess: true,
    });

    const docs = result.docs ?? [];
    if (docs.length === 0) break;

    for (const doc of docs) {
      scanned += 1;
      const scope = typeof doc.scope === 'string' ? doc.scope : null;
      const scopeId = typeof doc.scopeId === 'string' ? doc.scopeId : null;

      if (scope === 'editor') {
        const nextScope = scopeId && scopeId.includes(':') ? 'viewport' : 'workspace';
        await payload.update({
          collection: 'settings-overrides',
          id: doc.id,
          data: { scope: nextScope },
          depth: 0,
          overrideAccess: true,
        });
        updated += 1;
      }
    }

    if (!result.hasNextPage) break;
    page += 1;
  }

  return { scanned, updated };
}

async function migrateAgentSessions(payload) {
  let page = 1;
  const limit = 100;
  let scanned = 0;
  let updated = 0;

  while (true) {
    const result = await payload.find({
      collection: 'agent-sessions',
      page,
      limit,
      depth: 0,
      overrideAccess: true,
    });

    const docs = result.docs ?? [];
    if (docs.length === 0) break;

    for (const doc of docs) {
      scanned += 1;

      const workspace = typeof doc.workspace === 'string' ? doc.workspace : null;
      const legacyEditor = typeof doc.editor === 'string' ? doc.editor : null;

      if (workspace == null && legacyEditor != null) {
        await payload.update({
          collection: 'agent-sessions',
          id: doc.id,
          data: { workspace: legacyEditor },
          depth: 0,
          overrideAccess: true,
        });
        updated += 1;
      }
    }

    if (!result.hasNextPage) break;
    page += 1;
  }

  return { scanned, updated };
}

async function main() {
  const payload = await loadPayload();

  const settings = await migrateSettingsOverrides(payload);
  const sessions = await migrateAgentSessions(payload);

  console.log('[migrate-workspace-terminology] settings-overrides scanned:', settings.scanned);
  console.log('[migrate-workspace-terminology] settings-overrides updated:', settings.updated);
  console.log('[migrate-workspace-terminology] agent-sessions scanned:', sessions.scanned);
  console.log('[migrate-workspace-terminology] agent-sessions updated:', sessions.updated);
}

main().catch((error) => {
  console.error('[migrate-workspace-terminology] failed:', error);
  process.exitCode = 1;
});

