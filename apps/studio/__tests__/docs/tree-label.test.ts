/** @jest-environment node */

import * as React from 'react';
import { toPlainText, toTitleFromHref } from '@forge/shared/components/docs/tree-label';

describe('docs tree-label helpers', () => {
  it('extracts readable text from nested ReactNode values', () => {
    const value = [
      React.createElement('span', { key: 'architecture' }, 'Architecture'),
      React.createElement('span', { key: 'reference' }, 'Reference'),
    ];

    expect(toPlainText(value)).toBe('Architecture Reference');
    expect(
      toPlainText(['How', 'to', React.createElement('strong', { key: 'guide' }, 'Guide')]),
    ).toBe('How to Guide');
  });

  it('extracts text from dangerouslySetInnerHTML content', () => {
    const value = React.createElement('span', {
      // Fumadocs deserializePageTree returns node names as spans with raw HTML
      dangerouslySetInnerHTML: { __html: 'How-to <em>Guides</em>' },
    });

    expect(toPlainText(value, 'Fallback')).toBe('How-to Guides');
  });

  it('returns fallback when node has no readable text', () => {
    expect(toPlainText(null, 'Fallback')).toBe('Fallback');
    expect(toPlainText(false, 'Fallback')).toBe('Fallback');
  });

  it('builds deterministic title labels from href segments', () => {
    expect(toTitleFromHref('/docs/how-to/26-styling-debugging-with-cursor', 'Docs')).toBe(
      'Styling Debugging With Cursor',
    );
    expect(toTitleFromHref('/docs/api-reference', 'Docs')).toBe('Api Reference');
    expect(toTitleFromHref('', 'Docs')).toBe('Docs');
  });
});
