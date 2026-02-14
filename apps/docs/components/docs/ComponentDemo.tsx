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

function MissingDemoCard({ id, message }: { id: string; message: string }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
      <p className="text-sm font-medium text-destructive">{message}</p>
      <code className="mt-3 block rounded bg-background px-2 py-1 text-xs text-muted-foreground">
        {id}
      </code>
    </div>
  );
}

export function ComponentDemo({ id, className }: { id: string; className?: string }) {
  if (isShowcaseEntryId(id)) {
    if (isInternalOnlyShowcaseId(id)) {
      return null;
    }

    const showcaseEntry = getShowcaseEntry(id);
    if (!showcaseEntry) {
      return (
        <MissingDemoCard
          id={id}
          message="Missing showcase entry metadata."
        />
      );
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

  return (
    <MissingDemoCard
      id={id}
      message="Missing showcase entry id."
    />
  );
}
