/** @jest-environment node */

import {
  appendCharacterMedia,
  getCharacterBehaviorPrompt,
  getCharacterMedia,
  getPrimaryImageUrl,
  removeCharacterMedia,
  setCharacterBehaviorPrompt,
} from '@/lib/domains/character/media-meta';

describe('character media meta helpers', () => {
  it('preserves unrelated metadata while setting prompt', () => {
    const originalMeta = {
      flags: { pinned: true },
      prompts: { legacy: 'keep-me' },
    } as Record<string, unknown>;

    const nextMeta = setCharacterBehaviorPrompt(
      originalMeta,
      'Acts calm under pressure',
    );

    expect((nextMeta.flags as { pinned: boolean }).pinned).toBe(true);
    expect((nextMeta.prompts as Record<string, string>).legacy).toBe('keep-me');
    expect(getCharacterBehaviorPrompt(nextMeta)).toBe('Acts calm under pressure');
  });

  it('appends image, audio, and video assets to their dedicated lists', () => {
    let nextMeta: Record<string, unknown> = {};

    nextMeta = appendCharacterMedia(nextMeta, {
      type: 'image',
      url: 'https://example.com/image.png',
      source: 'generated',
    });
    nextMeta = appendCharacterMedia(nextMeta, {
      type: 'audio',
      url: 'https://example.com/voice.mp3',
      source: 'generated',
    });
    nextMeta = appendCharacterMedia(nextMeta, {
      type: 'video',
      url: 'https://example.com/clip.mp4',
      source: 'uploaded',
    });

    const media = getCharacterMedia(nextMeta);
    expect(media.images).toHaveLength(1);
    expect(media.audioTracks).toHaveLength(1);
    expect(media.videos).toHaveLength(1);
    expect(media.images[0].url).toContain('image.png');
    expect(media.audioTracks[0].url).toContain('voice.mp3');
    expect(media.videos[0].source).toBe('uploaded');
  });

  it('derives primary portrait from media list when imageUrl is empty', () => {
    let nextMeta: Record<string, unknown> = {};
    nextMeta = appendCharacterMedia(nextMeta, {
      type: 'image',
      url: 'https://example.com/portrait-1.png',
    });
    nextMeta = appendCharacterMedia(nextMeta, {
      type: 'image',
      url: 'https://example.com/portrait-2.png',
    });

    expect(getPrimaryImageUrl('', nextMeta)).toContain('portrait-2.png');
    expect(
      getPrimaryImageUrl('https://example.com/explicit.png', nextMeta),
    ).toContain('explicit.png');
  });

  it('removes an asset by list type and id', () => {
    let nextMeta: Record<string, unknown> = {};
    nextMeta = appendCharacterMedia(nextMeta, {
      type: 'audio',
      url: 'https://example.com/voice.mp3',
    });
    const [track] = getCharacterMedia(nextMeta).audioTracks;
    const removed = removeCharacterMedia(nextMeta, 'audio', track.id);

    expect(getCharacterMedia(removed).audioTracks).toHaveLength(0);
  });
});
