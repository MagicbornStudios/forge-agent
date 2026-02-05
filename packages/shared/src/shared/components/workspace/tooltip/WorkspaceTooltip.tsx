'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@forge/ui/tooltip';

export interface WorkspaceTooltipProps {
  tooltip?: React.ReactNode;
  tooltipDisabled?: boolean;
  tooltipSide?: React.ComponentPropsWithoutRef<typeof TooltipContent>['side'];
  tooltipAlign?: React.ComponentPropsWithoutRef<typeof TooltipContent>['align'];
  tooltipClassName?: string;
  children: React.ReactElement;
}

export function WorkspaceTooltip({
  tooltip,
  tooltipDisabled,
  tooltipSide = 'top',
  tooltipAlign = 'center',
  tooltipClassName,
  children,
}: WorkspaceTooltipProps) {
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
