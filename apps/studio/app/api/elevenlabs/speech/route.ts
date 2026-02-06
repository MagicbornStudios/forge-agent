import { NextRequest, NextResponse } from 'next/server';

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
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: modelId || DEFAULT_MODEL_ID,
      }),
    });

    if (!res.ok) {
      const textBody = await res.text();
      return NextResponse.json(
        { error: 'Speech generation failed', details: textBody.slice(0, 200) },
        { status: 502 }
      );
    }

    const audioBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') ?? 'audio/mpeg';
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Speech generation failed' },
      { status: 500 }
    );
  }
}
