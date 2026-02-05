'use client';

import * as React from 'react';
import { AppLayout, type AppLayoutProps } from './AppLayout';
import { AppTabGroup } from './AppTabGroup';
import { AppTab } from './AppTab';
import { AppContent } from './AppContent';

export interface AppSpaceProps extends AppLayoutProps {}

function AppSpaceRoot({ children, className }: AppSpaceProps) {
  return <AppLayout className={className}>{children}</AppLayout>;
}

export const AppSpace = Object.assign(AppSpaceRoot, {
  Tabs: AppTabGroup,
  Tab: AppTab,
  Content: AppContent,
});
