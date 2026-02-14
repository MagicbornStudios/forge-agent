'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  AppProviders,
  BlockView,
  getShowcaseDemo,
  getShowcaseEntry,
  isInternalOnlyShowcaseId,
  isShowcaseEntryId,
} from '@forge/shared';
import { COMPONENT_DEMOS } from './component-demos';
import type { ComponentDemoId } from './component-demos/generated-ids';
import { cn } from '@/lib/utils';

class DemoErrorBoundary extends React.Component<
  {
    id: string;
    children: React.ReactNode;
  },
  { hasError: boolean; errorMessage?: string }
> {
  constructor(props: { id: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown demo render error',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">Component demo failed at runtime</p>
          <p className="mt-1 text-xs text-destructive/90">
            {this.state.errorMessage ?? 'Unknown demo render error'}
          </p>
          <code className="mt-3 block rounded bg-background px-2 py-1 text-xs text-muted-foreground">
            {this.props.id}
          </code>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ComponentDemo({ id, className }: { id: string; className?: string }) {
  if (isShowcaseEntryId(id)) {
    if (isInternalOnlyShowcaseId(id)) {
      return null;
    }

    const showcaseEntry = getShowcaseEntry(id);
    if (!showcaseEntry) {
      throw new Error(`Missing showcase entry metadata for id "${id}".`);
    }

    const Demo = getShowcaseDemo(showcaseEntry.demoId);
    return (
      <DemoErrorBoundary id={id}>
        <BlockView
          id={showcaseEntry.id}
          title={showcaseEntry.title}
          summary={showcaseEntry.summary}
          previewHeight={showcaseEntry.previewHeight}
          files={showcaseEntry.code.files}
          installCommand={showcaseEntry.installCommand}
          openInNewTabUrl={showcaseEntry.openInNewTabUrl}
          openInV0Url={showcaseEntry.openInV0Url}
          className={className}
          preview={
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <AppProviders>
                <Demo />
              </AppProviders>
            </React.Suspense>
          }
        />
      </DemoErrorBoundary>
    );
  }

  const Demo = COMPONENT_DEMOS[id as ComponentDemoId];
  if (!Demo) {
    throw new Error(`Missing demo renderer for component id "${id}".`);
  }

  const title = id.split('.').pop()?.replace(/-/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? id;
  const defaultFiles = [
    {
      path: `components/${id.replace('.', '/')}.tsx`,
      language: 'tsx' as const,
      code: `// ${title} — see packages for source. Add to showcase catalog for code preview.`,
    },
  ];

  return (
    <DemoErrorBoundary id={id}>
      <BlockView
        id={id}
        title={title}
        summary=""
        files={defaultFiles}
        className={className}
        preview={
          <AppProviders>
            <Demo />
          </AppProviders>
        }
      />
    </DemoErrorBoundary>
  );
}
