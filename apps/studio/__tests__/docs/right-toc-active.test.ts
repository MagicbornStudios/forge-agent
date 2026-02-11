/** @jest-environment node */

import { computeThumbBounds, pickActiveTocHash, type TableOfContents } from '@forge/shared/components/docs/RightToc';

describe('RightToc helper logic', () => {
  const toc: TableOfContents = [
    { title: 'Intro', url: '#intro', depth: 2 },
    { title: 'Architecture', url: '#architecture', depth: 2 },
    { title: 'Details', url: '#details', depth: 3 },
  ];

  it('selects the last heading above the scroll threshold', () => {
    const active = pickActiveTocHash(
      toc,
      {
        '#intro': -20,
        '#architecture': 40,
        '#details': 220,
      },
      112,
    );

    expect(active).toBe('#architecture');
  });

  it('falls back to the first available heading when none are above threshold', () => {
    const active = pickActiveTocHash(
      toc,
      {
        '#intro': 180,
        '#architecture': 260,
      },
      112,
    );

    expect(active).toBe('#intro');
  });

  it('computes thumb bounds from active links', () => {
    const bounds = computeThumbBounds(['#architecture', '#details'], {
      '#intro': { top: 0, height: 20 },
      '#architecture': { top: 24, height: 20 },
      '#details': { top: 48, height: 20 },
    });

    expect(bounds).toEqual({ top: 24, height: 44 });
  });

  it('returns null thumb bounds when active links have no rendered targets', () => {
    expect(computeThumbBounds(['#missing'], {})).toBeNull();
  });
});

