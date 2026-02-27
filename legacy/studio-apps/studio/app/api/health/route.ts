/**
 * Health check for load balancers or scripts. Returns 200 when the app is up.
 * Optional: add DB or critical dependency checks later for readiness.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
