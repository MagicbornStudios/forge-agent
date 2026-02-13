'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@forge/ui/button';
import { cn } from '@forge/ui/lib/utils';

export interface ShowcaseLinkProps {
  /** Path to catalog section, e.g. components/showcase/atoms#button */
  href: string;
  /** Button label, e.g. "View in Catalog" or "View Button in Catalog" */
  label: string;
  /** Optional 1-2 lines of context before the button */
  children?: React.ReactNode;
  className?: string;
}

/** Links from Design docs to Catalog; renders context + styled button. */
export function ShowcaseLink({ href, label, children, className }: ShowcaseLinkProps) {
  const [path, hash] = href.split('#');
  const cleanPath = path.replace(/\.mdx?$/i, '').trim();
  const docHref = cleanPath.startsWith('/') ? href : `/docs/${cleanPath}${hash ? `#${hash}` : ''}`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {children && <span className="text-sm text-muted-foreground">{children}</span>}
      <Button variant="outline" size="sm" asChild>
        <Link href={docHref}>{label}</Link>
      </Button>
    </div>
  );
}
