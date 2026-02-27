'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(
  () => import('swagger-ui-react').then((mod) => mod.default),
  { ssr: false }
);

export default function ApiDocPage() {
  return (
    <div className="min-h-screen bg-background">
      <SwaggerUI url="/api/docs" />
    </div>
  );
}
