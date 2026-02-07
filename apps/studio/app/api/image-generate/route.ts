import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterConfig } from '@/lib/openrouter-config';
import { DEFAULT_IMAGE_MODEL } from '@/lib/model-router/defaults';

/**
 * @swagger
 * /api/image-generate:
 *   post:
 *     summary: Generate image from prompt via OpenRouter (image modality)
 *     tags: [ai]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt: { type: string }
 *               aspectRatio: { type: string }
 *               imageSize: { type: string }
 *     responses:
 *       200:
 *         description: Base64 data URL of generated image
 *       400:
 *         description: prompt required
 *       503:
 *         description: OpenRouter not configured
 */
export async function POST(request: NextRequest) {
  const config = getOpenRouterConfig();
  if (!config.apiKey) {
    return NextResponse.json(
      { error: 'OpenRouter API key not configured' },
      { status: 503 }
    );
  }

  let body: { prompt?: string; aspectRatio?: string; imageSize?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json(
      { error: 'prompt is required' },
      { status: 400 }
    );
  }

  const model = process.env.OPENROUTER_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL;
  // Image gen uses a single default (or env); no fallbacks. See docs for model list.
  const imageConfig: Record<string, string> = {};
  if (body.aspectRatio) imageConfig.aspect_ratio = body.aspectRatio;
  if (body.imageSize) imageConfig.image_size = body.imageSize;

  const payload = {
    model,
    messages: [{ role: 'user' as const, content: prompt }],
    modalities: ['image', 'text'] as const,
    stream: false,
    ...(Object.keys(imageConfig).length > 0 ? { image_config: imageConfig } : {}),
  };

  try {
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://forge-agent-poc.local',
        'X-Title': 'Forge Agent PoC',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(config.timeoutMs),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[image-generate] OpenRouter error', res.status, text);
      return NextResponse.json(
        { error: 'Image generation failed', details: text.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{
        message?: {
          images?: Array<{ image_url?: { url?: string }; imageUrl?: { url?: string } }>;
        };
      }>;
    };

    const message = data.choices?.[0]?.message;
    const images = message?.images;
    const first = images?.[0];
    const url = first?.image_url?.url ?? first?.imageUrl?.url;
    if (!url) {
      return NextResponse.json(
        { error: 'No image in response' },
        { status: 502 }
      );
    }

    return NextResponse.json({ imageUrl: url, prompt });
  } catch (err) {
    console.error('[image-generate]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Image generation failed' },
      { status: 500 }
    );
  }
}
