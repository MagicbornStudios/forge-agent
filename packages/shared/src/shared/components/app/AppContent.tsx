'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface AppContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function AppContent({ children, className }: AppContentProps) {
  return <div className={cn('flex-1 min-h-0 overflow-hidden', className)}>{children}</div>;
}
