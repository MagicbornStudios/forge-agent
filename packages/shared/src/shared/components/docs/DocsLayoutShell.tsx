'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { SerializedPageTree } from 'fumadocs-core/source/client';
import { deserializePageTree } from 'fumadocs-core/source/client';
import type { Root, Node, Item, Folder } from 'fumadocs-core/page-tree';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@forge/ui/sidebar';
import { Button } from '@forge/ui/button';
import { cn } from '@forge/ui/lib/utils';
import { BookOpenText, Github } from 'lucide-react';
import { DocsSidebar } from './DocsSidebar';
import { RightToc, type TableOfContents } from './RightToc';
import { toPlainText, toTitleFromHref } from './tree-label';

export type { TableOfContents } from './RightToc';

interface DocsTopTab {
  label: string;
  href: string;
}

export interface DocsLayoutShellProps {
  serializedTree: SerializedPageTree;
  toc: TableOfContents;
  children: React.ReactNode;
  baseUrl?: string;
  githubUrl?: string;
  topTabs?: DocsTopTab[];
  brandTitle?: string;
}

function isItem(node: Node): node is Item {
  return node.type === 'page';
}

function isFolder(node: Node): node is Folder {
  return node.type === 'folder';
}

function resolveFolderUrl(folder: Folder): string | null {
  if (folder.index?.url) return folder.index.url;
  for (const child of folder.children) {
    if (isItem(child)) return child.url;
    if (isFolder(child)) {
      const nested = resolveFolderUrl(child);
      if (nested) return nested;
    }
  }
  return null;
}

export function DocsLayoutShell({
  serializedTree,
  toc,
  children,
  baseUrl = '/docs',
  githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com',
  topTabs,
  brandTitle = 'Forge Docs',
}: DocsLayoutShellProps) {
  const pathname = usePathname();
  const tree = useMemo(() => deserializePageTree(serializedTree) as Root, [serializedTree]);
  const computedTabs = useMemo(() => {
    if (topTabs && topTabs.length > 0) {
      const seen = new Set<string>();
      return topTabs.filter((tab) => {
        if (seen.has(tab.href)) return false;
        seen.add(tab.href);
        return true;
      });
    }

    const seen = new Set<string>([baseUrl]);
    const tabs: DocsTopTab[] = [{ label: 'Docs', href: baseUrl }];
    for (const node of tree.children) {
      if (node.type === 'separator') continue;
      if (isItem(node)) {
        if (seen.has(node.url)) continue;
        tabs.push({
          label: toPlainText(node.name, toTitleFromHref(node.url, 'Doc')),
          href: node.url,
        });
        seen.add(node.url);
      } else if (isFolder(node)) {
        const href = resolveFolderUrl(node);
        if (href) {
          if (seen.has(href)) continue;
          const folderFallback = toTitleFromHref(href, 'Docs');
          tabs.push({
            label: toPlainText(node.name, toPlainText(node.index?.name, folderFallback)),
            href,
          });
          seen.add(href);
        }
      }
      if (tabs.length >= 5) break;
    }
    return tabs;
  }, [topTabs, tree, baseUrl]);

  const isTabActive = (href: string) => {
    if (href === baseUrl) {
      return pathname === baseUrl || pathname === `${baseUrl}/`;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div id="nd-docs-layout" className="forge-docs-shell">
      <SidebarProvider defaultOpen className="[--docs-header-height:4rem] md:pl-[var(--sidebar-width)]">
        <DocsSidebar serializedTree={serializedTree} baseUrl={baseUrl} />
        <SidebarInset className="min-h-0 bg-transparent">
          <header className="forge-docs-header sticky top-0 z-30 border-b border-border/60 bg-background/88 backdrop-blur-xl">
            <div className="flex h-[var(--docs-header-height)] min-w-0 items-center gap-2 px-4 lg:px-7">
              <SidebarTrigger className="-ml-1 md:hidden" />
              <Link
                href={baseUrl}
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground"
              >
                <BookOpenText className="size-4 text-primary" />
                <span>{brandTitle}</span>
              </Link>
              <nav className="forge-docs-tabs ml-4 hidden min-w-0 flex-1 items-stretch gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex">
                {computedTabs.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      'inline-flex h-[var(--docs-header-height)] max-w-[13rem] shrink-0 items-center border-b-2 px-3 text-sm transition-colors',
                      isTabActive(tab.href)
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
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-4xl px-5 pt-8 pb-12 sm:px-6 lg:max-w-5xl lg:px-10 lg:pt-10 lg:pb-14">
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
