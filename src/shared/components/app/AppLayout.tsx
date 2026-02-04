'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AppLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className={cn('flex flex-col h-screen min-h-0 bg-background', className)}>
      {children}
    </div>
  );
}
