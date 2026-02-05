'use client';

import * as React from 'react';
import { Button, type ButtonProps } from '@forge/ui/button';
import { WorkspaceTooltip } from '../tooltip/WorkspaceTooltip';

export interface WorkspaceButtonProps extends ButtonProps {
  tooltip?: React.ReactNode;
  tooltipDisabled?: boolean;
  tooltipSide?: React.ComponentPropsWithoutRef<typeof WorkspaceTooltip>['tooltipSide'];
  tooltipAlign?: React.ComponentPropsWithoutRef<typeof WorkspaceTooltip>['tooltipAlign'];
  tooltipClassName?: string;
}

export const WorkspaceButton = React.forwardRef<HTMLButtonElement, WorkspaceButtonProps>(
  (
    {
      tooltip,
      tooltipDisabled,
      tooltipSide,
      tooltipAlign,
      tooltipClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    const button = <Button ref={ref} disabled={disabled} {...props} />;
    const shouldTooltip = tooltip && !tooltipDisabled;

    if (!shouldTooltip) {
      return button;
    }

    const trigger = disabled ? (
      <span className="inline-flex cursor-not-allowed" aria-disabled="true">
        {button}
      </span>
    ) : (
      button
    );

    return (
      <WorkspaceTooltip
        tooltip={tooltip}
        tooltipDisabled={tooltipDisabled}
        tooltipSide={tooltipSide}
        tooltipAlign={tooltipAlign}
        tooltipClassName={tooltipClassName}
      >
        {trigger}
      </WorkspaceTooltip>
    );
  },
);
WorkspaceButton.displayName = 'WorkspaceButton';
