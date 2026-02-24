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
  /** Raw children (legacy) or slot components (EditorShell.Header, .Toolbar, .Layout, .StatusBar, .Overlay, .Settings). When slots are used, only slot content is rendered in fixed order. */
  children?: React.ReactNode;
}

const SLOT_NAMES = ['Header', 'Toolbar', 'Layout', 'StatusBar', 'Overlay', 'Settings'] as const;
type EditorShellSlotId = (typeof SLOT_NAMES)[number];

function EditorShellHeader({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
EditorShellHeader.displayName = 'EditorShell.Header';

function EditorShellToolbar({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
EditorShellToolbar.displayName = 'EditorShell.Toolbar';

function EditorShellLayout({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
EditorShellLayout.displayName = 'EditorShell.Layout';

function EditorShellStatusBar({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
EditorShellStatusBar.displayName = 'EditorShell.StatusBar';

function EditorShellOverlay({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
EditorShellOverlay.displayName = 'EditorShell.Overlay';

function EditorShellSettings({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
EditorShellSettings.displayName = 'EditorShell.Settings';

const SHELL_SLOT_COMPONENTS: Record<EditorShellSlotId, React.ComponentType<{ children?: React.ReactNode }>> = {
  Header: EditorShellHeader,
  Toolbar: EditorShellToolbar,
  Layout: EditorShellLayout,
  StatusBar: EditorShellStatusBar,
  Overlay: EditorShellOverlay,
  Settings: EditorShellSettings,
};

function collectShellSlots(children: React.ReactNode): Partial<Record<EditorShellSlotId, React.ReactNode>> {
  const collected: Partial<Record<EditorShellSlotId, React.ReactNode>> = {};
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as React.ComponentType<{ children?: React.ReactNode }>;
    for (const slotId of SLOT_NAMES) {
      if (type === SHELL_SLOT_COMPONENTS[slotId]) {
        collected[slotId] = (child as React.ReactElement<{ children?: React.ReactNode }>).props.children;
        break;
      }
    }
  });
  return collected;
}

function hasAnyShellSlot(children: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as React.ComponentType<{ children?: React.ReactNode }>;
    for (const slotId of SLOT_NAMES) {
      if (type === SHELL_SLOT_COMPONENTS[slotId]) {
        found = true;
        return;
      }
    }
  });
  return found;
}

/**
 * EditorShell - the outermost container for an editor.
 *
 * Replaces `WorkspaceShell`. Every editor (Dialogue, Character, Video, etc.)
 * wraps its content in an `EditorShell` which:
 *
 * 1. Sets `data-editor-id`, `data-domain`, `data-theme`, and `data-density` attributes
 * 2. Provides the flex-column layout skeleton
 * 3. Applies domain-specific theming via CSS custom properties
 *
 * When using slot components (EditorShell.Header, .Toolbar, .Layout, .StatusBar, .Overlay, .Settings),
 * content is rendered in fixed order. Toolbar and Settings share one row (toolbar left, settings right).
 * When not using slots, children are rendered as-is (legacy).
 *
 * @example
 * ```tsx
 * <EditorShell editorId="dialogue" title="Dialogue" domain="dialogue">
 *   <EditorShell.Toolbar>...</EditorShell.Toolbar>
 *   <EditorShell.Layout><WorkspaceLayout>...</WorkspaceLayout></EditorShell.Layout>
 *   <EditorShell.StatusBar>Ready</EditorShell.StatusBar>
 * </EditorShell>
 * ```
 */
function EditorShellRoot({
  editorId,
  title,
  subtitle,
  domain,
  theme,
  density,
  className,
  children,
}: EditorShellProps) {
  const useSlots = React.useMemo(() => hasAnyShellSlot(children), [children]);
  const slots = React.useMemo(() => (useSlots ? collectShellSlots(children) : {}), [useSlots, children]);

  const root = (
    <div
      className={cn('flex flex-col h-full min-h-0 overflow-hidden', className)}
      {...(editorId ? { 'data-editor-id': editorId } : {})}
      {...(domain ? { 'data-domain': domain } : {})}
      {...(theme ? { 'data-theme': theme } : {})}
      {...(density ? { 'data-density': density } : {})}
      aria-label={subtitle ? `${title} - ${subtitle}` : title}
    >
      {useSlots ? (
        <>
          {slots.Header != null ? <>{slots.Header}</> : null}
          {(slots.Toolbar != null || slots.Settings != null) ? (
            <div className="flex items-center min-h-0 shrink-0">
              <div className="flex-1 min-w-0">{slots.Toolbar}</div>
              {slots.Settings != null ? <div className="shrink-0">{slots.Settings}</div> : null}
            </div>
          ) : null}
          {slots.Layout != null ? (
            <div className="flex-1 min-h-0 min-w-0 overflow-hidden">{slots.Layout}</div>
          ) : null}
          {slots.StatusBar != null ? <>{slots.StatusBar}</> : null}
          {slots.Overlay != null ? <>{slots.Overlay}</> : null}
        </>
      ) : (
        children
      )}
    </div>
  );
  return root;
}

export const EditorShell = Object.assign(EditorShellRoot, {
  Header: EditorShellHeader,
  Toolbar: EditorShellToolbar,
  Layout: EditorShellLayout,
  StatusBar: EditorShellStatusBar,
  Overlay: EditorShellOverlay,
  Settings: EditorShellSettings,
});
