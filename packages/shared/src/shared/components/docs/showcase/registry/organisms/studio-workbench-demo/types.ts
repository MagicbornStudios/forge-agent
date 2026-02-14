'use client';

import * as React from 'react';

export type DemoEditorId = 'dialogue' | 'character';

export interface DemoEditorDefinition {
  id: DemoEditorId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

