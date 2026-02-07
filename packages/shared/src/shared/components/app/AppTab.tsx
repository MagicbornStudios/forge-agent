'use client';

import * as React from 'react';
import { EditorTab, type EditorTabProps } from '@forge/shared';

export type AppTabProps = EditorTabProps;

export function AppTab(props: AppTabProps) {
  return <EditorTab {...props} />;
}
