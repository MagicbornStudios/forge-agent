import { NextResponse, type NextRequest } from 'next/server';
import { getAllowedCorsOrigins, getAllowedOrigin, setCorsHeaders } from './lib/server/cors';

const allowedOrigins = getAllowedCorsOrigins();

export function middleware(request: NextRequest) {
  const origin = getAllowedOrigin(request.headers.get('Origin'), allowedOrigins);

  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    if (origin) {
      setCorsHeaders(response.headers, origin, request.headers);
    }
    return response;
  }

  const response = NextResponse.next();
  if (origin) {
    setCorsHeaders(response.headers, origin, request.headers);
  }
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
