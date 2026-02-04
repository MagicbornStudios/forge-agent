'use client';

import * as React from 'react';
import { WorkspaceTab, type WorkspaceTabProps } from '@/shared/components/workspace';

export type AppTabProps = WorkspaceTabProps;

export function AppTab(props: AppTabProps) {
  return <WorkspaceTab {...props} />;
}
