'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FileText,
  ImagePlus,
  Loader2,
  Mic2,
  Sparkles,
  Trash2,
  User,
  WandSparkles,
} from 'lucide-react';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { Textarea } from '@forge/ui/textarea';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@forge/ui/form';
import { MediaCard, type GenerateMediaResult } from '@forge/shared/components/media';
import { useElevenLabsVoices, useGenerateSpeech } from '@/lib/data/hooks';
import type { CharacterDoc } from '@/lib/domains/character/types';
import { ConnectedGenerateMediaModal } from '@/components/media/ConnectedGenerateMediaModal';
import { getInitials } from '@/lib/domains/character/operations';
import {
  appendCharacterMedia,
  getCharacterBehaviorPrompt,
  getCharacterMedia,
  getPrimaryImageUrl,
  removeCharacterMedia,
  setCharacterBehaviorPrompt,
  type CharacterMediaType,
} from '@/lib/domains/character/media-meta';

interface CharacterUpsertPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  voiceId?: string | null;
  meta?: Record<string, unknown>;
}

interface Props {
  character?: CharacterDoc | null;
  onCreate: (data: CharacterUpsertPayload) => Promise<CharacterDoc>;
  onUpdate: (id: number, updates: Partial<CharacterUpsertPayload>) => Promise<void>;
  onClose: () => void;
}

interface CharacterFormValues {
  name: string;
  description: string;
  imageUrl: string;
  voiceId: string;
  characterBehavior: string;
}

const NO_VOICE_VALUE = '__none__';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

