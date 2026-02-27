'use client';

import { MiniMap } from 'reactflow';
import type { PanelPosition } from 'reactflow';

export interface FlowMiniMapProps {
  position?: PanelPosition;
  nodeColor?: string;
  nodeStrokeColor?: string;
  maskColor?: string;
  className?: string;
}

/** Workspace-style wrapper around React Flow MiniMap. */
export function FlowMiniMap({
  position = 'bottom-right',
  nodeColor,
  nodeStrokeColor,
  maskColor,
  className,
}: FlowMiniMapProps) {
  return (
    <MiniMap
      position={position}
      nodeColor={nodeColor}
      nodeStrokeColor={nodeStrokeColor}
      maskColor={maskColor}
      className={className}
    />
  );
}
