'use client';

import * as React from 'react';
import { cn } from '@forge/ui/lib/utils';

export interface QuickNavItem {
  label: string;
  href: string;
}

export interface QuickNavProps extends React.HTMLAttributes<HTMLElement> {
  items: QuickNavItem[];
}

/** Stripe-style horizontal jump links for in-page navigation. */
export function QuickNav({ items, className, ...props }: QuickNavProps) {
  return (
    <nav
      className={cn('flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground', className)}
      {...props}
    >
      {items.map((item, i) => (
        <span key={item.href}>
          {i > 0 && <span className="mx-1 select-none">|</span>}
          <a
            href={item.href}
            className="hover:text-foreground hover:underline transition-colors"
          >
            {item.label}
          </a>
        </span>
      ))}
    </nav>
  );
}
