import * as React from 'react';
import Link from 'next/link';
import { cn } from '@forge/ui/lib/utils';
import { Badge } from '@forge/ui/badge';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@forge/ui/card';
import { ComponentPreview } from '@/components/docs';

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'note' | 'warning' | 'danger';
  title?: string;
}

export function Callout({
  variant = 'info',
  title,
  className,
  children,
  ...props
}: CalloutProps) {
  const tones: Record<NonNullable<CalloutProps['variant']>, string> = {
    info: 'border-primary/40 bg-primary/5 text-foreground',
    note: 'border-border bg-muted/40 text-foreground',
    warning: 'border-amber-500/50 bg-amber-500/10 text-foreground',
    danger: 'border-destructive/60 bg-destructive/10 text-foreground',
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 text-sm space-y-2',
        tones[variant],
        className
      )}
      {...props}
    >
      {title && <div className="text-xs font-semibold uppercase tracking-wide">{title}</div>}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  number: number;
  title?: string;
}

export function Step({ number, title, className, children, ...props }: StepProps) {
  return (
    <Card className={cn('border-border/60 bg-muted/20 shadow-none', className)} {...props}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Badge variant="outline">Step {number}</Badge>
          {title && <span>{title}</span>}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm space-y-2">{children}</CardContent>
    </Card>
  );
}

export function createMdxComponents(validSlugs: Set<string>) {
  const slugAliases = new Map<string, string>();
  for (const slug of validSlugs) {
    slugAliases.set(slug, slug);
    const base = slug.split('/').pop();
    if (base && !slugAliases.has(base)) {
      slugAliases.set(base, slug);
    }
  }

  const resolveSlug = (input: string) => slugAliases.get(input);

  const DocLink = ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!href) {
      return <a {...props}>{children}</a>;
    }
    if (href.startsWith('http')) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    }

    const mdxMatch = href.match(/^(?:\.\/)?([a-z0-9-/]+)\.(md|mdx)$/i);
    const slug = mdxMatch?.[1];
    const resolved = slug ? resolveSlug(slug) : null;

    if (resolved) {
      const docHref = resolved === '00-docs-index' ? '/docs' : `/docs/${resolved}`;
      return (
        <Link href={docHref} className="text-primary hover:underline">
          {children}
        </Link>
      );
    }

    return <a href={href} {...props}>{children}</a>;
  };

  return {
    a: DocLink,
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="rounded-lg border border-border bg-muted/50 p-4 overflow-x-auto">
        {children}
      </pre>
    ),
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      const isBlock = className != null;
      if (isBlock) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm" {...props}>
          {children}
        </code>
      );
    },
    Callout,
    Step,
    ComponentPreview,
    Badge,
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
  } as const;
}
