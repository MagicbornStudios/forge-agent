'use client';

import { Panel } from 'reactflow';
import type { PanelPosition } from 'reactflow';

export interface FlowPanelProps {
  position: PanelPosition;
  children?: React.ReactNode;
  className?: string;
}

/** Workspace-style wrapper around React Flow Panel. Canvas-level overlay slot. */
export function FlowPanel({ position, children, className }: FlowPanelProps) {
  return (
    <Panel position={position} className={className}>
      {children}
    </Panel>
  );
}
