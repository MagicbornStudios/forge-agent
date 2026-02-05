import Link from 'next/link';
import { DOC_ENTRIES } from './docs-config';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
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
              href={slug === '00-index' ? '/docs' : `/docs/${slug}`}
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
