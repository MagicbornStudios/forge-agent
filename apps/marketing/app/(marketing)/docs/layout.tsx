import Link from 'next/link';
import { DOC_ENTRIES } from '@/content/docs/docs-config';

function docHref(slug: string): string {
  if (slug === 'index') return '/docs';
  return `/docs/${slug}`;
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-background text-foreground">
      <aside className="w-56 shrink-0 border-r border-border bg-muted/30 p-4">
        <nav className="flex flex-col gap-1">
          <Link
            href="/docs"
            className="mb-2 font-semibold text-foreground hover:underline"
          >
            Documentation
          </Link>
          {DOC_ENTRIES.map(({ slug, label }) => (
            <Link
              key={slug}
              href={docHref(slug)}
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
