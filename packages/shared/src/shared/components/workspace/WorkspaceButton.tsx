'use client';

import * as React from 'react';
import { Button, type ButtonProps } from '@forge/ui/button';

export interface WorkspaceButtonProps extends ButtonProps {
  /** Native title tooltip only (no Radix). */
  tooltip?: string;
  tooltipDisabled?: boolean;
}

/**
 * WorkspaceButton — button for editor UI with optional native title tooltip.
 */
export const WorkspaceButton = React.forwardRef<HTMLButtonElement, WorkspaceButtonProps>(
  ({ tooltip, tooltipDisabled, disabled, ...props }, ref) => {
    const title = tooltip && !tooltipDisabled ? tooltip : undefined;
    const button = <Button ref={ref} disabled={disabled} title={title} {...props} />;
    if (disabled) {
      return (
        <span className="inline-flex cursor-not-allowed" aria-disabled="true">
          {button}
        </span>
      );
    }
    return button;
  }
);
WorkspaceButton.displayName = 'WorkspaceButton';
