#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPayload } from 'payload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoStudioRoot = path.resolve(__dirname, '..');

async function loadPayload() {
  const payloadConfig = await import(path.resolve(repoStudioRoot, 'payload.config.ts'));
  const config = payloadConfig.default ?? payloadConfig;
  return getPayload({ config });
}

async function migrateRepoProposals(payload) {
  let page = 1;
  const limit = 100;
  let scanned = 0;
  let updated = 0;

  while (true) {
    const result = await payload.find({
      collection: 'repo-proposals',
      page,
      limit,
      depth: 0,
      overrideAccess: true,
    });

    const docs = result.docs ?? [];
    if (docs.length === 0) break;

    for (const doc of docs) {
      scanned += 1;
      const assistantTarget = typeof doc.assistantTarget === 'string' ? doc.assistantTarget.trim() : '';
      const legacyTarget = typeof doc.editorTarget === 'string' ? doc.editorTarget.trim() : '';
      if (assistantTarget || !legacyTarget) continue;

      await payload.update({
        collection: 'repo-proposals',
        id: doc.id,
        data: {
          assistantTarget: legacyTarget,
        },
        depth: 0,
        overrideAccess: true,
      });
      updated += 1;
    }

    if (!result.hasNextPage) break;
    page += 1;
  }

  return { scanned, updated };
}

async function main() {
  const payload = await loadPayload();
  const proposals = await migrateRepoProposals(payload);
  console.log('[migrate-assistant-target] repo-proposals scanned:', proposals.scanned);
  console.log('[migrate-assistant-target] repo-proposals updated:', proposals.updated);
}

main().catch((error) => {
  console.error('[migrate-assistant-target] failed:', error);
  process.exitCode = 1;
});

