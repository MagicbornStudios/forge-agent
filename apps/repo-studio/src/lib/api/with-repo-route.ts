import { NextResponse } from 'next/server';

/**
 * Wraps an API route handler to catch errors and return consistent JSON.
 * Use for repo API routes that should always respond with { ok, message?, ... }.
 */
export function withRepoRoute(
  handler: (request: Request) => Promise<Record<string, unknown>>,
  options?: { errorStatus?: number },
) {
  const errorStatus = options?.errorStatus ?? 500;

  return async (request: Request): Promise<NextResponse> => {
    try {
      const body = await handler(request);
      return NextResponse.json(body);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? 'Unknown error');
      return NextResponse.json(
        { ok: false, message },
        { status: errorStatus },
      );
    }
  };
}
