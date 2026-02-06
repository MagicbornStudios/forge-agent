'use client';

import { useMutation } from '@tanstack/react-query';

export interface GenerateVideoParams {
  /** Source image URL for image-to-video, or undefined for text-to-video. */
  sourceImageUrl?: string;
  /** Text prompt describing the video to generate. */
  prompt: string;
}

export interface GenerateVideoResult {
  videoUrl: string;
}

/**
 * TanStack Query mutation stub for video generation.
 *
 * This hook establishes the contract for video generation but throws
 * "not implemented" until a video generation API route is available.
 *
 * @example
 * ```tsx
 * const generateVideo = useGenerateVideo();
 * const { videoUrl } = await generateVideo.mutateAsync({ prompt: 'A cinematic…' });
 * ```
 */
export function useGenerateVideo() {
  return useMutation<GenerateVideoResult, Error, GenerateVideoParams>({
    mutationFn: async (_params) => {
      throw new Error(
        'Video generation is not yet available. Configure a video generation model in OpenRouter to enable this feature.',
      );
    },
  });
}
