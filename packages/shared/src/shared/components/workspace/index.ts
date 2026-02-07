export { WorkspaceShell } from './WorkspaceShell';
export { WorkspaceLayout } from './WorkspaceLayout';
export { WorkspaceLayoutGrid } from './layout/WorkspaceLayoutGrid';
export { WorkspaceHeader } from './header/WorkspaceHeader';
export { WorkspaceToolbar } from './toolbar/WorkspaceToolbar';
export { WorkspaceButton } from './controls/WorkspaceButton';
export { WorkspaceTabGroup } from './tabs/WorkspaceTabGroup';
export type { WorkspaceTabGroupProps } from './tabs/WorkspaceTabGroup';
export { WorkspaceTab } from './tabs/WorkspaceTab';
export type { WorkspaceTabProps } from './tabs/WorkspaceTab';
export { WorkspaceTooltip } from './tooltip/WorkspaceTooltip';
export {
  WorkspaceLeftPanel,
  WorkspaceEditor,
  WorkspaceInspector,
  WorkspaceBottomPanel,
  WorkspaceSidebar,
  WorkspaceMain,
  // shadcn sidebar primitives (re-exported via WorkspaceSidebar)
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from './panels';
export type { WorkspaceSidebarProps } from './panels';
export { WorkspaceStatusBar } from './status/WorkspaceStatusBar';
export { WorkspaceReviewBar } from './review/WorkspaceReviewBar';
export type { WorkspaceReviewBarProps } from './review/WorkspaceReviewBar';
export { WorkspaceOverlaySurface } from './overlays/WorkspaceOverlaySurface';
export { WorkspaceModalsHost } from './modals/WorkspaceModalsHost';
export type {
  WorkspaceShellProps,
  WorkspaceId,
  WorkspaceSlotKey,
  WorkspaceEntitlements,
  WorkspaceFlags,
} from './types';

// ---------------------------------------------------------------------------
// Deprecated editor exports (migration convenience)
// Prefer importing from `@forge/shared/components/editor`.
// ---------------------------------------------------------------------------
/** @deprecated Use EditorShell from @forge/shared/components/editor. */
export { EditorShell } from '../editor';
/** @deprecated Use ModeHeader from @forge/shared/components/editor. */
export { ModeHeader } from '../editor';
/** @deprecated Use ModeToolbar from @forge/shared/components/editor. */
export { ModeToolbar } from '../editor';
/** @deprecated Use ModeStatusBar from @forge/shared/components/editor. */
export { ModeStatusBar } from '../editor';
/** @deprecated Use ModeReviewBar from @forge/shared/components/editor. */
export { ModeReviewBar } from '../editor';
/** @deprecated Use ModeOverlaySurface from @forge/shared/components/editor. */
export { ModeOverlaySurface } from '../editor';
/** @deprecated Use DockLayout from @forge/shared/components/editor. */
export { DockLayout } from '../editor';
/** @deprecated Use DockPanel from @forge/shared/components/editor. */
export { DockPanel } from '../editor';
/** @deprecated Use PanelTabs from @forge/shared/components/editor. */
export { PanelTabs } from '../editor';
/** @deprecated Use ViewportMeta from @forge/shared/components/editor. */
export { ViewportMeta } from '../editor';
/** @deprecated Use DockSidebar from @forge/shared/components/editor. */
export { DockSidebar } from '../editor';
/** @deprecated Use EditorButton from @forge/shared/components/editor. */
export { EditorButton } from '../editor';
/** @deprecated Use EditorTooltip from @forge/shared/components/editor. */
export { EditorTooltip } from '../editor';
/** @deprecated Use PanelSettings from @forge/shared/components/editor. */
export { PanelSettings } from '../editor';
/** @deprecated Use usePanelLock from @forge/shared/components/editor. */
export { usePanelLock } from '../editor';
