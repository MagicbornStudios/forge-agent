// Resolve to generated .source (virtual fumadocs-mdx:collections/server not resolved by webpack at build)
import { docs } from '../.source/server';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
