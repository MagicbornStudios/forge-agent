import { createSwaggerSpec } from 'next-swagger-doc';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const spec = createSwaggerSpec({
  apiFolder: 'app/api',
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Studio API',
      version: '1.0',
    },
  },
});

const json = spec != null ? JSON.stringify(spec, null, 2) : '{}';
writeFileSync(path.join(root, 'openapi.json'), json, 'utf8');
console.log('Wrote openapi.json');
