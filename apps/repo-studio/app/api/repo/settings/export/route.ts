import { NextResponse } from 'next/server';
import { exportRepoSettings } from '@/lib/settings/repository';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = String(url.searchParams.get('workspaceId') || 'planning');
  const loopId = String(url.searchParams.get('loopId') || 'default');

  try {
    const payload = await exportRepoSettings({ workspaceId, loopId });
    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: String(error?.message || error || 'Unable to export settings.'),
    }, { status: 500 });
  }
}
