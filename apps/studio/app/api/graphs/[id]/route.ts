import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * @swagger
 * /api/graphs/{id}:
 *   get:
 *     summary: Get graph by ID
 *     tags: [graphs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Graph document
 *       500:
 *         description: Server error
 *   patch:
 *     summary: Update graph
 *     tags: [graphs]
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
 *               flow: {}
 *     responses:
 *       200:
 *         description: Updated graph document
 *       500:
 *         description: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const payload = await getPayload({ config });

    const result = await payload.findByID({
      collection: 'forge-graphs',
      id: parseInt(id, 10),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get graph:', error);
    return NextResponse.json(
      { error: 'Failed to get graph' },
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
      collection: 'forge-graphs',
      id: parseInt(id, 10),
      data: body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update graph:', error);
    return NextResponse.json(
      { error: 'Failed to update graph' },
      { status: 500 }
    );
  }
}
