'use client';

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';

const VIDEO_EDITOR_FLAG = 'video-editor-enabled';
const STRATEGY_EDITOR_FLAG = 'strategy-editor-enabled';

/**
 * Returns whether the Video editor is enabled via PostHog feature flag.
 * When PostHog is not loaded (key unset), returns false.
 */
export function useVideoEditorEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const update = () => {
      setEnabled(posthog.isFeatureEnabled(VIDEO_EDITOR_FLAG) ?? false);
    };
    update();
    const unsubscribe = posthog.onFeatureFlags(update);
    return () => unsubscribe();
  }, []);

  return enabled;
}

/**
 * Returns whether the Strategy editor is enabled via PostHog feature flag.
 * When PostHog is not loaded (key unset), returns false.
 */
export function useStrategyEditorEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const update = () => {
      setEnabled(posthog.isFeatureEnabled(STRATEGY_EDITOR_FLAG) ?? false);
    };
    update();
    const unsubscribe = posthog.onFeatureFlags(update);
    return () => unsubscribe();
  }, []);

  return enabled;
}
