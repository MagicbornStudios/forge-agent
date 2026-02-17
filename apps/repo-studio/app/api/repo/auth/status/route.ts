import { NextResponse } from 'next/server';
import { getRepoAuthStatus } from '@/lib/repo-auth-memory';

export async function GET() {
  return NextResponse.json(getRepoAuthStatus(), { status: 200 });
}
