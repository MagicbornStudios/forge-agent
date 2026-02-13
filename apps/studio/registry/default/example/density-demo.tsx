'use client';

import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';

/** Side-by-side compact vs comfortable density. */
function DensityColumn({ density }: { density: 'compact' | 'comfortable' }) {
  return (
    <div data-density={density} className="rounded-lg border border-border bg-background p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {density}
      </div>
      <div className="flex flex-col gap-2">
        <Button size="sm">Primary</Button>
        <Input placeholder="Input" className="w-full" />
      </div>
    </div>
  );
}

export function DensityDemo() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <DensityColumn density="compact" />
      <DensityColumn density="comfortable" />
    </div>
  );
}

export default DensityDemo;
