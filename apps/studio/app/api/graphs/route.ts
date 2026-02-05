import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * @swagger
 * /api/graphs:
 *   get:
 *     summary: List graphs
 *     tags: [graphs]
 *     responses:
 *       200:
 *         description: List of forge graph documents
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create graph
 *     tags: [graphs]
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
 *         description: Created graph document
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    const payload = await getPayload({ config });

    const result = await payload.find({
      collection: 'forge-graphs',
    });

    return NextResponse.json(result.docs);
  } catch (error) {
    console.error('Failed to list graphs:', error);
    return NextResponse.json(
      { error: 'Failed to list graphs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const body = await request.json();

    const result = await payload.create({
      collection: 'forge-graphs',
      data: body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create graph:', error);
    return NextResponse.json(
      { error: 'Failed to create graph' },
      { status: 500 }
    );
  }
}
