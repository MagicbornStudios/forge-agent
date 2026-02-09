'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { Textarea } from '@forge/ui/textarea';
import { Label } from '@forge/ui/label';
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
import { useElevenLabsVoices, useGenerateSpeech } from '@/lib/data/hooks';

interface Props {
  onSubmit: (data: { name: string; description?: string; imageUrl?: string; voiceId?: string | null }) => void;
  onClose: () => void;
}

const NO_VOICE_VALUE = '__none__';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

export function CreateCharacterModal({ onSubmit, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePreview = useCallback(async () => {
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
  }, [voiceId, previewText, generateSpeechMutation]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      setSubmitting(true);
      try {
        onSubmit({
          name: name.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          voiceId: voiceId ?? undefined,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [name, description, imageUrl, voiceId, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="char-name">Name *</Label>
        <Input
          id="char-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Character name"
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="char-desc">Description</Label>
        <Textarea
          id="char-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="char-img">Image URL</Label>
        <Input
          id="char-img"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Voice (optional)</Label>
        <Select
          value={voiceId ?? NO_VOICE_VALUE}
          onValueChange={(value) => setVoiceId(value === NO_VOICE_VALUE ? null : value)}
          disabled={voicesLoading || !!voicesError}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                voicesLoading ? 'Loading voices...' : voicesError ? 'Voice not configured' : 'Select voice'
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
        {voicesError && (
          <p className="text-xs text-muted-foreground">{voicesError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Voice preview</Label>
        <div className="flex gap-[var(--control-gap)]">
          <Input
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder={name ? `Hello, I'm ${name}.` : 'Type preview text...'}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={!voiceId || !previewText.trim() || previewLoading}
          >
            {previewLoading ? 'Playing...' : 'Play'}
          </Button>
        </div>
        {previewError && (
          <p className="text-xs text-destructive">{previewError}</p>
        )}
        {previewUrl && (
          <AudioPlayerProvider>
            <div className="flex items-center gap-[var(--control-gap)] rounded-md border border-border bg-muted/40 px-[var(--control-padding-x)] py-[var(--control-padding-y)]">
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

      <div className="flex gap-[var(--control-gap)] justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || submitting}>
          {submitting ? 'Creating...' : 'Create Character'}
        </Button>
      </div>
    </form>
  );
}
