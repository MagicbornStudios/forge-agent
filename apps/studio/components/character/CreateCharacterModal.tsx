'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { Textarea } from '@forge/ui/textarea';
import { Label } from '@forge/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@forge/ui/select';

interface Props {
  onSubmit: (data: { name: string; description?: string; imageUrl?: string; voiceId?: string | null }) => void;
  onClose: () => void;
}

const NO_VOICE_VALUE = '__none__';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

type VoiceOption = {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
};

export function CreateCharacterModal({ onSubmit, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setVoicesLoading(true);
    setVoicesError(null);
    fetch('/api/elevenlabs/voices')
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? 'Voice service unavailable');
        }
        return res.json() as Promise<{ voices?: VoiceOption[] }>;
      })
      .then((data) => {
        if (!active) return;
        setVoices(data.voices ?? []);
      })
      .catch((err) => {
        if (!active) return;
        setVoicesError(err instanceof Error ? err.message : 'Unable to load voices');
      })
      .finally(() => {
        if (!active) return;
        setVoicesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!previewUrl || !audioRef.current) return;
    audioRef.current.src = previewUrl;
    audioRef.current.play().catch(() => {});
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePreview = useCallback(async () => {
    if (!voiceId || !previewText.trim()) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await fetch('/api/elevenlabs/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId,
          text: previewText.trim(),
          modelId: DEFAULT_MODEL_ID,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Voice preview failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Voice preview failed');
    } finally {
      setPreviewLoading(false);
    }
  }, [voiceId, previewText]);

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
    [name, description, imageUrl, onSubmit],
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
        <div className="flex gap-2">
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
        <audio ref={audioRef} className="hidden" />
      </div>

      <div className="flex gap-2 justify-end pt-2">
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
