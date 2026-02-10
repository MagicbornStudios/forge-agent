import { notFound } from 'next/navigation';
import { source } from '@/lib/source';
import { DocsShell } from '../DocsShell';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return source.generateParams();
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug: slugSegments } = await params;
  const slugs = slugSegments?.length ? slugSegments : [];
  const page = source.getPage(slugs) ?? (slugs.length === 0 ? source.getPage(['index']) : undefined);
  if (!page) notFound();

  const tree = source.getPageTree();
  const serializedTree = await source.serializePageTree(tree);

  const toc = (page.data as { toc?: { title: string; url: string; depth: number }[] }).toc ?? [];
  const body = (page.data as unknown as { body?: React.ReactNode }).body;

  return (
    <DocsShell serializedTree={serializedTree} toc={toc} baseUrl="/docs">
      <article className="doc-content text-[15px] leading-7 text-foreground/95 [&_h1]:mb-6 [&_h1]:mt-2 [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:border-b [&_h2]:border-border/70 [&_h2]:pb-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:my-4 [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_table]:my-6 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-border/80 [&_th]:border-b [&_th]:border-border [&_th]:bg-muted/40 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_td]:border-b [&_td]:border-border/60 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/60 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_hr]:my-8 [&_hr]:border-border/70">
        {body}
      </article>
    </DocsShell>
  );
}
