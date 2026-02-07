'use client';

import * as React from 'react';
import { cn } from '@forge/shared/lib/utils';

export interface EditorShellProps {
  /**
   * Unique editor identifier (e.g. 'dialogue', 'character', 'video').
   * Sets `data-editor-id` on the root element, used by the copilot
   * system, settings resolution, and theme context.
   */
  editorId?: string;
  /** Display title for the editor. */
  title: string;
  /** Optional subtitle (e.g. active document name). */
  subtitle?: string;
  /** Domain context for theming. Sets `data-domain` for CSS variable scoping. */
  domain?: string;
  /** Theme override. Sets `data-theme` for palette switching. */
  theme?: string;
  /** Density override. Sets `data-density` (compact/comfortable). */
  density?: 'compact' | 'comfortable' | string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * EditorShell - the outermost container for an editor.
 *
 * Replaces `WorkspaceShell`. Every editor (Dialogue, Character, Video, etc.)
 * wraps its content in an `EditorShell` which:
 *
 * 1. Sets `data-editor-id`, `data-mode-id` (legacy), `data-domain`, `data-theme`, and `data-density` attributes
 * 2. Provides the flex-column layout skeleton
 * 3. Applies domain-specific theming via CSS custom properties
 *
 * ## Naming
 * | Old | New |
 * |---|---|
 * | `WorkspaceShell` | `EditorShell` |
 * | `workspaceId` | `editorId` |
 *
 * @example
 * ```tsx
 * <EditorShell editorId="dialogue" title="Dialogue" domain="dialogue" theme="dark-fantasy">
 *   <EditorHeader>...</EditorHeader>
 *   <EditorToolbar>...</EditorToolbar>
 *   <DockLayout ... />
 *   <EditorStatusBar>Ready</EditorStatusBar>
 * </EditorShell>
 * ```
 */
export function EditorShell({
  editorId,
  title,
  subtitle,
  domain,
  theme,
  density,
  className,
  children,
}: EditorShellProps) {
  return (
    <div
      className={cn('flex flex-col h-full min-h-0 overflow-hidden', className)}
      {...(editorId ? { 'data-editor-id': editorId } : {})}
      {...(domain ? { 'data-domain': domain } : {})}
      {...(theme ? { 'data-theme': theme } : {})}
      {...(density ? { 'data-density': density } : {})}
      aria-label={subtitle ? `${title} - ${subtitle}` : title}
    >
      {children}
    </div>
  );
}
