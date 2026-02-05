import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * @swagger
 * /api/video-docs:
 *   get:
 *     summary: List video docs
 *     tags: [video-docs]
 *     responses:
 *       200:
 *         description: List of video doc documents
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create video doc
 *     tags: [video-docs]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               doc: {}
 *     responses:
 *       200:
 *         description: Created video doc document
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'video-docs',
    });
    return NextResponse.json(result.docs);
  } catch (error) {
    console.error('Failed to list video docs:', error);
    return NextResponse.json(
      { error: 'Failed to list video docs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const body = await request.json();

    const result = await payload.create({
      collection: 'video-docs',
      data: body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create video doc:', error);
    return NextResponse.json(
      { error: 'Failed to create video doc' },
      { status: 500 }
    );
  }
}
