'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImageIcon, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { Textarea } from '@forge/ui/textarea';
import { Separator } from '@forge/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@forge/ui/select';
import { MediaCard } from '@forge/shared/components/media';
import { GenerateMediaModal } from '@forge/shared/components/media';
import { getInitials } from '@/lib/domains/character/operations';
import type { CharacterDoc } from '@/lib/domains/character/types';
import { AiService } from '@/lib/api-client';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  character: CharacterDoc | null;
  onUpdate: (id: number, updates: Partial<Pick<CharacterDoc, 'name' | 'description' | 'imageUrl' | 'voiceId'>>) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NO_VOICE_VALUE = '__none__';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

type VoiceOption = {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActiveCharacterPanel({ character, onUpdate }: Props) {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ---- Fetch voices -------------------------------------------------------
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

  // ---- Audio preview ------------------------------------------------------
  useEffect(() => {
    if (!previewUrl || !audioRef.current) return;
    audioRef.current.src = previewUrl;
    audioRef.current.play().catch(() => {});
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ---- Handlers -----------------------------------------------------------
  const handleNameBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (!character) return;
      const name = e.target.value.trim();
      if (name && name !== character.name) {
        onUpdate(character.id, { name });
      }
    },
    [character, onUpdate],
  );

  const handleDescBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (!character) return;
      const description = e.target.value.trim();
      if (description !== (character.description ?? '')) {
        onUpdate(character.id, { description });
      }
    },
    [character, onUpdate],
  );

  const handleVoiceChange = useCallback(
    (value: string) => {
      if (!character) return;
      const nextVoiceId = value === NO_VOICE_VALUE ? null : value;
      if (nextVoiceId !== (character.voiceId ?? null)) {
        onUpdate(character.id, { voiceId: nextVoiceId });
      }
    },
    [character, onUpdate],
  );

  const handlePreview = useCallback(async () => {
    if (!character?.voiceId || !previewText.trim()) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await fetch('/api/elevenlabs/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId: character.voiceId,
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
  }, [character, previewText]);

  const handleGenerateImage = useCallback(
    async (prompt: string, opts?: { aspectRatio?: string }) => {
      const data = await AiService.postApiImageGenerate({
        prompt,
        aspectRatio: opts?.aspectRatio ?? '3:4',
      });
      if (!data?.imageUrl) throw new Error('Image generation failed');
      return { imageUrl: data.imageUrl };
    },
    [],
  );

  // ---- Empty state --------------------------------------------------------
  if (!character) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center text-sm text-muted-foreground">
        Select a character to view details, or create a new one.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {/* Portrait — MediaCard */}
      <MediaCard
        src={character.imageUrl ?? undefined}
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
            label: 'Generate Portrait',
            icon: <Sparkles size={14} />,
            onClick: () => setShowGenerateModal(true),
          },
          ...(character.imageUrl
            ? [
                {
                  label: 'Remove Image',
                  icon: <Trash2 size={14} />,
                  variant: 'destructive' as const,
                  onClick: () => onUpdate(character.id, { imageUrl: '' }),
                },
              ]
            : []),
        ]}
      />

      {/* Generate Media Modal */}
      <GenerateMediaModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        defaultTab="text-to-image"
        enabledTabs={['text-to-image', 'image-to-video']}
        context={{
          name: character.name,
          description: character.description ?? undefined,
          existingImageUrl: character.imageUrl ?? undefined,
        }}
        generateImage={handleGenerateImage}
        onGenerated={(result) => {
          if (result.type === 'image') {
            onUpdate(character.id, { imageUrl: result.url });
          }
        }}
      />

      <Separator />

      {/* Name */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Name
        </label>
        <Input
          key={character.id}
          defaultValue={character.name}
          onBlur={handleNameBlur}
          className="text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Description
        </label>
        <Textarea
          key={character.id}
          defaultValue={character.description ?? ''}
          onBlur={handleDescBlur}
          rows={5}
          className="text-sm resize-none"
        />
      </div>

      <Separator />

      {/* Voice */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Voice
        </label>
        <Select
          value={character.voiceId ?? NO_VOICE_VALUE}
          onValueChange={handleVoiceChange}
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
        <div className="flex gap-2">
          <Input
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder={`Hello, I'm ${character.name}.`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            disabled={!character.voiceId || !previewText.trim() || previewLoading}
          >
            {previewLoading ? 'Playing...' : 'Play'}
          </Button>
        </div>
        {previewError && (
          <p className="text-xs text-destructive">{previewError}</p>
        )}
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  );
}
