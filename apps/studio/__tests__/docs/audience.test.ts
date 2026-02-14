/** @jest-environment node */

import {
  DEFAULT_DOCS_AUDIENCE,
  getAudienceTabs,
  isSlugVisibleForAudience,
  normalizeDocsAudience,
  withAudienceQuery,
} from '@/lib/docs/audience';

describe('docs audience helpers', () => {
  it('defaults to developer and supports developer-internal', () => {
    expect(DEFAULT_DOCS_AUDIENCE).toBe('developer');
    expect(normalizeDocsAudience(undefined)).toBe('developer');
    expect(normalizeDocsAudience('developer-internal')).toBe('developer-internal');
  });

  it('shows internal section only for developer-internal audience', () => {
    expect(isSlugVisibleForAudience('/docs/developer-internal', 'developer')).toBe(false);
    expect(isSlugVisibleForAudience('/docs/developer-internal', 'developer-internal')).toBe(true);
  });

  it('preserves default audience links and appends internal query', () => {
    expect(withAudienceQuery('/docs/components/editor/editor-shell', 'developer')).toBe(
      '/docs/components/editor/editor-shell',
    );
    expect(withAudienceQuery('/docs/components/editor/editor-shell', 'developer-internal')).toBe(
      '/docs/components/editor/editor-shell?audience=developer-internal',
    );
  });

  it('returns Developer and Developer (internal) tabs', () => {
    expect(getAudienceTabs('/docs')).toEqual([
      { audience: 'developer', label: 'Developer', href: '/docs/components' },
      {
        audience: 'developer-internal',
        label: 'Developer (internal)',
        href: '/docs/developer-internal?audience=developer-internal',
      },
    ]);
  });
});
