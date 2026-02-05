import { createSwaggerSpec } from 'next-swagger-doc';

export function getApiDocs(): object {
  return createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Studio API',
        version: '1.0',
      },
    },
  });
}
