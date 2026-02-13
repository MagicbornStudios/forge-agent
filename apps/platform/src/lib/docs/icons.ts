import type { DocsAudience } from './audience';

const FALLBACK_ICONS: Record<string, string> = {
  index: 'BookOpenText',
  overview: 'BookOpenText',
  'platform-overview': 'Building2',
  'why-forge': 'Lightbulb',
  'platform-features': 'Sparkles',
  'getting-started': 'Rocket',
  'use-cases': 'Briefcase',
  'workflow-examples': 'Workflow',
  comparison: 'Scale',
  pricing: 'BadgeDollarSign',
  'developer-program': 'Users',
  'ai-workflows': 'Bot',
  components: 'Component',
  'developer-guide': 'Code2',
  tutorials: 'GraduationCap',
  guides: 'Compass',
  reference: 'FileCode2',
  'ai-system': 'Brain',
  'api-reference': 'Braces',
  ai: 'Bot',
  'yarn-spinner': 'Network',
};

const AUDIENCE_DEFAULTS: Record<DocsAudience, string> = {
  platform: 'FileText',
  developer: 'FileCode2',
};

export function getFallbackIconNameForSlug(rootSlug: string, audience: DocsAudience): string {
  return FALLBACK_ICONS[rootSlug] ?? AUDIENCE_DEFAULTS[audience];
}