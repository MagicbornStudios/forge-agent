'use client';

import React from 'react';
import { registerDefaultEditors } from '@/lib/editor-registry/editor-bootstrap';
import { Studio } from '@/components/Studio';

registerDefaultEditors();

/** CopilotKit removed; Assistant UI is the primary chat surface. */
export function AppShell() {
  return <Studio />;
}
