import { NextResponse } from 'next/server';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/voices';

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ElevenLabs API key not configured' },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(ELEVENLABS_API_URL, {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: 'Failed to fetch voices', details: text.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      voices?: Array<{ voice_id: string; name: string; labels?: Record<string, string> }>;
    };

    return NextResponse.json({
      voices: (data.voices ?? []).map((voice) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        labels: voice.labels,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
