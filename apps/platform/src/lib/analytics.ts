import posthog from 'posthog-js';

export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined') return;
  posthog.capture(eventName, props ?? {});
}
