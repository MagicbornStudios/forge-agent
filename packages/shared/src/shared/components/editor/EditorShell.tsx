'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface EditorShellProps {
  /**
   * Unique mode identifier (e.g. 'forge', 'character', 'video').
   * Sets `data-mode-id` on the root element, used by the copilot
   * system, settings resolution, and theme context.
   */
  modeId: string;
  /** Display title for the mode. */
  title: string;
  /** Optional subtitle (e.g. active document name). */
  subtitle?: string;
  /** Domain context for theming. Sets `data-domain` for CSS variable scoping. */
  domain?: string;
  /** Theme override. Sets `data-theme` for palette switching. */
  theme?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * EditorShell — the outermost container for an editor mode.
 *
 * Replaces `WorkspaceShell`. Every mode (Forge, Character, Video, etc.)
 * wraps its content in an `EditorShell` which:
 *
 * 1. Sets `data-mode-id`, `data-domain`, and `data-theme` attributes
 * 2. Provides the flex-column layout skeleton
 * 3. Applies domain-specific theming via CSS custom properties
 *
 * ## Naming
 * | Old | New |
 * |---|---|
 * | `WorkspaceShell` | `EditorShell` |
 * | `workspaceId` | `modeId` |
 *
 * @example
 * ```tsx
 * <EditorShell modeId="forge" title="Forge" domain="forge" theme="dark-forge">
 *   <ModeHeader>...</ModeHeader>
 *   <ModeToolbar>...</ModeToolbar>
 *   <DockLayout ... />
 *   <ModeStatusBar>Ready</ModeStatusBar>
 * </EditorShell>
 * ```
 */
export function EditorShell({
  modeId,
  title,
  subtitle,
  domain,
  theme,
  className,
  children,
}: EditorShellProps) {
  return (
    <div
      className={cn('flex flex-col h-full min-h-0 overflow-hidden', className)}
      data-mode-id={modeId}
      {...(domain ? { 'data-domain': domain } : {})}
      {...(theme ? { 'data-theme': theme } : {})}
      aria-label={subtitle ? `${title} — ${subtitle}` : title}
    >
      {children}
    </div>
  );
}
