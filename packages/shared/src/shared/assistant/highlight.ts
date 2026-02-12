'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Payload for AI highlights, domain-agnostic.
 *
 * Keys are entity types (e.g. `'forge.node'`, `'video.track'`),
 * values are arrays of entity IDs to highlight.
 */
export interface AIHighlightPayload {
  entities: Record<string, string[]>;
}

/** Current highlight state: entity-type -> array of highlighted IDs. */
export interface AIHighlightState {
  entities: Record<string, string[]>;
}

export interface UseAIHighlightReturn {
  /** Current highlights keyed by entity type. */
  highlights: AIHighlightState;
  /** Add highlights (merges with existing). Resets auto-clear timer. */
  onAIHighlight: (payload: AIHighlightPayload) => void;
  /** Immediately clear all highlights. */
  clearHighlights: () => void;
  /** Check if a specific entity is currently highlighted. */
  isHighlighted: (entityType: string, id: string) => boolean;
}

const DEFAULT_DURATION_MS = 6000;

/**
 * Generic AI highlight manager.
 *
 * Domains use this to track what the AI changed. Highlights auto-clear
 * after the specified duration (default 6 s).
 */
export function useAIHighlight(durationMs: number = DEFAULT_DURATION_MS): UseAIHighlightReturn {
  const [highlights, setHighlights] = useState<AIHighlightState>({ entities: {} });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHighlights = useCallback(() => {
    setHighlights({ entities: {} });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const onAIHighlight = useCallback(
    (payload: AIHighlightPayload) => {
      setHighlights((prev) => {
        const merged: Record<string, string[]> = { ...prev.entities };
        for (const [entityType, ids] of Object.entries(payload.entities)) {
          merged[entityType] = [...new Set([...(merged[entityType] ?? []), ...ids])];
        }
        return { entities: merged };
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(clearHighlights, durationMs);
    },
    [clearHighlights, durationMs],
  );

  const isHighlighted = useCallback(
    (entityType: string, id: string): boolean => {
      return highlights.entities[entityType]?.includes(id) ?? false;
    },
    [highlights],
  );

  return { highlights, onAIHighlight, clearHighlights, isHighlighted };
}
