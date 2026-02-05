import Link from 'next/link';

export interface DocEntry {
  slug: string;
  label: string;
}

function docHref(slug: string): string {
  if (slug === 'index') return '/docs';
  return `/docs/${slug}`;
}

export interface DocNavSidebarProps {
  entries: DocEntry[];
  title?: string;
}

export function DocNavSidebar({
  entries,
  title = 'Documentation',
}: DocNavSidebarProps) {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-muted/30 p-4">
      <nav className="flex flex-col gap-1">
        <Link
          href="/docs"
          className="mb-2 font-semibold text-foreground hover:underline"
        >
          {title}
        </Link>
        {entries.map(({ slug, label }) => (
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
  );
}
