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
