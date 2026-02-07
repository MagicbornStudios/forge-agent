'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { ScrollArea } from '@forge/ui/scroll-area';
import type { Selection, InspectorSection } from '../../workspace';

export interface EditorInspectorProps {
  children?: React.ReactNode;
  /** When provided, render sections that pass when(selection). Otherwise render children. */
  selection?: Selection | null;
  sections?: InspectorSection[];
  className?: string;
}

/** Selection-driven properties panel. Composition via sections or slot. */
export function EditorInspector({
  children,
  selection = null,
  sections,
  className,
}: EditorInspectorProps) {
  const content =
    sections && sections.length > 0
      ? sections
          .filter((s) => s.when(selection))
          .map((s) => (
            <div key={s.id} className="mb-4 last:mb-0">
              <h3 className="text-sm font-medium mb-2 text-foreground">{s.title}</h3>
              {s.render({ selection })}
            </div>
          ))
      : children;

  return (
    <aside
      className={cn(
        'flex min-w-[280px] max-w-[360px] flex-col border-l border-border bg-background',
        className,
      )}
    >
      <ScrollArea className="h-full">
        <div className="p-[var(--panel-padding)]">{content}</div>
      </ScrollArea>
    </aside>
  );
}
