'use client';

import * as React from 'react';
import { Button, type ButtonProps } from './button';

export interface TooltipButtonProps extends ButtonProps {
  /** Native title tooltip (avoids Radix ref-merge loop with React 19) */
  tooltip?: string;
}

/**
 * Button with native title tooltip. Use for simple string tooltips to avoid
 * Radix TooltipTrigger asChild infinite loops (React 19 + composeRefs).
 */
const TooltipButton = React.forwardRef<HTMLButtonElement, TooltipButtonProps>(
  ({ tooltip, ...props }, ref) => (
    <Button ref={ref} title={tooltip} {...props} />
  )
);
TooltipButton.displayName = 'TooltipButton';

export { TooltipButton };
