'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';
import { EditorTabGroup, type EditorTabGroupProps } from '@forge/shared';

export interface AppTabGroupProps extends EditorTabGroupProps {
  className?: string;
}

export function AppTabGroup({ className, ...props }: AppTabGroupProps) {
  return <EditorTabGroup {...props} className={cn('shrink-0', className)} />;
}
