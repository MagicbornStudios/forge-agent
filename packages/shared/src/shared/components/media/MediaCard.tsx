'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { Button } from '@forge/ui/button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MediaCardAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
}

export interface MediaCardProps {
  /** URL of the current media asset (image, video, or audio). */
  src?: string;
  /** Type of media to render. Default: 'image'. */
  type?: 'image' | 'video' | 'audio';
  /** Alt text for images / aria label for media. */
  alt?: string;
  /** Fallback content shown when there is no `src` (e.g. initials avatar). */
  fallback?: React.ReactNode;
  /** CSS aspect-ratio value. Default: '3/4'. */
  aspectRatio?: string;
  /** Action buttons rendered on hover overlay. */
  actions?: MediaCardAction[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * MediaCard — reusable entity media display with hover action overlay.
 *
 * Displays an image, video, or audio player with a consistent aspect-ratio
 * container. When hovered, shows action buttons (e.g. "Generate Portrait",
 * "Animate", "Remove").
 *
 * Designed to be workspace-agnostic: usable in CharacterWorkspace,
 * VideoWorkspace, or any context that needs an entity media slot.
 */
export function MediaCard({
  src,
  type = 'image',
  alt,
  fallback,
  aspectRatio = '3/4',
  actions,
  className,
}: MediaCardProps) {
  return (
    <div
      className={cn(
        'group relative w-full rounded-lg border border-border bg-muted overflow-hidden',
        className,
      )}
      style={{ aspectRatio }}
    >
      {/* Media display */}
      {src ? (
        <MediaRenderer src={src} type={type} alt={alt} />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          {fallback ?? (
            <span className="text-4xl font-bold text-muted-foreground select-none">?</span>
          )}
        </div>
      )}

      {/* Hover action overlay */}
      {actions && actions.length > 0 && (
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-end gap-1.5 p-3',
            'bg-gradient-to-t from-black/60 via-black/20 to-transparent',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          )}
        >
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant ?? 'default'}
              size="sm"
              className="w-full text-xs"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.icon && <span className="mr-1.5 shrink-0">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal: Media renderer by type
// ---------------------------------------------------------------------------

function MediaRenderer({
  src,
  type,
  alt,
}: {
  src: string;
  type: 'image' | 'video' | 'audio';
  alt?: string;
}) {
  switch (type) {
    case 'video':
      return (
        <video
          src={src}
          className="w-full h-full object-cover"
          controls
          playsInline
          aria-label={alt}
        />
      );
    case 'audio':
      return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-3 p-4">
          <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
          </div>
          <audio src={src} controls className="w-full" aria-label={alt} />
        </div>
      );
    case 'image':
    default:
      return (
        <img
          src={src}
          alt={alt ?? ''}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      );
  }
}
