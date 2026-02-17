import assert from 'node:assert/strict';
import test from 'node:test';

import { parseStoryMarkdownToBlocks } from '../core/parsers/story.mjs';

test('parseStoryMarkdownToBlocks maps markdown structures to deterministic blocks', () => {
  const markdown = [
    '# Chapter One',
    '',
    'A paragraph with story setup.',
    '',
    '- bullet one',
    '1. numbered one',
    '> quoted line',
    '',
    '```ts',
    'console.log("scene");',
    '```',
    '',
    '---',
  ].join('\n');

  const first = parseStoryMarkdownToBlocks(markdown);
  const second = parseStoryMarkdownToBlocks(markdown);

  assert.equal(first.contentHash, second.contentHash);
  assert.equal(first.blocks.length, second.blocks.length);
  assert.deepEqual(first.blocks, second.blocks);
  assert.equal(first.warnings.length, 0);

  const types = first.blocks.map((entry) => entry.type);
  assert.deepEqual(types, [
    'heading_1',
    'paragraph',
    'bulleted_list_item',
    'numbered_list_item',
    'quote',
    'code',
    'divider',
  ]);
});

test('parseStoryMarkdownToBlocks downgrades unknown heading levels with warnings', () => {
  const parsed = parseStoryMarkdownToBlocks('#### Too Deep\n\ncontent');
  assert.equal(parsed.blocks[0]?.type, 'paragraph');
  assert.ok(parsed.warnings.some((warning) => warning.includes('downgraded')));
});
