'use client';

import * as React from 'react';
import { Button, type ButtonProps } from '@forge/ui/button';
import { EditorTooltip } from './EditorTooltip';

export interface EditorButtonProps extends ButtonProps {
  tooltip?: React.ReactNode;
  tooltipDisabled?: boolean;
  tooltipSide?: React.ComponentPropsWithoutRef<typeof EditorTooltip>['tooltipSide'];
  tooltipAlign?: React.ComponentPropsWithoutRef<typeof EditorTooltip>['tooltipAlign'];
  tooltipClassName?: string;
}

/**
 * EditorButton — tooltip-enabled button for editor UI.
 */
export const EditorButton = React.forwardRef<HTMLButtonElement, EditorButtonProps>(
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
      <EditorTooltip
        tooltip={tooltip}
        tooltipDisabled={tooltipDisabled}
        tooltipSide={tooltipSide}
        tooltipAlign={tooltipAlign}
        tooltipClassName={tooltipClassName}
      >
        {trigger}
      </EditorTooltip>
    );
  },
);
EditorButton.displayName = 'EditorButton';
