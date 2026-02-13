import assert from 'node:assert/strict';
import test from 'node:test';

import { updateGeneratedBlock } from '../lib/markdown.mjs';
import { GENERATED_END_MARKER, GENERATED_START_MARKER } from '../lib/paths.mjs';

test('updateGeneratedBlock injects generated section when markers are missing', () => {
  const initial = '# Header\n\nManual content.';
  const updated = updateGeneratedBlock(initial, 'Generated line');

  assert.match(updated, new RegExp(GENERATED_START_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(updated, /Generated line/);
  assert.match(updated, /Manual content\./);
});

test('updateGeneratedBlock only replaces marker section and is idempotent', () => {
  const initial = `# Status

Top manual paragraph.

${GENERATED_START_MARKER}
Old generated content.
${GENERATED_END_MARKER}

Bottom manual paragraph.
`;

  const once = updateGeneratedBlock(initial, 'New generated content.');
  const twice = updateGeneratedBlock(once, 'New generated content.');

  assert.equal(once, twice);
  assert.match(once, /Top manual paragraph\./);
  assert.match(once, /Bottom manual paragraph\./);
  assert.doesNotMatch(once, /Old generated content/);
  assert.match(once, /New generated content\./);
});

