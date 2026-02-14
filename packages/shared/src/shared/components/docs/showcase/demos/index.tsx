'use client';

import type { ComponentType } from 'react';
import { SHOWCASE_REGISTRY } from './registry.generated';

export type ShowcaseDemoRenderer = ComponentType;

export const SHOWCASE_DEMOS: Record<string, ShowcaseDemoRenderer> = SHOWCASE_REGISTRY as Record<
  string,
  ShowcaseDemoRenderer
>;

export function hasShowcaseDemo(demoId: string): boolean {
  return Boolean(SHOWCASE_REGISTRY[demoId]);
}

export function getShowcaseDemo(demoId: string): ShowcaseDemoRenderer {
  const demo = SHOWCASE_REGISTRY[demoId];
  if (!demo) {
    throw new Error(`Missing shared showcase demo renderer for "${demoId}".`);
  }
  return demo as ShowcaseDemoRenderer;
}

