'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PencilLine, Sparkles, Trash2, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { Textarea } from '@forge/ui/textarea';
import { Separator } from '@forge/ui/separator';
import {
  AudioPlayerProvider,
  AudioPlayerButton,
  AudioPlayerProgress,
  AudioPlayerTime,
  AudioPlayerDuration,
} from '@forge/ui/audio-player';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@forge/ui/select';
import { MediaCard, type GenerateMediaResult } from '@forge/shared/components/media';
import { ConnectedGenerateMediaModal } from '@/components/media/ConnectedGenerateMediaModal';
import { getInitials } from '@/lib/domains/character/operations';
import type { CharacterDoc } from '@/lib/domains/character/types';
import { useElevenLabsVoices, useGenerateSpeech } from '@/lib/data/hooks';
import {
  appendCharacterMedia,
  getCharacterMedia,
  getPrimaryImageUrl,
  removeCharacterMedia,
  type CharacterMediaType,
} from '@/lib/domains/character/media-meta';

interface Props {
  character: CharacterDoc | null;
  onUpdate: (
    id: number,
    updates: Partial<
      Pick<CharacterDoc, 'name' | 'description' | 'imageUrl' | 'voiceId' | 'meta'>
    >,
  ) => Promise<void> | void;
  onOpenUpsert?: (characterId: number) => void;
}

const NO_VOICE_VALUE = '__none__';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

