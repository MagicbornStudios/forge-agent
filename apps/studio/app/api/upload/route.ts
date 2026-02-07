import { NextResponse } from 'next/server';
import { route, type Router } from '@better-upload/server';
import { toRouteHandler } from '@better-upload/server/adapters/next';
import { aws } from '@better-upload/server/clients';

const bucketName = process.env.BETTER_UPLOAD_BUCKET ?? process.env.AWS_S3_BUCKET ?? '';

function createHandler() {
  const router: Router = {
    client: aws(),
    bucketName,
    routes: {
      media: route({
        fileTypes: ['image/*'],
        multipleFiles: false,
        maxFileSize: 1024 * 1024 * 10, // 10MB
      }),
    },
  };
  return toRouteHandler(router);
}

async function wrappedPost(request: Request) {
  if (!bucketName) {
    return NextResponse.json(
      { error: 'Upload not configured. Set BETTER_UPLOAD_BUCKET and AWS credentials.' },
      { status: 503 },
    );
  }
  const handler = createHandler();
  return handler.POST(request);
}

export const POST = wrappedPost;
