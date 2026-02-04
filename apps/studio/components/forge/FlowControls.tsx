'use client';

import { Controls } from 'reactflow';
import type { PanelPosition } from 'reactflow';

export interface FlowControlsProps {
  showZoom?: boolean;
  showFitView?: boolean;
  showInteractive?: boolean;
  position?: PanelPosition;
  className?: string;
}

/** Workspace-style wrapper around React Flow Controls. */
export function FlowControls({
  showZoom = true,
  showFitView = true,
  showInteractive = true,
  position = 'bottom-left',
  className,
}: FlowControlsProps) {
  return (
    <Controls
      showZoom={showZoom}
      showFitView={showFitView}
      showInteractive={showInteractive}
      position={position}
      className={className}
    />
  );
}
