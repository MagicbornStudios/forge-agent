'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getVoices, synthesizeSpeech, type ElevenLabsVoice } from '@/lib/api-client/elevenlabs';
import { studioKeys } from '../keys';

export type { ElevenLabsVoice } from '@/lib/api-client/elevenlabs';

export function useElevenLabsVoices() {
  return useQuery({
    queryKey: studioKeys.elevenlabsVoices(),
    queryFn: getVoices,
  });
}

export function useGenerateSpeech() {
  return useMutation({
    mutationFn: synthesizeSpeech,
  });
}
