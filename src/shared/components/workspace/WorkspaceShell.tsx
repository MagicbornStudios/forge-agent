'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { WorkspaceLayout } from './WorkspaceLayout';
import type { WorkspaceShellProps } from './types';

export function WorkspaceShell({
  workspaceId,
  title,
  subtitle,
  domain,
  theme,
  className,
  children,
}: WorkspaceShellProps) {
  return (
    <div
      className={cn('flex flex-col h-full min-h-0 overflow-hidden', className)}
      data-workspace-id={workspaceId}
      {...(domain ? { 'data-domain': domain } : {})}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </div>
  );
}
