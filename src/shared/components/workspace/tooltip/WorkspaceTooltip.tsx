'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface WorkspaceTooltipProps {
  tooltip?: React.ReactNode;
  tooltipDisabled?: boolean;
  /** @deprecated Typo alias for tooltipDisabled. */
  tootlipDisabled?: boolean;
  tooltipSide?: React.ComponentPropsWithoutRef<typeof TooltipContent>['side'];
  tooltipAlign?: React.ComponentPropsWithoutRef<typeof TooltipContent>['align'];
  tooltipClassName?: string;
  children: React.ReactElement;
}

export function WorkspaceTooltip({
  tooltip,
  tooltipDisabled,
  tootlipDisabled,
  tooltipSide = 'top',
  tooltipAlign = 'center',
  tooltipClassName,
  children,
}: WorkspaceTooltipProps) {
  const disabled = tooltipDisabled ?? tootlipDisabled ?? false;
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
