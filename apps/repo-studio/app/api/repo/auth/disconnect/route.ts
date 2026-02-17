import { NextResponse } from 'next/server';
import { clearRepoAuthStatus } from '@/lib/repo-auth-memory';

export async function POST() {
  const payload = clearRepoAuthStatus();
  return NextResponse.json(payload, { status: 200 });
}
