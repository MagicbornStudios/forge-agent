import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHANGELOG_ENTRIES } from '@/lib/changelog-data';

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ChangelogPage() {
  return (
    <div className="space-y-10 py-4">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Changelog</h1>
        <p className="text-muted-foreground">
          Release history and highlights. See{' '}
          <Link href="/docs" className="text-primary hover:underline">
            docs
          </Link>{' '}
          for implementation notes.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {CHANGELOG_ENTRIES.map((entry) => (
          <Card key={`${entry.date}-${entry.version ?? 'date'}`} className="border-border/70">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <CardTitle className="text-lg">
                  {entry.version ? `v${entry.version}` : formatDate(entry.date)}
                </CardTitle>
                {entry.version ? (
                  <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {entry.highlights.map((highlight, index) => (
                  <li key={`${entry.date}-${index}`}>{highlight}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
