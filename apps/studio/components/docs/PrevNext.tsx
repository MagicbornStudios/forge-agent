'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@forge/ui/lib/utils';

export interface PrevNextLink {
  href: string;
  label: string;
}

export interface PrevNextProps {
  prev?: PrevNextLink;
  next?: PrevNextLink;
  className?: string;
}

export function PrevNext({ prev, next, className }: PrevNextProps) {
  if (!prev && !next) return null;
  return (
    <nav
      className={cn(
        'mt-12 flex flex-col gap-4 border-t border-border/60 pt-8 sm:flex-row sm:justify-between',
        className
      )}
      aria-label="Document navigation"
    >
      <div className="flex-1">
        {prev ? (
          <Link
            href={prev.href}
            className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4 shrink-0" />
            <span className="truncate">{prev.label}</span>
          </Link>
        ) : null}
      </div>
      <div className="flex flex-1 justify-end">
        {next ? (
          <Link
            href={next.href}
            className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex-row-reverse"
          >
            <span className="truncate">{next.label}</span>
            <ChevronRight className="size-4 shrink-0" />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
