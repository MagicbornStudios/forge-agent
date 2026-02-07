import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CHANGELOG_ENTRIES } from '@/lib/changelog-data';

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ChangelogPage() {
  return (
    <div className="container px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
        <p className="text-muted-foreground">
          Version history and release highlights. See{' '}
          <Link href="/docs" className="text-primary underline-offset-4 hover:underline">
            documentation
          </Link>{' '}
          for architecture and STATUS.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-8">
        {CHANGELOG_ENTRIES.map((entry, i) => (
          <Card key={entry.date + (entry.version ?? '')}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <CardTitle className="text-lg">
                  {entry.version ? `v${entry.version}` : formatDate(entry.date)}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {entry.version ? formatDate(entry.date) : null}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {entry.highlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
