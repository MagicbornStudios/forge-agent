'use client';

import { useMutation } from '@tanstack/react-query';
import { AiService } from '@/lib/api-client';

export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: string;
  imageSize?: string;
}

export interface GenerateImageResult {
  imageUrl: string;
}

/**
 * TanStack Query mutation for image generation via OpenRouter.
 *
 * Wraps `AiService.postApiImageGenerate` so that callers (components,
 * copilot action handlers, etc.) never use raw `fetch()`.
 *
 * @example
 * ```tsx
 * const generateImage = useGenerateImage();
 * const { imageUrl } = await generateImage.mutateAsync({ prompt: 'A portrait of…' });
 * ```
 */
export function useGenerateImage() {
  return useMutation<GenerateImageResult, Error, GenerateImageParams>({
    mutationFn: async (params) => {
      const data = await AiService.postApiImageGenerate({
        prompt: params.prompt,
        ...(params.aspectRatio && { aspectRatio: params.aspectRatio }),
        ...(params.imageSize && { imageSize: params.imageSize }),
      });
      if (!data?.imageUrl) {
        throw new Error('Image generation failed — no imageUrl in response');
      }
      return { imageUrl: data.imageUrl as string };
    },
  });
}
