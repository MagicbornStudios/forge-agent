import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

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
