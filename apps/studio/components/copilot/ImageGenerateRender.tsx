'use client';

import React from 'react';

interface ImageGenerateRenderProps {
  status: string;
  args: Record<string, unknown>;
  result?: { success: boolean; message?: string; data?: { imageUrl?: string } };
}

/** Renders generated image in chat when app_generateImage action completes. */
export function ImageGenerateRender({ status, args, result }: ImageGenerateRenderProps) {
  const imageUrl = result?.data?.imageUrl;
  const prompt = typeof args.prompt === 'string' ? args.prompt : '';

  if (status === 'complete' && imageUrl) {
    return (
      <div className="rounded-md border p-3 bg-muted/50 space-y-2">
        <p className="text-sm font-medium">Generated image</p>
        {prompt && (
          <p className="text-xs text-muted-foreground line-clamp-2">{prompt}</p>
        )}
        <img
          src={imageUrl}
          alt={prompt || 'Generated image'}
          className="max-w-full max-h-80 object-contain rounded border"
        />
      </div>
    );
  }
  if (status === 'inProgress') {
    return (
      <div className="rounded-md border p-3 bg-muted/50 animate-pulse">
        <p className="text-sm text-muted-foreground">Generating image...</p>
      </div>
    );
  }
  if (status === 'complete' && result && !result.success) {
    return (
      <div className="rounded-md border p-3 bg-destructive/10">
        <p className="text-sm text-destructive">{result.message ?? 'Image generation failed'}</p>
      </div>
    );
  }
  return null;
}
