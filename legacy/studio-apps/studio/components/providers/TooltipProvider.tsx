"use client"

import * as React from "react"
import { TooltipProvider as RadixTooltipProvider } from "@forge/ui/tooltip"

export interface TooltipProviderProps {
  children?: React.ReactNode
  delayDuration?: number
  skipDelayDuration?: number
}

export function TooltipProvider({
  children,
  delayDuration = 350,
  skipDelayDuration = 150,
}: TooltipProviderProps) {
  return (
    <RadixTooltipProvider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      {children}
    </RadixTooltipProvider>
  )
}
