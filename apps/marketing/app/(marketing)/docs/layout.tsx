import { DocNavSidebar } from '@/components/molecules/DocNavSidebar';
import { DOC_ENTRIES } from '@/content/docs/docs-config';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-background text-foreground">
      <DocNavSidebar entries={DOC_ENTRIES.map(({ slug, label }) => ({ slug, label }))} />
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
