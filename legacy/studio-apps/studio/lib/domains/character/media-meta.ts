export type CharacterMediaType = 'image' | 'audio' | 'video';
export type CharacterMediaSource = 'generated' | 'uploaded';

export interface CharacterMediaAsset {
  id: string;
  type: CharacterMediaType;
  url: string;
  createdAt: string;
  source: CharacterMediaSource;
  label?: string;
}

export interface CharacterMediaCollections {
  images: CharacterMediaAsset[];
  audioTracks: CharacterMediaAsset[];
  videos: CharacterMediaAsset[];
}

export interface CharacterPromptsMeta {
  characterBehavior?: string;
}

export interface CharacterMetaV1 {
  prompts?: CharacterPromptsMeta;
  media?: Partial<CharacterMediaCollections>;
  [key: string]: unknown;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : {};
}

function trimToUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildMediaId(type: CharacterMediaType): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${type}_${Date.now()}_${random}`;
}

function normalizeAssetList(
  value: unknown,
  type: CharacterMediaType,
): CharacterMediaAsset[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    const record = asRecord(entry);
    const url = trimToUndefined(record.url);
    if (!url) return [];
    return [
      {
        id: trimToUndefined(record.id) ?? buildMediaId(type),
        type,
        url,
        createdAt: trimToUndefined(record.createdAt) ?? new Date().toISOString(),
        source:
          trimToUndefined(record.source) === 'uploaded' ? 'uploaded' : 'generated',
        label: trimToUndefined(record.label),
      },
    ];
  });
}

export function getCharacterMeta(
  meta: Record<string, unknown> | null | undefined,
): CharacterMetaV1 {
  return asRecord(meta) as CharacterMetaV1;
}

export function getCharacterBehaviorPrompt(
  meta: Record<string, unknown> | null | undefined,
): string {
  const root = getCharacterMeta(meta);
  const prompts = asRecord(root.prompts);
  return trimToUndefined(prompts.characterBehavior) ?? '';
}

export function setCharacterBehaviorPrompt(
  meta: Record<string, unknown> | null | undefined,
  prompt: string,
): Record<string, unknown> {
  const root = getCharacterMeta(meta);
  const prompts = asRecord(root.prompts);
  const trimmed = trimToUndefined(prompt);
  if (trimmed) {
    prompts.characterBehavior = trimmed;
  } else {
    delete prompts.characterBehavior;
  }
  if (Object.keys(prompts).length > 0) {
    root.prompts = prompts;
  } else {
    delete root.prompts;
  }
  return root;
}

export function getCharacterMedia(
  meta: Record<string, unknown> | null | undefined,
): CharacterMediaCollections {
  const root = getCharacterMeta(meta);
  const media = asRecord(root.media);
  return {
    images: normalizeAssetList(media.images, 'image'),
    audioTracks: normalizeAssetList(media.audioTracks, 'audio'),
    videos: normalizeAssetList(media.videos, 'video'),
  };
}

function setCharacterMedia(
  meta: Record<string, unknown> | null | undefined,
  mediaCollections: CharacterMediaCollections,
): Record<string, unknown> {
  const root = getCharacterMeta(meta);
  root.media = {
    ...asRecord(root.media),
    images: mediaCollections.images,
    audioTracks: mediaCollections.audioTracks,
    videos: mediaCollections.videos,
  };
  return root;
}

export function appendCharacterMedia(
  meta: Record<string, unknown> | null | undefined,
  input: {
    type: CharacterMediaType;
    url: string;
    source?: CharacterMediaSource;
    label?: string;
  },
): Record<string, unknown> {
  const url = trimToUndefined(input.url);
  if (!url) return getCharacterMeta(meta);

  const media = getCharacterMedia(meta);
  const nextItem: CharacterMediaAsset = {
    id: buildMediaId(input.type),
    type: input.type,
    url,
    createdAt: new Date().toISOString(),
    source: input.source ?? 'generated',
    label: trimToUndefined(input.label),
  };

  if (input.type === 'image') {
    media.images = [nextItem, ...media.images];
  } else if (input.type === 'audio') {
    media.audioTracks = [nextItem, ...media.audioTracks];
  } else {
    media.videos = [nextItem, ...media.videos];
  }
  return setCharacterMedia(meta, media);
}

export function removeCharacterMedia(
  meta: Record<string, unknown> | null | undefined,
  type: CharacterMediaType,
  mediaId: string,
): Record<string, unknown> {
  const media = getCharacterMedia(meta);
  if (type === 'image') {
    media.images = media.images.filter((item) => item.id !== mediaId);
  } else if (type === 'audio') {
    media.audioTracks = media.audioTracks.filter((item) => item.id !== mediaId);
  } else {
    media.videos = media.videos.filter((item) => item.id !== mediaId);
  }
  return setCharacterMedia(meta, media);
}

export function getPrimaryImageUrl(
  imageUrl: string | null | undefined,
  meta: Record<string, unknown> | null | undefined,
): string | undefined {
  const explicit = trimToUndefined(imageUrl);
  if (explicit) return explicit;
  return getCharacterMedia(meta).images[0]?.url;
}
