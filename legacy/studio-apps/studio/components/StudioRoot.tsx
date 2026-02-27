'use client';

import React from 'react';
import { registerDefaultWorkspaces } from '@/lib/workspace-registry/workspace-bootstrap';
import { Studio } from '@/components/Studio';

registerDefaultWorkspaces();

/** CopilotKit removed; Assistant UI is the primary chat surface. */
export function StudioRoot() {
  return <Studio />;
}
