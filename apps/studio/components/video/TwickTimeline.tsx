'use client';

import React from 'react';
import { cn } from '@forge/ui/lib/utils';
import type { VideoDocData, VideoElement, VideoTrack } from '@/lib/domains/video/types';

const MIN_TIMELINE_SECONDS = 12;
const PIXELS_PER_SECOND = 24;

function getElementLabel(element: VideoElement): string {
  if (element.type === 'text' && typeof element.props.text === 'string') {
    return element.props.text;
  }
  if (element.type === 'caption' && typeof element.props.text === 'string') {
    return element.props.text;
  }
  return element.type;
}

function getTimelineDuration(tracks: VideoTrack[]): number {
  let maxEnd = 0;
  for (const track of tracks) {
    for (const el of track.elements) {
      if (typeof el.end === 'number' && el.end > maxEnd) maxEnd = el.end;
    }
  }
  return Math.max(MIN_TIMELINE_SECONDS, Math.ceil(maxEnd));
}

function getMarkerStep(duration: number): number {
  if (duration > 120) return 20;
  if (duration > 60) return 10;
  if (duration > 30) return 5;
  return 2;
}

export interface TwickTimelineProps {
  data: VideoDocData;
  selectedTrackId?: string | null;
  selectedElementId?: string | null;
  onSelectTrack?: (trackId: string) => void;
  onSelectElement?: (trackId: string, elementId: string) => void;
}

export function TwickTimeline({
  data,
  selectedTrackId,
  selectedElementId,
  onSelectTrack,
  onSelectElement,
}: TwickTimelineProps) {
  const duration = getTimelineDuration(data.tracks);
  const timelineWidth = Math.max(640, duration * PIXELS_PER_SECOND);
  const markerStep = getMarkerStep(duration);
  const markers = Array.from({ length: Math.floor(duration / markerStep) + 1 }, (_, index) => index * markerStep);
  const gridSize = markerStep * PIXELS_PER_SECOND;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Timeline
        </div>
        <div className="text-xs text-muted-foreground">
          {duration}s - {data.resolution.width}x{data.resolution.height}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="min-h-full" style={{ width: timelineWidth }}>
          <div className="flex border-b border-border text-[10px] text-muted-foreground">
            {markers.map((marker) => (
              <div
                key={marker}
                className="border-r border-border/50 px-2 py-1"
                style={{ width: gridSize }}
              >
                {marker}s
              </div>
            ))}
          </div>
          {data.tracks.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No tracks yet. Add a track to begin.</div>
          ) : (
            data.tracks.map((track) => (
              <div
                key={track.id}
                className={cn(
                  'relative h-12 border-b border-border/60',
                  track.id === selectedTrackId ? 'bg-muted/40' : 'bg-background'
                )}
                style={{
                  backgroundImage:
                    'linear-gradient(to right, hsl(var(--border) / 0.35) 1px, transparent 1px)',
                  backgroundSize: `${gridSize}px 100%`,
                }}
                onClick={() => onSelectTrack?.(track.id)}
              >
                {track.elements.map((element) => {
                  const left = Math.max(0, element.start) * PIXELS_PER_SECOND;
                  const width = Math.max(
                    16,
                    (Math.max(element.end, element.start + 0.25) - element.start) * PIXELS_PER_SECOND
                  );
                  const isSelected =
                    track.id === selectedTrackId && element.id === selectedElementId;
                  return (
                    <button
                      key={element.id}
                      type="button"
                      title={`${getElementLabel(element)} (${element.start}s - ${element.end}s)`}
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-8 rounded border px-2 text-xs font-medium shadow-sm',
                        'flex items-center gap-2 overflow-hidden truncate',
                        isSelected
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-border bg-muted/70 text-foreground'
                      )}
                      style={{ left, width }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectElement?.(track.id, element.id);
                      }}
                    >
                      <span className="truncate">{getElementLabel(element)}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
