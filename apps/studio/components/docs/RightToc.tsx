'use client';

import Link from 'next/link';
import { cn } from '@forge/ui/lib/utils';

export type TableOfContents = Array<{ title: string; url: string; depth: number }>;

export function RightToc({ toc }: { toc: TableOfContents }) {
  if (!toc || toc.length === 0) return null;
  return (
    <aside
      className="hidden xl:block w-52 shrink-0 sticky top-14 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto py-6 pl-4 border-l border-border"
      aria-label="On this page"
    >
      <nav className="flex flex-col gap-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          On this page
        </p>
        {toc.map((item) => (
          <Link
            key={item.url}
            href={item.url}
            className={cn(
              'block text-sm text-muted-foreground hover:text-foreground transition-colors',
              item.depth === 3 && 'pl-3'
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
