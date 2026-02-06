'use client';

import type { SerializedPageTree } from 'fumadocs-core/source/client';
import { SidebarProvider, SidebarInset } from '@forge/ui/sidebar';
import { SidebarTrigger } from '@forge/ui/sidebar';
import { DocsSidebar } from './DocsSidebar';
import { RightToc, type TableOfContents } from './RightToc';

export function DocsLayout({
  serializedTree,
  toc,
  children,
}: {
  serializedTree: SerializedPageTree;
  toc: TableOfContents;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DocsSidebar serializedTree={serializedTree} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 overflow-hidden">
          <main className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mx-auto max-w-3xl">{children}</div>
          </main>
          <RightToc toc={toc} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
