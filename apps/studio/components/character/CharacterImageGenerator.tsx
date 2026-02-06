'use client';

import React, { useCallback, useState } from 'react';
import { Button } from '@forge/ui/button';
import { Textarea } from '@forge/ui/textarea';
import { AiService } from '@/lib/api-client';
import type { CharacterDoc } from '@/lib/domains/character/types';

interface Props {
  character: CharacterDoc;
  onImageGenerated: (imageUrl: string) => void;
}

export function CharacterImageGenerator({ character, onImageGenerated }: Props) {
  const defaultPrompt = `Detailed character portrait of "${character.name}". ${character.description ?? ''} High quality, detailed face, 3:4 aspect ratio.`.trim();

  const [prompt, setPrompt] = useState(defaultPrompt);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const data = await AiService.postApiImageGenerate({ prompt, aspectRatio: '3:4' });
      if (data?.imageUrl) {
        setPreview(data.imageUrl);
      } else {
        setError('No image returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image generation failed');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  return (
    <div className="space-y-3 rounded-lg border bg-muted/50 p-3">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        AI Portrait Generator
      </label>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        className="text-xs resize-none"
        placeholder="Describe the character portrait..."
      />

      <Button
        variant="default"
        size="sm"
        className="w-full"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
      >
        {loading ? 'Generating...' : 'Generate'}
      </Button>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {preview && (
        <div className="space-y-2">
          <img
            src={preview}
            alt="Generated portrait"
            className="w-full rounded-md border"
          />
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => onImageGenerated(preview)}
          >
            Apply Portrait
          </Button>
        </div>
      )}
    </div>
  );
}
