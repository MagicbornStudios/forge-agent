import { NextResponse } from 'next/server';
import { upsertRepoSettings } from '@/lib/settings/repository';

export async function POST(request: Request) {
  let body: {
    query?: string;
    source?: string;
    status?: string;
    tab?: string;
    sort?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const commandView = {
    query: String(body.query || ''),
    source: String(body.source || 'all'),
    status: String(body.status || 'all'),
    tab: String(body.tab || 'recommended'),
    sort: String(body.sort || 'id'),
  };
  const snapshot = await upsertRepoSettings({
    scope: 'local',
    scopeId: 'default',
    settings: {
      commands: {
        view: commandView,
      },
    },
  });
  const merged = (snapshot.merged as Record<string, any>) || {};
  const commands = merged.commands && typeof merged.commands === 'object' ? merged.commands : {};

  return NextResponse.json({
    ok: true,
    commandView: commands.view || commandView,
    message: 'Updated command view.',
  }, { status: 200 });
}
