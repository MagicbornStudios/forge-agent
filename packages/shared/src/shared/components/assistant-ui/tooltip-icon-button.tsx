"use client";

import { ComponentPropsWithRef, forwardRef } from "react";
import { Slottable } from "@radix-ui/react-slot";

import { Button } from "@forge/ui/button";
import { cn } from "@forge/shared/lib/utils";

export type TooltipIconButtonProps = ComponentPropsWithRef<typeof Button> & {
  tooltip: string;
  side?: "top" | "bottom" | "left" | "right";
};

export const TooltipIconButton = forwardRef<
  HTMLButtonElement,
  TooltipIconButtonProps
>(({ children, tooltip, side, className, ...rest }, ref) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      title={tooltip}
      {...rest}
      className={cn("aui-button-icon size-[var(--control-height-sm)] p-0", className)}
      ref={ref}
    >
      <Slottable>{children}</Slottable>
      <span className="aui-sr-only sr-only">{tooltip}</span>
    </Button>
  );
});

TooltipIconButton.displayName = "TooltipIconButton";
