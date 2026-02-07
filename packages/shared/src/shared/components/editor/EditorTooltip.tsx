'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@forge/ui/tooltip';

export interface EditorTooltipProps {
  tooltip?: React.ReactNode;
  tooltipDisabled?: boolean;
  tooltipSide?: React.ComponentPropsWithoutRef<typeof TooltipContent>['side'];
  tooltipAlign?: React.ComponentPropsWithoutRef<typeof TooltipContent>['align'];
  tooltipClassName?: string;
  children: React.ReactElement;
}

/**
 * EditorTooltip — tooltip wrapper for editor UI.
 */
export function EditorTooltip({
  tooltip,
  tooltipDisabled,
  tooltipSide = 'top',
  tooltipAlign = 'center',
  tooltipClassName,
  children,
}: EditorTooltipProps) {
  const disabled = tooltipDisabled ?? false;
  if (!tooltip || disabled) {
    return children;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={tooltipSide} align={tooltipAlign} className={tooltipClassName}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
