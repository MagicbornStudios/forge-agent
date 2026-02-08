'use client';

import React from 'react';
import { LivePlayerProvider } from '@twick/live-player';
import { TimelineProvider, INITIAL_TIMELINE_DATA } from '@twick/timeline';

export function TwickProviders({ children }: { children: React.ReactNode }) {
  return (
    <LivePlayerProvider>
      <TimelineProvider
        contextId="studio-video"
        initialData={INITIAL_TIMELINE_DATA}
        undoRedoPersistenceKey="studio-video-history"
      >
        {children}
      </TimelineProvider>
    </LivePlayerProvider>
  );
}
