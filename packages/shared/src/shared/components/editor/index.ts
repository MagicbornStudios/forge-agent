// ---------------------------------------------------------------------------
// Editor Platform — DockLayout primitives
// ---------------------------------------------------------------------------
// These components form the resizable, dockable panel system inspired by
// Unreal Engine's editor layout. They replace the fixed CSS Grid layout
// (`WorkspaceLayoutGrid`) with user-resizable panels.
// ---------------------------------------------------------------------------

export { DockLayout } from './DockLayout';
export type { DockLayoutProps, DockLayoutViewport } from './DockLayout';

export { DockPanel } from './DockPanel';
export type { DockPanelProps } from './DockPanel';

export { PanelTabs } from './PanelTabs';
export type { PanelTabDef, PanelTabsProps } from './PanelTabs';

export { ViewportMeta } from './ViewportMeta';
export type { ViewportMetaProps } from './ViewportMeta';
