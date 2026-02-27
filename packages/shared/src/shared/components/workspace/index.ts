// ---------------------------------------------------------------------------
// Workspace Platform - Forge Agent's Unreal-Engine-inspired workspace kit
// ---------------------------------------------------------------------------
// These components provide a complete declarative UI system for building
// AI-first workspace surfaces with resizable, dockable, lockable panels.
//
// Architecture
// WorkspaceShell          <- root container (data-editor-id, data-domain, data-theme)
//   Slots: .Header | .Toolbar | .Layout | .StatusBar | .Overlay | .Settings (recommended); or raw children (legacy)
//   WorkspaceHeader       <- title bar  (.Left, .Center, .Right)
//   WorkspaceToolbar      <- toolbar    (.Left, .Center, .Right, .Menubar, .Button ...)
//   WorkspaceReviewBar    <- AI change review (revert / accept)
//   WorkspaceLayout   <- resizable panel layout; slots .Left | .Main | .Right | .Bottom
//     WorkspacePanel <- single panel (title, tabs, lock, scroll)
//       PanelTabs      <- tab bar within a panel
//     ViewportMeta     <- editor viewport metadata wrapper
//   WorkspaceStatusBar    <- bottom status bar
//   WorkspaceOverlaySurface <- modal overlay surface
// ---------------------------------------------------------------------------

// Layout primitives
export { WorkspaceLayout } from './WorkspaceLayout';
export type {
  WorkspaceLayoutProps,
  WorkspaceLayoutViewport,
  WorkspaceLayoutSlotConfig,
  WorkspaceLayoutRef,
  WorkspaceLayoutPanelProps,
  RailPanelDescriptor,
} from './WorkspaceLayout';

export { WorkspacePanel } from './WorkspacePanel';
export type { WorkspacePanelProps } from './WorkspacePanel';

export { PanelTabs, PanelTab } from './PanelTabs';
export type { PanelTabDef, PanelTabProps, PanelTabsProps } from './PanelTabs';

export { SettingsTabs } from './SettingsTabs';
export type { SettingsTabDef, SettingsTabsProps } from './SettingsTabs';

export { ViewportMeta } from './ViewportMeta';
export type { ViewportMetaProps } from './ViewportMeta';

export { DockSidebar, DockSidebar as WorkspaceDockSidebar } from './DockSidebar';
export type { DockSidebarProps, DockSidebarProps as WorkspaceDockSidebarProps } from './DockSidebar';

export { WorkspaceButton } from './WorkspaceButton';
export type { WorkspaceButtonProps } from './WorkspaceButton';

export { WorkspaceTooltip } from './WorkspaceTooltip';
export type { WorkspaceTooltipProps } from './WorkspaceTooltip';

// Shell + workspace components
export { WorkspaceShell } from './WorkspaceShell';
export type { WorkspaceShellProps } from './WorkspaceShell';

export { WorkspaceHeader } from './WorkspaceHeader';
export type { WorkspaceHeaderProps } from './WorkspaceHeader';

export { WorkspaceToolbar } from './WorkspaceToolbar';
export type { WorkspaceToolbarProps } from './WorkspaceToolbar';

