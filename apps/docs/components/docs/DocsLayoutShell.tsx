'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Root } from 'fumadocs-core/page-tree';
import { BookOpenText, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  getAudienceTabs,
  inferAudienceFromPath,
  normalizeDocsAudience,
  type DocsAudience,
} from '@/lib/docs/audience';
import { DocsSidebar } from './DocsSidebar';
import { RightToc, type TableOfContents } from './RightToc';

interface DocsTopTab {
  label: string;
  href: string;
  audience?: DocsAudience;
}

export interface DocsLayoutShellProps {
  pageTree: Root;
  toc: TableOfContents;
  children: React.ReactNode;
  baseUrl?: string;
  githubUrl?: string;
  topTabs?: DocsTopTab[];
  brandTitle?: string;
  audience?: DocsAudience;
}

export function DocsLayoutShell({
  pageTree,
  toc,
  children,
  baseUrl = '/docs',
  githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com',
  topTabs,
  brandTitle = 'Forge Docs',
  audience,
}: DocsLayoutShellProps) {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();

  const currentAudience = useMemo<DocsAudience>(() => {
    if (audience) return audience;

    const queryAudience = searchParams.get('audience');
    if (queryAudience) return normalizeDocsAudience(queryAudience);

    return inferAudienceFromPath(pathname, baseUrl);
  }, [audience, baseUrl, pathname, searchParams]);

  const computedTabs = useMemo<DocsTopTab[]>(() => {
    if (topTabs && topTabs.length > 0) return topTabs;
    return getAudienceTabs(baseUrl);
  }, [baseUrl, topTabs]);

  const isTabActive = (tab: DocsTopTab) => {
    if (tab.audience) return currentAudience === tab.audience;

    if (tab.href === baseUrl) return pathname === baseUrl || pathname === `${baseUrl}/`;
    return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
  };

  return (
    <div id="platform-docs-layout" className="platform-docs-shell h-[100dvh] min-h-[100dvh]">
      <SidebarProvider defaultOpen className="h-[100dvh] min-h-[100dvh] [--docs-header-height:4rem] md:pl-[var(--sidebar-width)]">
        <div className="platform-docs-corner-brand fixed top-0 left-0 z-30 hidden h-[var(--docs-header-height)] w-[var(--sidebar-width)] items-center border-r border-b border-border/60 bg-background/90 px-4 backdrop-blur-xl md:flex">
          <Link href={baseUrl} className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold tracking-wide text-foreground">
            <span className="inline-flex size-6 items-center justify-center rounded-md border border-primary/35 bg-primary/15 text-[11px] font-bold text-primary">
              FG
            </span>
            <span className="truncate">Forge Docs</span>
          </Link>
        </div>
        <DocsSidebar
          pageTree={pageTree}
          pathname={pathname}
          baseUrl={baseUrl}
          audience={currentAudience}
        />
        <SidebarInset className="flex h-full min-h-0 flex-col bg-transparent">
          <header className="platform-docs-header sticky top-0 z-30 border-b border-border/60 bg-background/88 backdrop-blur-xl">
            <div className="flex h-[var(--docs-header-height)] min-w-0 items-center gap-2 px-4 lg:px-7">
              <SidebarTrigger className="-ml-1 md:hidden" />
              <Link href={baseUrl} className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground">
                <BookOpenText className="size-4 text-primary" />
                <span>{brandTitle}</span>
              </Link>
              <nav className="platform-docs-tabs ml-4 hidden min-w-0 flex-1 items-stretch gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex">
                {computedTabs.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      'inline-flex h-[var(--docs-header-height)] max-w-[13rem] shrink-0 items-center border-b-2 px-3 text-sm transition-colors',
                      isTabActive(tab)
                        ? 'border-primary font-medium text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span className="truncate">{tab.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="ml-auto flex items-center gap-1">
                <Button asChild variant="ghost" size="icon" className="size-8">
                  <a href={githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                    <Github className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </header>
          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
            <main id="docs-main-content" className="min-h-0 min-w-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="mx-auto w-full max-w-4xl px-5 pb-14 pt-8 sm:px-6 lg:max-w-5xl lg:px-10 lg:pb-16 lg:pt-10">
                {children}
              </div>
            </main>
            <RightToc toc={toc} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
