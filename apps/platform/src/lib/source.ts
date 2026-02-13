// Resolve to generated .source (virtual fumadocs-mdx:collections/server)
import { docs } from '../../.source/server';
import { loader } from 'fumadocs-core/source';
import { createElement } from 'react';
import { icons } from 'lucide-react';

function toPascalCase(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
}

function resolveIcon(iconName?: string) {
  if (!iconName) return undefined;
  const candidate = toPascalCase(iconName);
  const Icon = icons[candidate as keyof typeof icons];
  if (!Icon) return undefined;
  return createElement(Icon, { className: 'size-3.5' });
}

export const source = loader({
  baseUrl: '/docs',
  icon: resolveIcon,
  source: docs.toFumadocsSource(),
});
