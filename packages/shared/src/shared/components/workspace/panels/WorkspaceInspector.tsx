'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { ScrollArea } from '@forge/ui/scroll-area';
import type { Selection } from '@forge/shared/workspace';
import type { InspectorSection } from '@forge/shared/workspace';

export interface WorkspaceInspectorProps {
  children?: React.ReactNode;
  /** When provided, render sections that pass when(selection). Otherwise render children. */
  selection?: Selection | null;
  sections?: InspectorSection[];
  className?: string;
}

/** Selection-driven properties panel. Composition via sections or slot. */
export function WorkspaceInspector({
  children,
  selection = null,
  sections,
  className,
}: WorkspaceInspectorProps) {
  const content =
    sections && sections.length > 0
      ? sections
          .filter((s) => s.when(selection))
          .map((s) => (
            <div key={s.id} className="mb-4">
              <h3 className="text-sm font-medium mb-2">{s.title}</h3>
              {s.render({ selection })}
            </div>
          ))
      : children;

  return (
    <aside
      className={cn(
        'flex min-w-[280px] max-w-[360px] flex-col border-l border-border bg-background',
        className
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-3">{content}</div>
      </ScrollArea>
    </aside>
  );
}