function trimToUndefined(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function mapToMediaType(type: GenerateMediaResult['type']): CharacterMediaType {
  if (type === 'audio') return 'audio';
  if (type === 'video') return 'video';
  return 'image';
}

function toVoiceId(value: string): string | null {
  return value === NO_VOICE_VALUE ? null : value;
}

function getDefaultValues(character?: CharacterDoc | null): CharacterFormValues {
  return {
    name: character?.name ?? '',
    description: character?.description ?? '',
    imageUrl: character?.imageUrl ?? '',
    voiceId: character?.voiceId ?? NO_VOICE_VALUE,
    characterBehavior: getCharacterBehaviorPrompt(character?.meta ?? null),
  };
}

export function CreateCharacterModal({
  character,
  onCreate,
  onUpdate,
  onClose,
}: Props) {
  const [persistedCharacter, setPersistedCharacter] = useState<CharacterDoc | null>(
    character ?? null,
  );
  const [metaDraft, setMetaDraft] = useState<Record<string, unknown>>(
    (character?.meta as Record<string, unknown>) ?? {},
  );
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);

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

  const form = useForm<CharacterFormValues>({
    defaultValues: getDefaultValues(character),
    mode: 'onChange',
  });

  useEffect(() => {
    setPersistedCharacter(character ?? null);
    setMetaDraft((character?.meta as Record<string, unknown>) ?? {});
    setSubmitError(null);
    setPreviewError(null);
    form.reset(getDefaultValues(character));
  }, [character?.id, character?.updatedAt, form, character]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const media = useMemo(() => getCharacterMedia(metaDraft), [metaDraft]);
  const watchedName = form.watch('name');
  const watchedDescription = form.watch('description');
  const watchedImageUrl = form.watch('imageUrl');
  const watchedVoiceId = form.watch('voiceId');
  const primaryImageUrl = getPrimaryImageUrl(watchedImageUrl, metaDraft);

  const buildPayload = useCallback(
    (values: CharacterFormValues): CharacterUpsertPayload => {
      const nextMeta = setCharacterBehaviorPrompt(metaDraft, values.characterBehavior);
      return {
        name: values.name.trim(),
        description: trimToUndefined(values.description),
        imageUrl: trimToUndefined(values.imageUrl),
        voiceId: toVoiceId(values.voiceId),
        meta: nextMeta,
      };
    },
    [metaDraft],
  );

  const ensurePersistedCharacter = useCallback(async (): Promise<CharacterDoc | null> => {
    if (persistedCharacter?.id) return persistedCharacter;

    setSubmitError(null);
    const isValid = await form.trigger('name');
    if (!isValid) return null;

    const values = form.getValues();
    const payload = buildPayload(values);
    setSavingDraft(true);
    try {
      const created = await onCreate(payload);
      setPersistedCharacter(created);
      setMetaDraft((created.meta as Record<string, unknown>) ?? (payload.meta ?? {}));
      if (created.imageUrl) {
        form.setValue('imageUrl', created.imageUrl, { shouldDirty: false });
      }
      return created;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create character.');
      return null;
    } finally {
      setSavingDraft(false);
    }
  }, [buildPayload, form, onCreate, persistedCharacter]);

  const persistMediaMeta = useCallback(
    async (
      nextMeta: Record<string, unknown>,
      imageUrlOverride?: string | undefined,
    ): Promise<void> => {
      const target = await ensurePersistedCharacter();
      if (!target?.id) return;

      const updates: Partial<CharacterUpsertPayload> = { meta: nextMeta };
      if (imageUrlOverride !== undefined) {
        updates.imageUrl = imageUrlOverride;
      }
      await onUpdate(target.id, updates);
      setPersistedCharacter((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
              meta: nextMeta,
            }
          : prev,
      );
      setMetaDraft(nextMeta);
    },
    [ensurePersistedCharacter, onUpdate],
  );

  const handlePreview = useCallback(async () => {
    const voiceId = toVoiceId(watchedVoiceId);
    if (!voiceId || !previewText.trim()) return;
    setPreviewError(null);
    try {
      const result = await generateSpeechMutation.mutateAsync({
        voiceId,
        text: previewText.trim(),
        modelId: DEFAULT_MODEL_ID,
      });
      setPreviewUrl(result.audioUrl);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Voice preview failed');
    }
  }, [watchedVoiceId, previewText, generateSpeechMutation]);

  const handleOpenGenerateMedia = useCallback(async () => {
    const target = await ensurePersistedCharacter();
    if (!target?.id) return;
    setShowGenerateModal(true);
  }, [ensurePersistedCharacter]);

  const handleGeneratedMedia = useCallback(
    async (result: GenerateMediaResult) => {
      const target = await ensurePersistedCharacter();
      if (!target?.id) return;

      setSubmitError(null);
      setSavingMedia(true);
      try {
        const nextMeta = appendCharacterMedia(metaDraft, {
          type: mapToMediaType(result.type),
          url: result.url,
          source: 'generated',
        });

        const currentImage = trimToUndefined(form.getValues('imageUrl'));
        const nextImage =
          result.type === 'image' && !currentImage ? result.url : currentImage;

        if (result.type === 'image' && !currentImage) {
          form.setValue('imageUrl', result.url, { shouldDirty: true });
        }

        await persistMediaMeta(nextMeta, nextImage);
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : 'Failed to persist generated media.',
        );
      } finally {
        setSavingMedia(false);
      }
    },
    [ensurePersistedCharacter, form, metaDraft, persistMediaMeta],
  );

  const handleRemoveMedia = useCallback(
    async (type: CharacterMediaType, mediaId: string, url?: string) => {
      const target = await ensurePersistedCharacter();
      if (!target?.id) return;
      setSavingMedia(true);
      setSubmitError(null);
      try {
        const nextMeta = removeCharacterMedia(metaDraft, type, mediaId);
        if (type !== 'image') {
          await persistMediaMeta(nextMeta);
          return;
        }

        const currentImage = trimToUndefined(form.getValues('imageUrl'));
        if (currentImage && currentImage === trimToUndefined(url)) {
          const fallbackImage = getPrimaryImageUrl(undefined, nextMeta) ?? '';
          form.setValue('imageUrl', fallbackImage, { shouldDirty: true });
          await persistMediaMeta(nextMeta, fallbackImage);
          return;
        }

        await persistMediaMeta(nextMeta);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to remove media.');
      } finally {
        setSavingMedia(false);
      }
    },
    [ensurePersistedCharacter, form, metaDraft, persistMediaMeta],
  );

  const handleSetPrimaryImage = useCallback(
    async (url: string) => {
      form.setValue('imageUrl', url, { shouldDirty: true });
      if (!persistedCharacter?.id) return;
      try {
        await onUpdate(persistedCharacter.id, { imageUrl: url });
        setPersistedCharacter((prev) => (prev ? { ...prev, imageUrl: url } : prev));
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to set primary image.');
      }
    },
    [form, onUpdate, persistedCharacter],
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildPayload(values);
      if (persistedCharacter?.id) {
        const normalizedImage = values.imageUrl.trim();
        payload.imageUrl = normalizedImage.length > 0 ? normalizedImage : '';
        await onUpdate(persistedCharacter.id, payload);
      } else {
        await onCreate(payload);
      }
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save character.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-[var(--panel-padding)]">
          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-[var(--panel-padding)] space-y-[var(--control-gap)]">
            <div className="flex items-center gap-[var(--control-gap)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <User className="size-[var(--icon-size)]" />
              Basics
            </div>
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Character name" autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Short description..."
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-[var(--panel-padding)] space-y-[var(--control-gap)]">
            <div className="flex items-center gap-[var(--control-gap)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <FileText className="size-[var(--icon-size)]" />
              Prompt
            </div>
            <FormField
              control={form.control}
              name="characterBehavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Character behavior prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Describe personality, style, and response behavior for this entity..."
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-[var(--panel-padding)] space-y-[var(--control-gap)]">
            <div className="flex items-center gap-[var(--control-gap)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Mic2 className="size-[var(--icon-size)]" />
              Voice
            </div>
            <FormField
              control={form.control}
              name="voiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice (optional)</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={voicesLoading || !!voicesError}
                  >
                    <FormControl>
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
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_VOICE_VALUE}>No voice</SelectItem>
                      {voices.map((voice) => (
                        <SelectItem key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {voicesError && (
                    <p className="text-xs text-muted-foreground">{voicesError}</p>
                  )}
                </FormItem>
              )}
            />
            <div className="space-y-[var(--control-gap)]">
              <FormLabel>Voice preview</FormLabel>
              <div className="flex gap-[var(--control-gap)]">
                <Input
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder={
                    watchedName
                      ? `Hello, I am ${watchedName.trim() || 'this character'}.`
                      : 'Type preview text...'
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={!toVoiceId(watchedVoiceId) || !previewText.trim() || previewLoading}
                >
                  {previewLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Mic2 />
                  )}
                  Preview
                </Button>
              </div>
              {previewError && <p className="text-xs text-destructive">{previewError}</p>}
              {previewUrl && (
                <AudioPlayerProvider>
                  <div className="flex items-center gap-[var(--control-gap)] rounded-[var(--radius-md)] border border-border bg-muted/40 px-[var(--control-padding-x)] py-[var(--control-padding-y)]">
                    <AudioPlayerButton
                      item={{ id: 'voice-preview', src: previewUrl }}
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

          <div className="rounded-[var(--radius-lg)] border border-border bg-card p-[var(--panel-padding)] space-y-[var(--control-gap)]">
            <div className="flex items-center justify-between gap-[var(--control-gap)]">
              <div className="flex items-center gap-[var(--control-gap)] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <ImagePlus className="size-[var(--icon-size)]" />
                Entity media
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenGenerateMedia}
                disabled={savingDraft || savingMedia}
              >
                {savingDraft || savingMedia ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <WandSparkles />
                )}
                Generate or Upload
              </Button>
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary portrait URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MediaCard
              src={primaryImageUrl}
              type="image"
              alt={watchedName || 'Character portrait'}
              aspectRatio="3/4"
              fallback={
                <span className="text-4xl font-semibold text-muted-foreground select-none">
                  {getInitials(watchedName)}
                </span>
              }
              actions={[
                {
                  label: 'Generate portrait',
                  icon: <Sparkles />,
                  onClick: () => {
                    void handleOpenGenerateMedia();
                  },
                },
                ...(primaryImageUrl
                  ? [
                      {
                        label: 'Clear portrait',
                        icon: <Trash2 />,
                        variant: 'destructive' as const,
                        onClick: () => {
                          form.setValue('imageUrl', '', { shouldDirty: true });
                        },
                      },
                    ]
                  : []),
              ]}
            />

            <div className="space-y-[var(--control-gap)]">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Images ({media.images.length})
              </p>
              {media.images.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No generated or uploaded images yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-[var(--control-gap)]">
                  {media.images.map((item) => (
                    <div
                      key={item.id}
                      className="space-y-[var(--control-gap)] rounded-[var(--radius-md)] border border-border p-[var(--control-padding-y)]"
                    >
                        <img
                          src={item.url}
                          alt={(item.label ?? watchedName) || 'Character image'}
                          className="h-24 w-full rounded-[var(--radius-sm)] object-cover"
                        />
                      <div className="flex gap-[var(--control-gap)]">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            void handleSetPrimaryImage(item.url);
                          }}
                        >
                          Set primary
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            void handleRemoveMedia('image', item.id, item.url);
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-[var(--control-gap)]">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Audio tracks ({media.audioTracks.length})
              </p>
              {media.audioTracks.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No generated audio tracks yet.
                </p>
              ) : (
                <div className="space-y-[var(--control-gap)]">
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
            </div>
          </div>

          {submitError && <p className="text-xs text-destructive">{submitError}</p>}

          <div className="flex justify-end gap-[var(--control-gap)] pt-[var(--control-gap)]">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || savingDraft || savingMedia}>
              {(submitting || savingDraft || savingMedia) && (
                <Loader2 className="animate-spin" />
              )}
              {persistedCharacter?.id ? 'Save Character' : 'Create Character'}
            </Button>
          </div>
        </form>
      </Form>

      <ConnectedGenerateMediaModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        defaultTab="text-to-image"
        enabledTabs={['text-to-image', 'image-to-video', 'text-to-speech', 'upload']}
        context={{
          name: trimToUndefined(watchedName),
          description: trimToUndefined(watchedDescription),
          existingImageUrl: primaryImageUrl,
        }}
        onGenerated={(result) => {
          void handleGeneratedMedia(result);
        }}
      />
    </>
  );
}
