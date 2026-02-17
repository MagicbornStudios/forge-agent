import { NextResponse } from 'next/server';
import { getRepoSettingsSnapshot } from '@/lib/settings/repository';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = String(url.searchParams.get('workspaceId') || 'planning');
  const loopId = String(url.searchParams.get('loopId') || 'default');

  try {
    const snapshot = await getRepoSettingsSnapshot({ workspaceId, loopId });
    return NextResponse.json(snapshot);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error || 'Unable to load settings snapshot.'),
    }, { status: 500 });
  }
}
