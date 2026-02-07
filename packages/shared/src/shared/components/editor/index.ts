// ---------------------------------------------------------------------------
// Editor Platform - Forge Agent's Unreal-Engine-inspired editor kit
// ---------------------------------------------------------------------------
// These components provide a complete declarative UI system for building
// AI-first editor modes with resizable, dockable, lockable panels.
//
// Architecture
// EditorShell          <- root container (data-mode-id, data-domain, data-theme)
//   ModeHeader         <- title bar  (.Left, .Center, .Right)
//   ModeToolbar        <- toolbar    (.Left, .Center, .Right, .Menubar, .Button ...)
//   ModeReviewBar      <- AI change review (revert / accept)
//   DockLayout         <- resizable panel layout (left, main, right, bottom)
//     DockPanel        <- single panel (title, tabs, lock, scroll)
//       PanelTabs      <- tab bar within a panel
//     ViewportMeta     <- editor viewport metadata wrapper
//   ModeStatusBar      <- bottom status bar
//   ModeOverlaySurface <- modal overlay surface
// ---------------------------------------------------------------------------

// Layout primitives
export { DockLayout } from './DockLayout';
export type { DockLayoutProps, DockLayoutViewport } from './DockLayout';

export { DockPanel } from './DockPanel';
export type { DockPanelProps } from './DockPanel';

export { PanelTabs } from './PanelTabs';
export type { PanelTabDef, PanelTabsProps } from './PanelTabs';

export { ViewportMeta } from './ViewportMeta';
export type { ViewportMetaProps } from './ViewportMeta';

export { DockSidebar } from './DockSidebar';
export type { DockSidebarProps } from './DockSidebar';

export { EditorButton } from './EditorButton';
export type { EditorButtonProps } from './EditorButton';

export { EditorTooltip } from './EditorTooltip';
export type { EditorTooltipProps } from './EditorTooltip';

// Shell + Mode components
export { EditorShell } from './EditorShell';
export type { EditorShellProps } from './EditorShell';

export { ModeHeader } from './ModeHeader';
export type { ModeHeaderProps } from './ModeHeader';

export { ModeToolbar } from './ModeToolbar';
export type { ModeToolbarProps } from './ModeToolbar';

export { ModeStatusBar } from './ModeStatusBar';
export type { ModeStatusBarProps } from './ModeStatusBar';

export { ModeReviewBar } from './ModeReviewBar';
export type { ModeReviewBarProps } from './ModeReviewBar';

export { ModeOverlaySurface } from './ModeOverlaySurface';
export type { ModeOverlaySurfaceProps } from './ModeOverlaySurface';

// Panel utilities
export { PanelSettings } from './PanelSettings';
export type { PanelSettingsProps, PanelSettingDef } from './PanelSettings';

export { usePanelLock } from './usePanelLock';
export type { PanelLockState } from './usePanelLock';
