/**
 * Client for our Next API proxy to ElevenLabs (voices, text-to-speech).
 * API key stays server-side; browser calls only /api/elevenlabs/*.
 */

import { API_ROUTES } from './routes';

export type ElevenLabsVoice = {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
};

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include' });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error ?? `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function getVoices(): Promise<ElevenLabsVoice[]> {
  const data = await getJson<{ voices?: ElevenLabsVoice[] }>('/api/elevenlabs/voices');
  return data.voices ?? [];
}

export async function synthesizeSpeech(params: {
  voiceId: string;
  text: string;
  modelId?: string;
}): Promise<{ audioUrl: string }> {
  const res = await fetch(API_ROUTES.ELEVENLABS_SPEECH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? 'Voice preview failed');
  }
  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);
  return { audioUrl };
}
