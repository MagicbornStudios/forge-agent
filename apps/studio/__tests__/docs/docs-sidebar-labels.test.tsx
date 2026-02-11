/** @jest-environment node */

import * as React from 'react';
import type { Folder, Item } from 'fumadocs-core/page-tree';
import { resolveNodeLabel } from '@forge/shared/components/docs/sidebar-label';

describe('DocsSidebar labels', () => {
  it('resolves folder names from ReactNode values without generic Section fallback', () => {
    const folder = {
      type: 'folder',
      name: React.createElement('span', {
        dangerouslySetInnerHTML: { __html: 'Architecture' },
      }),
      index: {
        type: 'page',
        name: 'Architecture index',
        url: '/docs/architecture',
      },
      children: [],
    } as unknown as Folder;

    expect(resolveNodeLabel(folder)).toBe('Architecture');
    expect(resolveNodeLabel(folder)).not.toBe('Section');
  });

  it('falls back to index title and href-derived title when folder name is empty', () => {
    const withIndexName = {
      type: 'folder',
      name: null,
      index: {
        type: 'page',
        name: 'How-to guides',
        url: '/docs/how-to',
      },
      children: [],
    } as unknown as Folder;

    const withoutIndexName = {
      type: 'folder',
      name: null,
      index: {
        type: 'page',
        name: null,
        url: '/docs/how-to/26-styling-debugging-with-cursor',
      },
      children: [],
    } as unknown as Folder;

    expect(resolveNodeLabel(withIndexName)).toBe('How-to guides');
    expect(resolveNodeLabel(withoutIndexName)).toBe('Styling Debugging With Cursor');
  });

  it('resolves page labels with href fallback when page name is empty', () => {
    const page = {
      type: 'page',
      name: null,
      url: '/docs/architecture/06-model-routing-and-openrouter',
    } as unknown as Item;

    expect(resolveNodeLabel(page)).toBe('Model Routing And Openrouter');
  });
});
