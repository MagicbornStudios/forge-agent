'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@forge/ui/lib/utils';
import { List } from 'lucide-react';

export type TableOfContents = Array<{ title: string; url: string; depth: number }>;

export function pickActiveTocHash(
  toc: TableOfContents,
  headingTopByUrl: Record<string, number>,
  thresholdPx = 112,
): string {
  if (toc.length === 0) return '';

  let active = '';
  for (const item of toc) {
    const headingTop = headingTopByUrl[item.url];
    if (typeof headingTop !== 'number') continue;
    if (headingTop <= thresholdPx) active = item.url;
  }

  if (active) return active;

  for (const item of toc) {
    if (typeof headingTopByUrl[item.url] === 'number') return item.url;
  }
  return toc[0]?.url ?? '';
}

interface TocLinkRect {
  top: number;
  height: number;
}

interface TocThumbBounds extends TocLinkRect {}

export function computeThumbBounds(
  activeUrls: string[],
  linkRectsByUrl: Record<string, TocLinkRect>,
): TocThumbBounds | null {
  const rects = activeUrls
    .map((url) => linkRectsByUrl[url])
    .filter((rect): rect is TocLinkRect => rect != null);

  if (rects.length === 0) return null;

  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));
  return {
    top,
    height: Math.max(1, bottom - top),
  };
}

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
  const [activeUrls, setActiveUrls] = React.useState<string[]>([]);
  const [thumbBounds, setThumbBounds] = React.useState<TocThumbBounds | null>(null);
  const linkRefs = React.useRef<Record<string, HTMLAnchorElement | null>>({});

  React.useEffect(() => {
    const setFromHash = () => {
      const hash = window.location.hash;
      if (hash && toc.some((item) => item.url === hash)) {
        setActiveHash(hash);
        setActiveUrls([hash]);
      }
    };
    setFromHash();
    window.addEventListener('hashchange', setFromHash);
    return () => window.removeEventListener('hashchange', setFromHash);
  }, [toc]);

  React.useEffect(() => {
    if (!toc || toc.length === 0) return;

    const headingEntries = toc
      .map((item) => ({
        url: item.url,
        element: document.getElementById(headingIdFromUrl(item.url)),
      }))
      .filter((entry): entry is { url: string; element: HTMLElement } => entry.element != null);

    if (headingEntries.length === 0) return;

    const thresholdPx = 112;

    const updateActiveFromScroll = () => {
      const headingTopByUrl: Record<string, number> = {};
      for (const entry of headingEntries) {
        headingTopByUrl[entry.url] = entry.element.getBoundingClientRect().top;
      }

      const nextHash = pickActiveTocHash(toc, headingTopByUrl, thresholdPx);
      if (!nextHash) return;

      setActiveHash((prev) => (prev === nextHash ? prev : nextHash));
      setActiveUrls([nextHash]);
    };

    updateActiveFromScroll();

    const observer = new IntersectionObserver(updateActiveFromScroll, {
      rootMargin: `-${thresholdPx}px 0px -55% 0px`,
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    for (const entry of headingEntries) {
      observer.observe(entry.element);
    }

    window.addEventListener('resize', updateActiveFromScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateActiveFromScroll);
    };
  }, [toc]);

  React.useEffect(() => {
    const updateThumbBounds = () => {
      const linkRectsByUrl: Record<string, TocLinkRect> = {};
      for (const [url, link] of Object.entries(linkRefs.current)) {
        if (!link) continue;
        linkRectsByUrl[url] = {
          top: link.offsetTop,
          height: link.offsetHeight,
        };
      }
      setThumbBounds(computeThumbBounds(activeUrls, linkRectsByUrl));
    };

    updateThumbBounds();
    window.addEventListener('resize', updateThumbBounds);
    return () => window.removeEventListener('resize', updateThumbBounds);
  }, [activeUrls, toc]);

  if (!toc || toc.length === 0) return null;
  return (
    <aside
      className="forge-docs-toc hidden w-72 shrink-0 border-l border-border/70 bg-background/40 lg:block"
      aria-label="On this page"
    >
      <div className="forge-docs-toc-inner sticky top-[var(--docs-header-height,3.5rem)] max-h-[calc(100vh-var(--docs-header-height,3.5rem))] overflow-y-auto">
        <nav className="forge-docs-toc-nav relative flex flex-col">
          <p className="forge-docs-toc-title mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <List className="size-3.5" />
            On this page
          </p>
          {thumbBounds ? (
            <span
              aria-hidden
              className="forge-docs-toc-thumb pointer-events-none absolute w-0.5 rounded-r bg-primary transition-[top,height] duration-200 ease-out"
              style={{ top: `${thumbBounds.top}px`, height: `${thumbBounds.height}px` }}
            />
          ) : null}
          {toc.map((item) => {
            const isActive = activeHash.length > 0 && activeHash === item.url;
            const depthOffset = Math.max(0, item.depth - 2) * 14;
            const connectorWidth = Math.max(0, Math.min(12, depthOffset));
            return (
              <Link
                key={item.url}
                href={item.url}
                ref={(element) => {
                  linkRefs.current[item.url] = element;
                }}
                className={cn(
                  'forge-docs-toc-link relative block text-sm transition-colors',
                  isActive
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={isActive ? 'location' : undefined}
                style={{ marginLeft: `${depthOffset}px` }}
              >
                {connectorWidth > 0 ? (
                  <span
                    aria-hidden
                    className="forge-docs-toc-connector pointer-events-none absolute top-1/2 h-px -translate-y-1/2 bg-border"
                    style={{ left: `${-connectorWidth - 8}px`, width: `${connectorWidth + 6}px` }}
                  />
                ) : null}
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
