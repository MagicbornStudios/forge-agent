'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@forge/ui/lib/utils';
import { List } from 'lucide-react';

export type TableOfContents = Array<{ title: string; url: string; depth: number }>;

export function RightToc({ toc }: { toc: TableOfContents }) {
  const [activeHash, setActiveHash] = React.useState<string>('');

  React.useEffect(() => {
    const setFromHash = () => setActiveHash(window.location.hash);
    setFromHash();
    window.addEventListener('hashchange', setFromHash);
    return () => window.removeEventListener('hashchange', setFromHash);
  }, []);

  if (!toc || toc.length === 0) return null;
  return (
    <aside
      className="hidden xl:block w-64 shrink-0 border-l border-border/70 bg-background/40"
      aria-label="On this page"
    >
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto px-5 py-6">
        <nav className="relative flex flex-col gap-1 pl-3 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-px before:bg-border/70">
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <List className="size-3.5" />
            On this page
          </p>
          {toc.map((item) => {
            const isActive = activeHash.length > 0 && activeHash === item.url;
            const depthOffset = Math.max(0, item.depth - 2) * 12;
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  'block rounded-sm px-2 py-1 text-sm transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                style={{ marginLeft: `${depthOffset}px` }}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