export {
  WorkspaceFileMenu,
  WorkspaceFileMenuSwitchProject,
  WorkspaceFileMenuNew,
  WorkspaceFileMenuOpen,
  WorkspaceFileMenuSave,
  WorkspaceFileMenuSeparator,
} from './toolbar/WorkspaceFileMenu';
export type {
  WorkspaceFileMenuProps,
  WorkspaceFileMenuItem,
  WorkspaceFileMenuSwitchProjectOptions,
  WorkspaceFileMenuActionOptions,
} from './toolbar/WorkspaceFileMenu';
export { WorkspaceMenubar } from './toolbar/WorkspaceMenubar';
export type { WorkspaceMenubarProps, WorkspaceMenubarMenu, WorkspaceMenubarItem } from './toolbar/WorkspaceMenubar';
export { createWorkspaceMenubarMenus } from './toolbar/createWorkspaceMenubarMenus';
export type { CreateWorkspaceMenubarMenusOptions } from './toolbar/createWorkspaceMenubarMenus';
export { WorkspaceViewMenu } from './toolbar/WorkspaceViewMenu';
export type {
  WorkspaceViewMenuAppearanceOptions,
  WorkspaceViewMenuPanelToggleOptions,
} from './toolbar/WorkspaceViewMenu';
export { WorkspaceEditMenu } from './toolbar/WorkspaceEditMenu';
export type { WorkspaceEditMenuItemOptions } from './toolbar/WorkspaceEditMenu';
export { WorkspaceSettingsMenu } from './toolbar/WorkspaceSettingsMenu';
export type {
  WorkspaceSettingsMenuOpenSettingsOptions,
  WorkspaceSettingsMenuUserOptions,
} from './toolbar/WorkspaceSettingsMenu';
export { WorkspaceHelpMenu } from './toolbar/WorkspaceHelpMenu';
export type { WorkspaceHelpMenuItemOptions } from './toolbar/WorkspaceHelpMenu';
export { WorkspaceProjectSelect } from './toolbar/WorkspaceProjectSelect';
export type { WorkspaceProjectSelectProps, WorkspaceProjectOption } from './toolbar/WorkspaceProjectSelect';

export { WorkspaceInspector } from './WorkspaceInspector';
export type { WorkspaceInspectorProps } from './WorkspaceInspector';

export {
  WorkspaceSidebar,
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
} from './WorkspaceSidebar';
export type { WorkspaceSidebarProps } from './WorkspaceSidebar';

export { WorkspaceTab } from './WorkspaceTab';
export type { WorkspaceTabProps } from './WorkspaceTab';
export { WorkspaceTabGroup } from './WorkspaceTabGroup';
export type { WorkspaceTabGroupProps } from './WorkspaceTabGroup';

export { WorkspaceBottomPanel } from './WorkspaceBottomPanel';
export type { WorkspaceBottomPanelProps } from './WorkspaceBottomPanel';

export { WorkspaceViewport } from './WorkspaceViewport';
export type {
  ViewportPanelDescriptor,
  WorkspaceViewportProps,
  ViewportCloseStateInput,
  ViewportCloseStateResult,
} from './WorkspaceViewport';
export {
  resolveViewportOpenIds,
  resolveViewportActiveId,
  resolveViewportCloseState,
} from './WorkspaceViewport';

export { WorkspaceStatusBar } from './WorkspaceStatusBar';
export type { WorkspaceStatusBarProps } from './WorkspaceStatusBar';

export { WorkspaceReviewBar } from './WorkspaceReviewBar';
export type { WorkspaceReviewBarProps } from './WorkspaceReviewBar';

export { WorkspaceOverlaySurface } from './WorkspaceOverlaySurface';
export type { WorkspaceOverlaySurfaceProps } from './WorkspaceOverlaySurface';

export { WorkspaceSettingsTrigger } from './WorkspaceSettingsTrigger';
export type { WorkspaceSettingsTriggerProps } from './WorkspaceSettingsTrigger';
export {
  SettingsTriggerProvider,
  useSettingsTrigger,
} from './SettingsTriggerContext';
export type { SettingsTriggerContextValue, SettingsTriggerProviderProps } from './SettingsTriggerContext';

// Declarative panel registration (use inside WorkspaceContextProvider from Studio)
export { WorkspaceRail } from './WorkspaceRail';
export type { WorkspaceRailProps } from './WorkspaceRail';
export { WorkspaceRailPanel } from './WorkspaceRailPanel';
export type { WorkspaceRailPanelProps } from './WorkspaceRailPanel';
export {
  usePanelRegistration,
  PanelRegistrationContextProvider,
} from './PanelRegistrationContext';
export type {
  RailSide,
  PanelRegistrationContextValue,
} from './PanelRegistrationContext';

// Panel utilities
export { PanelSettings } from './PanelSettings';
export type { PanelSettingsProps, PanelSettingDef } from './PanelSettings';

export { usePanelLock } from './usePanelLock';
export type { PanelLockState } from './usePanelLock';
