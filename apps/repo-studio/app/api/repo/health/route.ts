import { NextResponse } from 'next/server';
import { companionCorsHeaders } from '@/lib/companion-auth';

/**
 * Readiness/health endpoint for companion detection.
 * Returns 200 when the Repo Studio app is up. No auth required.
 * Used by Studio (and other studios) to detect if Repo Studio is available as an optional runtime.
 */
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: companionCorsHeaders(request, 'GET, OPTIONS'),
  });
}

export async function GET(request: Request) {
  return NextResponse.json(
    {
      ok: true,
      app: 'repo-studio',
    },
    {
      status: 200,
      headers: companionCorsHeaders(request, 'GET, OPTIONS'),
    },
  );
}
