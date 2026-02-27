import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ElevenLabs API key not configured' },
      { status: 503 }
    );
  }

  let body: { voiceId?: string; text?: string; modelId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const voiceId = typeof body.voiceId === 'string' ? body.voiceId.trim() : '';
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const modelId = typeof body.modelId === 'string' ? body.modelId.trim() : '';

  if (!voiceId || !text) {
    return NextResponse.json(
      { error: 'voiceId and text are required' },
      { status: 400 }
    );
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId: modelId || DEFAULT_MODEL_ID,
    });
    return new NextResponse(audioStream, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Speech generation failed';
    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  }
}
