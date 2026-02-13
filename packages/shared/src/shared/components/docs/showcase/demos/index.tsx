'use client';

import type { ComponentType } from 'react';
import { ATOM_SHOWCASE_DEMOS } from './atoms';
import { MOLECULE_SHOWCASE_DEMOS } from './molecules';
import { ORGANISM_SHOWCASE_DEMOS } from './organisms';

export type ShowcaseDemoRenderer = ComponentType;

export const SHOWCASE_DEMOS: Record<string, ShowcaseDemoRenderer> = {
  ...ATOM_SHOWCASE_DEMOS,
  ...MOLECULE_SHOWCASE_DEMOS,
  ...ORGANISM_SHOWCASE_DEMOS,
};

export function hasShowcaseDemo(demoId: string): boolean {
  return Boolean(SHOWCASE_DEMOS[demoId]);
}

export function getShowcaseDemo(demoId: string): ShowcaseDemoRenderer {
  const demo = SHOWCASE_DEMOS[demoId];
  if (!demo) {
    throw new Error(`Missing shared showcase demo renderer for "${demoId}".`);
  }
  return demo;
}

