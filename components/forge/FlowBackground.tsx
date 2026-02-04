'use client';

import { Background, BackgroundVariant } from 'reactflow';

export interface FlowBackgroundProps {
  variant?: 'lines' | 'dots' | 'cross';
  gap?: number | [number, number];
  size?: number;
  className?: string;
}

const variantMap = {
  lines: BackgroundVariant.Lines,
  dots: BackgroundVariant.Dots,
  cross: BackgroundVariant.Cross,
} as const;

/** Workspace-style wrapper around React Flow Background. */
export function FlowBackground({
  variant = 'dots',
  gap = 16,
  size = 0.5,
  className,
}: FlowBackgroundProps) {
  return (
    <Background
      variant={variantMap[variant]}
      gap={gap}
      size={size}
      className={className}
    />
  );
}
