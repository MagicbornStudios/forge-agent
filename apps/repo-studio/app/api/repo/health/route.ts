import { NextResponse } from 'next/server';

/**
 * Readiness/health endpoint for companion detection.
 * Returns 200 when the Repo Studio app is up. No auth required.
 * Used by Studio (and other studios) to detect if Repo Studio is available as an optional runtime.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      app: 'repo-studio',
    },
    { status: 200 },
  );
}
