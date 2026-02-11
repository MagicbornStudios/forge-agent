'use client';

import * as React from 'react';
import Link from 'next/link';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TableOfContents = Array<{ title: string; url: string; depth: number }>;

function headingIdFromUrl(url: string): string {
  const raw = url.replace(/^#/, '');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function RightToc({ toc }: { toc: TableOfContents }) {
  const [activeHash, setActiveHash] = React.useState<string>('');

  React.useEffect(() => {
    if (!toc.length) return;

    const threshold = 112;
    const updateActive = () => {
      let active = '';
      for (const item of toc) {
        const element = document.getElementById(headingIdFromUrl(item.url));
        if (!element) continue;
        const top = element.getBoundingClientRect().top;
        if (top <= threshold) active = item.url;
      }
      if (!active) active = toc[0]?.url ?? '';
      setActiveHash(active);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [toc]);

  if (!toc.length) return null;

  return (
    <aside className="platform-docs-toc hidden shrink-0 border-l border-border/70 lg:block" aria-label="On this page">
      <div className="platform-docs-toc-inner sticky top-[var(--docs-header-height)] max-h-[calc(100vh-var(--docs-header-height))] overflow-y-auto">
        <nav className="platform-docs-toc-nav">
          <p className="platform-docs-toc-title">
            <List className="size-3.5" />
            On this page
          </p>
          {toc.map((item) => {
            const isActive = activeHash === item.url;
            const depthOffset = Math.max(0, item.depth - 2) * 14;
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  'platform-docs-toc-link',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
                style={{ marginLeft: `${depthOffset}px` }}
                aria-current={isActive ? 'location' : undefined}
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
