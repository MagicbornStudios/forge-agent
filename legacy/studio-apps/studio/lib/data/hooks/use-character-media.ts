'use client';

import { useMutation } from '@tanstack/react-query';
import { uploadFile, type MediaUploadResult } from '@/lib/api-client/media';

export type { MediaUploadResult } from '@/lib/api-client/media';

/** Upload an image file to the Payload media collection. */
export function useUploadMedia() {
  return useMutation({
    mutationFn: uploadFile,
  });
}
