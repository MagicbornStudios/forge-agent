import { NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ElevenLabs API key not configured' },
      { status: 503 }
    );
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const response = await client.voices.getAll();
    const voices = response.voices ?? [];
    return NextResponse.json({
      voices: voices.map((v) => ({
        voice_id: v.voiceId ?? '',
        name: v.name ?? '',
        labels: v.labels,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch voices';
    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }
}
