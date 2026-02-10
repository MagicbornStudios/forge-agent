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

function labelText(value: React.ReactNode, fallback: string): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
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
    if (topTabs && topTabs.length > 0) return topTabs;
    const tabs: DocsTopTab[] = [{ label: 'Docs', href: baseUrl }];
    for (const node of tree.children) {
      if (node.type === 'separator') continue;
      if (isItem(node)) {
        tabs.push({ label: labelText(node.name, 'Doc'), href: node.url });
      } else if (isFolder(node)) {
        const href = resolveFolderUrl(node);
        if (href) {
          tabs.push({
            label: typeof node.name === 'string' ? node.name : 'Section',
            href,
          });
        }
      }
      if (tabs.length >= 6) break;
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
    <SidebarProvider defaultOpen>
      <DocsSidebar serializedTree={serializedTree} baseUrl={baseUrl} />
      <SidebarInset className="md:ml-[var(--sidebar-width)]">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1 md:hidden" />
            <Link
              href={baseUrl}
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground"
            >
              <BookOpenText className="size-4 text-primary" />
              <span>{brandTitle}</span>
            </Link>
            <nav className="ml-6 hidden min-w-0 items-center md:flex">
              {computedTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'inline-flex h-14 items-center border-b-2 px-3 text-sm transition-colors',
                    isTabActive(tab.href)
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tab.label}
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
        <div className="flex flex-1 overflow-hidden">
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl px-6 py-8 lg:px-10 lg:py-10">{children}</div>
          </main>
          <RightToc toc={toc} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
