'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { WorkspaceTabGroup, type WorkspaceTabGroupProps } from '@forge/shared/components/workspace';

export interface AppTabGroupProps extends WorkspaceTabGroupProps {
  className?: string;
}

export function AppTabGroup({ className, ...props }: AppTabGroupProps) {
  return <WorkspaceTabGroup {...props} className={cn('shrink-0', className)} />;
}
