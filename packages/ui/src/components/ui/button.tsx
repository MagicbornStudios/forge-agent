import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@forge/ui/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[var(--control-gap)] whitespace-nowrap rounded-[var(--radius-sm)] text-xs font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[var(--shadow-xs)] hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--shadow-xs)] hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-[var(--shadow-xs)] hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--shadow-xs)] hover:bg-secondary/80",
        // Icon-only (e.g. close): use variant ghost size icon; add border-none if needed to avoid full outline.
        ghost:
          "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[var(--control-height)] px-[var(--control-padding-x)]",
        sm: "h-[var(--control-height-sm)] px-[var(--control-padding-x)] text-[11px]",
        xs: "h-[var(--control-height-sm)] px-[var(--control-padding-x)] text-[11px]",
        lg: "h-[calc(var(--control-height)+0.25rem)] px-[calc(var(--control-padding-x)+0.25rem)] text-[12px]",
        icon: "h-[var(--control-height)] w-[var(--control-height)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const classNames = cn(buttonVariants({ variant, size, className }))
    if (asChild) {
      return (
        <Slot
          className={classNames}
          ref={ref as any}
          {...(props as React.ComponentProps<typeof Slot>)}
        />
      )
    }
    return (
      <button className={classNames} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
