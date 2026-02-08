import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ROADMAP_ITEMS,
  ROADMAP_CATEGORIES,
  ROADMAP_MVP_SUMMARY,
  type RoadmapItem,
  type RoadmapStatus,
} from '@/lib/roadmap-data';

export const metadata: Metadata = {
  title: 'Roadmap – Forge',
  description:
    'Product roadmap: active editors (Dialogue, Character, Video, Strategy), platform initiatives (MCP Apps, Yarn Spinner), and shipped features.',
};

function statusVariant(status: RoadmapStatus): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'planned':
      return 'secondary';
    case 'shipped':
      return 'outline';
    default:
      return 'secondary';
  }
}

export default function RoadmapPage() {
  const byCategory = ROADMAP_CATEGORIES.map((cat) => ({
    ...cat,
    items: ROADMAP_ITEMS.filter((i) => i.status === cat.key),
  }));

  return (
    <div className="container px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Product roadmap</h1>
        <p className="text-muted-foreground">
          What we&apos;re building: editors, platform initiatives, and
          integrations. See{' '}
          <Link href="/docs" className="text-primary underline-offset-4 hover:underline">
            documentation
          </Link>{' '}
          for architecture and STATUS.
        </p>
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-left text-sm text-muted-foreground">
          <strong className="text-foreground">MVP:</strong> First revenue is{' '}
          <strong className="text-foreground">{ROADMAP_MVP_SUMMARY.firstRevenue}</strong>. Two paths:{' '}
          {ROADMAP_MVP_SUMMARY.heroMoments[0]}, or {ROADMAP_MVP_SUMMARY.heroMoments[1]}.{' '}
          {ROADMAP_MVP_SUMMARY.positioning}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-4xl space-y-12">
        {byCategory.map((section) => (
          <section key={section.key}>
            <h2 className="mb-6 text-xl font-semibold">{section.label}</h2>
            {section.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing in this category yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {section.items.map((item: RoadmapItem) => (
                  <li key={item.id}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <Badge variant={statusVariant(item.status)}>
                            {item.statusLabel}
                          </Badge>
                          {item.impact && (
                            <Badge variant="outline">{item.impact}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm">
                          {item.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
