'use client';

import { Database } from 'lucide-react';

/** Port Drizzle Studio runs on (started automatically with `pnpm dev`). */
const DRIZZLE_STUDIO_PORT = 4983;
const DRIZZLE_STUDIO_URL = `http://127.0.0.1:${DRIZZLE_STUDIO_PORT}`;

export function DatabasePanel() {
  return (
    <div className="flex h-full flex-col">
      <iframe
        src={DRIZZLE_STUDIO_URL}
        title="Drizzle Studio"
        className="h-full w-full min-h-0 rounded border-0"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
      <div className="flex shrink-0 items-center gap-2 border-t border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
        <Database size={12} aria-hidden />
        <span>Drizzle Studio (started with dev)</span>
      </div>
    </div>
  );
}
