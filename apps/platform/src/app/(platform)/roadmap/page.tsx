import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { resolveDocsAppUrl } from '@/lib/env';
import {
  ROADMAP_CATEGORIES,
  ROADMAP_ITEMS,
  ROADMAP_MVP_SUMMARY,
  type RoadmapItem,
  type RoadmapStatus,
} from '@/lib/roadmap-data';

function statusVariant(status: RoadmapStatus): 'default' | 'secondary' | 'outline' {
  if (status === 'active') return 'default';
  if (status === 'shipped') return 'outline';
  return 'secondary';
}

export default function RoadmapPage() {
  const docsHref = resolveDocsAppUrl();
  const byCategory = ROADMAP_CATEGORIES.map((category) => ({
    ...category,
    items: ROADMAP_ITEMS.filter((item) => item.status === category.key),
  }));

  return (
    <div className="space-y-10 py-4">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Product roadmap</h1>
        <p className="text-muted-foreground">
          Platform direction for docs, catalog, editor tooling, and creator commerce. See{' '}
          <a href={docsHref} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            documentation
          </a>{' '}
          for implementation details.
        </p>
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-left text-sm text-muted-foreground">
          <strong className="text-foreground">MVP:</strong> {ROADMAP_MVP_SUMMARY.firstRevenue}. Hero moments:{' '}
          {ROADMAP_MVP_SUMMARY.heroMoments[0]} and {ROADMAP_MVP_SUMMARY.heroMoments[1]}.
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-10">
        {byCategory.map((section) => (
          <section key={section.key} className="space-y-4">
            <h2 className="text-xl font-semibold">{section.label}</h2>
            {section.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items in this section yet.</p>
            ) : (
              <ul className="space-y-3">
                {section.items.map((item: RoadmapItem) => (
                  <li key={item.id}>
                    <Card className="border-border/70">
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <Badge variant={statusVariant(item.status)}>{item.statusLabel}</Badge>
                          {item.impact ? <Badge variant="outline">{item.impact}</Badge> : null}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription>{item.description}</CardDescription>
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
