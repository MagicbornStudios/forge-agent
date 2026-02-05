import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * @swagger
 * /api/video-docs/{id}:
 *   get:
 *     summary: Get video doc by ID
 *     tags: [video-docs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Video doc document
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update video doc
 *     tags: [video-docs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
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
 *         description: Updated video doc document
 *       500:
 *         description: Server error
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const payload = await getPayload({ config });

    const result = await payload.findByID({
      collection: 'video-docs',
      id: parseInt(id, 10),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get video doc:', error);
    return NextResponse.json(
      { error: 'Failed to get video doc' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const payload = await getPayload({ config });
    const body = await request.json();

    const result = await payload.update({
      collection: 'video-docs',
      id: parseInt(id, 10),
      data: body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update video doc:', error);
    return NextResponse.json(
      { error: 'Failed to update video doc' },
      { status: 500 }
    );
  }
}
