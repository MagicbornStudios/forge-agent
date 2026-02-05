'use client';

import React from 'react';
import { Badge } from '@forge/ui/badge';
import { Button } from '@forge/ui/button';
import { ScrollArea } from '@forge/ui/scroll-area';
import { cn } from '@forge/ui/lib/utils';
import type { VideoTrack } from '@/lib/domains/video/types';

export interface TwickTrackListProps {
  tracks: VideoTrack[];
  selectedTrackId?: string | null;
  onSelectTrack?: (trackId: string) => void;
  onAddTrack?: () => void;
}

export function TwickTrackList({
  tracks,
  selectedTrackId,
  onSelectTrack,
  onAddTrack,
}: TwickTrackListProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tracks
        </span>
        <Button size="sm" variant="outline" onClick={onAddTrack}>
          Add track
        </Button>
      </div>
      {tracks.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
          No tracks yet. Create one to start your timeline.
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 pr-2">
            {tracks.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => onSelectTrack?.(track.id)}
                className={cn(
                  'rounded-md border px-3 py-2 text-left transition',
                  selectedTrackId === track.id
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-border bg-background hover:bg-muted/40'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{track.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {track.type}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {track.elements.length} element{track.elements.length === 1 ? '' : 's'}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
