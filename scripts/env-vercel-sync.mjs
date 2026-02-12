#!/usr/bin/env node

/**
 * One-shot Vercel env sync from local .env.local files.
 * Reads .env.vercel.local for token and project IDs.
 * Never logs plaintext secrets.
 */

import process from 'node:process';
import { runSync } from './env/vercel-sync.mjs';
import { parseArgs } from './env/lib.mjs';

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const targets = options.targets
    ? String(options.targets)
        .split(',')
        .map((t) => t.trim())
        .filter((t) => ['production', 'preview'].includes(t))
    : undefined;

  try {
    const result = await runSync({ targets });
    let ok = true;
    for (const [app, data] of Object.entries(result)) {
      console.log(`[env:sync:vercel] ${app} (${data.project}):`);
      for (const r of data.results) {
        const status = r.ok ? 'ok' : 'fail';
        console.log(`  ${r.key}: ${status}${r.ok ? '' : ' ' + r.message}`);
        if (!r.ok) ok = false;
      }
    }
    process.exit(ok ? 0 : 1);
  } catch (err) {
    console.error('[env:sync:vercel]', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