function trimToUndefined(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toMediaType(type: GenerateMediaResult['type']): CharacterMediaType {
  if (type === 'audio') return 'audio';
  if (type === 'video') return 'video';
  return 'image';
}

export function ActiveCharacterPanel({
  character,
  onUpdate,
  onOpenUpsert,
}: Props) {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const voicesQuery = useElevenLabsVoices();
  const generateSpeechMutation = useGenerateSpeech();
  const voices = voicesQuery.data ?? [];
  const voicesLoading = voicesQuery.isLoading;
  const voicesError = voicesQuery.error
    ? voicesQuery.error instanceof Error
      ? voicesQuery.error.message
      : 'Unable to load voices'
    : null;
  const previewLoading = generateSpeechMutation.isPending;
  const media = useMemo(
    () => getCharacterMedia(character?.meta as Record<string, unknown> | null | undefined),
    [character?.meta],
  );
  const primaryImageUrl = getPrimaryImageUrl(
    character?.imageUrl,
    character?.meta as Record<string, unknown> | null | undefined,
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleNameBlur = useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      if (!character) return;
      const name = e.target.value.trim();
      if (name && name !== character.name) {
        await onUpdate(character.id, { name });
      }
    },
    [character, onUpdate],
  );

  const handleDescBlur = useCallback(
    async (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (!character) return;
      const description = e.target.value.trim();
      if (description !== (character.description ?? '')) {
        await onUpdate(character.id, { description });
      }
    },
    [character, onUpdate],
  );

  const handleVoiceChange = useCallback(
    async (value: string) => {
      if (!character) return;
      const nextVoiceId = value === NO_VOICE_VALUE ? null : value;
      if (nextVoiceId !== (character.voiceId ?? null)) {
        await onUpdate(character.id, { voiceId: nextVoiceId });
      }
    },
    [character, onUpdate],
  );

  const handlePreview = useCallback(async () => {
    if (!character?.voiceId || !previewText.trim()) return;
    setPreviewError(null);
    try {
      const result = await generateSpeechMutation.mutateAsync({
        voiceId: character.voiceId,
        text: previewText.trim(),
        modelId: DEFAULT_MODEL_ID,
      });
      setPreviewUrl(result.audioUrl);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Voice preview failed');
    }
  }, [character, previewText, generateSpeechMutation]);

  const handleGeneratedMedia = useCallback(
    async (result: GenerateMediaResult) => {
      if (!character) return;
      setMediaError(null);
      try {
        const nextMeta = appendCharacterMedia(
          character.meta as Record<string, unknown> | null | undefined,
          {
            type: toMediaType(result.type),
            url: result.url,
            source: 'generated',
          },
        );

        const updates: Partial<Pick<CharacterDoc, 'imageUrl' | 'meta'>> = { meta: nextMeta };
        const existingImage = trimToUndefined(character.imageUrl);
        if (result.type === 'image' && !existingImage) {
          updates.imageUrl = result.url;
        }
        await onUpdate(character.id, updates);
      } catch (err) {
        setMediaError(err instanceof Error ? err.message : 'Failed to save generated media.');
      }
    },
    [character, onUpdate],
  );

  const handleRemoveMedia = useCallback(
    async (type: CharacterMediaType, mediaId: string, url?: string) => {
      if (!character) return;
      setMediaError(null);
      try {
        const nextMeta = removeCharacterMedia(
          character.meta as Record<string, unknown> | null | undefined,
          type,
          mediaId,
        );
        const updates: Partial<Pick<CharacterDoc, 'imageUrl' | 'meta'>> = { meta: nextMeta };

        if (type === 'image' && trimToUndefined(character.imageUrl) === trimToUndefined(url)) {
          updates.imageUrl = getPrimaryImageUrl(undefined, nextMeta) ?? '';
        }
        await onUpdate(character.id, updates);
      } catch (err) {
        setMediaError(err instanceof Error ? err.message : 'Failed to remove media.');
      }
    },
    [character, onUpdate],
  );

  const handleSetPrimaryImage = useCallback(
    async (url: string) => {
      if (!character) return;
      try {
        await onUpdate(character.id, { imageUrl: url });
      } catch (err) {
        toast.error('Failed to set portrait', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    },
    [character, onUpdate],
  );

  if (!character) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center text-sm text-muted-foreground">
        Select a character to view details, or create a new one.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-[var(--panel-padding)] space-y-[var(--panel-padding)]">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenUpsert?.(character.id)}
        >
          <PencilLine />
          Edit character
        </Button>
      </div>

      <MediaCard
        src={primaryImageUrl}
        type="image"
        alt={character.name}
        aspectRatio="3/4"
        fallback={
          <span className="text-4xl font-bold text-muted-foreground select-none">
            {getInitials(character.name)}
          </span>
        }
        actions={[
          {
            label: 'Generate portrait',
            icon: <Sparkles />,
            onClick: () => setShowGenerateModal(true),
          },
          ...(primaryImageUrl
            ? [
                {
                  label: 'Clear portrait',
                  icon: <Trash2 />,
                  variant: 'destructive' as const,
                  onClick: () => onUpdate(character.id, { imageUrl: '' }),
                },
              ]
            : []),
        ]}
      />

      <ConnectedGenerateMediaModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        defaultTab="text-to-image"
        enabledTabs={['text-to-image', 'image-to-video', 'text-to-speech', 'upload']}
        context={{
          name: character.name,
          description: character.description ?? undefined,
          existingImageUrl: primaryImageUrl,
        }}
        onGenerated={(result) => {
          void handleGeneratedMedia(result);
        }}
      />

      {mediaError && <p className="text-xs text-destructive">{mediaError}</p>}

      {media.images.length > 0 && (
        <div className="space-y-[var(--control-gap)]">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Image variants
          </p>
          <div className="grid grid-cols-2 gap-[var(--control-gap)]">
            {media.images.map((image) => (
              <div
                key={image.id}
                className="space-y-[var(--control-gap)] rounded-[var(--radius-md)] border border-border p-[var(--control-padding-y)]"
              >
                <img
                  src={image.url}
                  alt={character.name}
                  className="h-20 w-full rounded-[var(--radius-sm)] object-cover"
                />
                <div className="flex gap-[var(--control-gap)]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      void handleSetPrimaryImage(image.url);
                    }}
                  >
                    Set primary
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      void handleRemoveMedia('image', image.id, image.url);
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {media.audioTracks.length > 0 && (
        <div className="space-y-[var(--control-gap)]">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Audio tracks
          </p>
          {media.audioTracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-[var(--control-gap)] rounded-[var(--radius-md)] border border-border px-[var(--control-padding-x)] py-[var(--control-padding-y)]"
            >
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls className="w-full" src={track.url} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  void handleRemoveMedia('audio', track.id, track.url);
                }}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Separator />

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Name
        </label>
        <Input key={character.id} defaultValue={character.name} onBlur={handleNameBlur} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Description
        </label>
        <Textarea
          key={character.id}
          defaultValue={character.description ?? ''}
          onBlur={handleDescBlur}
          rows={5}
          className="resize-none"
        />
      </div>

      <Separator />

      <div className="space-y-[var(--control-gap)]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Voice
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowGenerateModal(true)}
          >
            <WandSparkles />
            Add media
          </Button>
        </div>
        <Select
          value={character.voiceId ?? NO_VOICE_VALUE}
          onValueChange={(value) => {
            void handleVoiceChange(value);
          }}
          disabled={voicesLoading || !!voicesError}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                voicesLoading
                  ? 'Loading voices...'
                  : voicesError
                    ? 'Voice not configured'
                    : 'Select voice'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_VOICE_VALUE}>No voice</SelectItem>
            {voices.map((voice) => (
              <SelectItem key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {voicesError && <p className="text-xs text-muted-foreground">{voicesError}</p>}
        <div className="flex gap-[var(--control-gap)]">
          <Input
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder={`Hello, I am ${character.name}.`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void handlePreview();
            }}
            disabled={!character.voiceId || !previewText.trim() || previewLoading}
          >
            {previewLoading ? 'Playing...' : 'Play'}
          </Button>
        </div>
        {previewError && <p className="text-xs text-destructive">{previewError}</p>}
        {previewUrl && (
          <AudioPlayerProvider>
            <div className="flex items-center gap-[var(--control-gap)] rounded-[var(--radius-md)] border border-border bg-muted/40 px-[var(--control-padding-x)] py-[var(--control-padding-y)]">
              <AudioPlayerButton
                item={{ id: 'preview', src: previewUrl }}
                variant="ghost"
                size="icon"
              />
              <AudioPlayerProgress className="flex-1" />
              <div className="flex items-center gap-1 text-xs">
                <AudioPlayerTime className="text-xs" />
                <span className="text-muted-foreground">/</span>
                <AudioPlayerDuration className="text-xs" />
              </div>
            </div>
          </AudioPlayerProvider>
        )}
      </div>
    </div>
  );
}
