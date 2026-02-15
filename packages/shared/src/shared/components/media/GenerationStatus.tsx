'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export type GenerationState = 'idle' | 'generating' | 'success' | 'error';

export interface GenerationStatusProps {
  /** Current generation state. */
  state: GenerationState;
  /** Human-readable message (e.g. "Generating image…", "Complete"). */
  message?: string;
  /** Error message when state is 'error'. */
  error?: string;
  /** Optional progress as a fraction 0–1. */
  progress?: number;
  /** When provided, renders a dismiss/clear button. */
  onDismiss?: () => void;
  className?: string;
}

/**
 * GenerationStatus — inline status indicator for AI generation tasks.
 *
 * Renders a compact bar showing generation progress, success, or error state.
 * Designed to be placed within a `DockPanel` or next to a media card.
 *
 * @example
 * ```tsx
 * <GenerationStatus
 *   state={isGenerating ? 'generating' : error ? 'error' : 'idle'}
 *   message={isGenerating ? 'Generating portrait…' : undefined}
 *   error={error?.message}
 *   onDismiss={() => clearError()}
 * />
 * ```
 */
export function GenerationStatus({
  state,
  message,
  error,
  progress,
  onDismiss,
  className,
}: GenerationStatusProps) {
  if (state === 'idle') return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs',
        state === 'generating' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        state === 'success' && 'bg-green-500/10 text-green-600 dark:text-green-400',
        state === 'error' && 'bg-destructive/10 text-destructive',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {/* Spinner for generating state */}
      {state === 'generating' && (
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-current opacity-50" />
        </span>
      )}

      {/* Success check */}
      {state === 'success' && (
        <svg
          className="h-3.5 w-3.5 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 8 7 11 12 5" />
        </svg>
      )}

      {/* Error icon */}
      {state === 'error' && (
        <svg
          className="h-3.5 w-3.5 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="8" r="6" />
          <line x1="8" y1="5" x2="8" y2="8.5" />
          <circle cx="8" cy="11" r="0.5" fill="currentColor" />
        </svg>
      )}

      {/* Message */}
      <span className="flex-1 min-w-0 truncate">
        {state === 'error' ? error : message}
      </span>

      {/* Progress bar */}
      {state === 'generating' && progress != null && (
        <div className="w-16 h-1 bg-current/20 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-current rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      )}

      {/* Dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-0.5 rounded hover:bg-current/10 transition-colors"
          aria-label="Dismiss"
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <line x1="3" y1="3" x2="9" y2="9" />
            <line x1="9" y1="3" x2="3" y2="9" />
          </svg>
        </button>
      )}
    </div>
  );
}
