// ---------------------------------------------------------------------------
// Editor Platform - Forge Agent's Unreal-Engine-inspired editor kit
// ---------------------------------------------------------------------------
// These components provide a complete declarative UI system for building
// AI-first editors with resizable, dockable, lockable panels.
//
// Architecture
// EditorShell          <- root container (data-editor-id, data-domain, data-theme)
//   Slots: .Header | .Toolbar | .Layout | .StatusBar | .Overlay | .Settings (recommended); or raw children (legacy)
//   EditorHeader       <- title bar  (.Left, .Center, .Right)
//   EditorToolbar      <- toolbar    (.Left, .Center, .Right, .Menubar, .Button ...)
//   EditorReviewBar    <- AI change review (revert / accept)
//   EditorDockLayout   <- resizable panel layout; slots .Left | .Main | .Right | .Bottom or props (DockLayout alias deprecated)
//     EditorDockPanel <- single panel (title, tabs, lock, scroll) (DockPanel alias deprecated)
//       PanelTabs      <- tab bar within a panel
//     ViewportMeta     <- editor viewport metadata wrapper
//   EditorStatusBar    <- bottom status bar
//   EditorOverlaySurface <- modal overlay surface
// ---------------------------------------------------------------------------

// Layout primitives (Editor* canonical; DockLayout/DockPanel deprecated aliases)
export {
  EditorDockLayout,
  DockLayout,
  RIGHT_INSPECTOR_PANEL_ID,
  RIGHT_SETTINGS_PANEL_ID,
} from './EditorDockLayout';
export type {
  DockLayoutProps,
  DockLayoutViewport,
  DockLayoutSlotConfig,
  DockLayoutRef,
  DockLayoutPanelProps,
  RailPanelDescriptor,
} from './EditorDockLayout';

export { EditorDockPanel, DockPanel } from './EditorDockPanel';
export type { DockPanelProps } from './EditorDockPanel';

export { PanelTabs } from './PanelTabs';
export type { PanelTabDef, PanelTabProps, PanelTabsProps } from './PanelTabs';

export { SettingsTabs } from './SettingsTabs';
export type { SettingsTabDef, SettingsTabsProps } from './SettingsTabs';

export { ViewportMeta } from './ViewportMeta';
export type { ViewportMetaProps } from './ViewportMeta';

export { DockSidebar } from './DockSidebar';
export type { DockSidebarProps } from './DockSidebar';

export { EditorButton } from './EditorButton';
export type { EditorButtonProps } from './EditorButton';

export { EditorTooltip } from './EditorTooltip';
export type { EditorTooltipProps } from './EditorTooltip';

// Shell + Editor components
export { EditorShell } from './EditorShell';
export type { EditorShellProps } from './EditorShell';

export { EditorHeader } from './EditorHeader';
export type { EditorHeaderProps } from './EditorHeader';

export { EditorToolbar } from './EditorToolbar';
export type { EditorToolbarProps } from './EditorToolbar';

export {
  EditorFileMenu,
  EditorFileMenuSwitchProject,
  EditorFileMenuNew,
  EditorFileMenuOpen,
  EditorFileMenuSave,
  EditorFileMenuSeparator,
} from './toolbar/EditorFileMenu';
export type {
  EditorFileMenuProps,
  EditorFileMenuItem,
  EditorFileMenuSwitchProjectOptions,
  EditorFileMenuActionOptions,
} from './toolbar/EditorFileMenu';
export { EditorMenubar } from './toolbar/EditorMenubar';
export type { EditorMenubarProps, EditorMenubarMenu, EditorMenubarItem } from './toolbar/EditorMenubar';
export { createEditorMenubarMenus } from './toolbar/createEditorMenubarMenus';
export type { CreateEditorMenubarMenusOptions } from './toolbar/createEditorMenubarMenus';
export { EditorViewMenu } from './toolbar/EditorViewMenu';
export type {
  EditorViewMenuAppearanceOptions,
  EditorViewMenuPanelToggleOptions,
} from './toolbar/EditorViewMenu';
export { EditorEditMenu } from './toolbar/EditorEditMenu';
export type { EditorEditMenuItemOptions } from './toolbar/EditorEditMenu';
export { EditorSettingsMenu } from './toolbar/EditorSettingsMenu';
export type {
  EditorSettingsMenuOpenSettingsOptions,
  EditorSettingsMenuUserOptions,
} from './toolbar/EditorSettingsMenu';
export { EditorHelpMenu } from './toolbar/EditorHelpMenu';
export type { EditorHelpMenuItemOptions } from './toolbar/EditorHelpMenu';
export { EditorProjectSelect } from './toolbar/EditorProjectSelect';
export type { EditorProjectSelectProps, EditorProjectOption } from './toolbar/EditorProjectSelect';

export { EditorInspector } from './EditorInspector';
export type { EditorInspectorProps } from './EditorInspector';

export {
  EditorSidebar,
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
} from './EditorSidebar';
export type { EditorSidebarProps } from './EditorSidebar';

export { EditorTab } from './EditorTab';
export type { EditorTabProps } from './EditorTab';
export { EditorTabGroup } from './EditorTabGroup';
export type { EditorTabGroupProps } from './EditorTabGroup';

export { EditorBottomPanel } from './EditorBottomPanel';
export type { EditorBottomPanelProps } from './EditorBottomPanel';

export { EditorStatusBar } from './EditorStatusBar';
export type { EditorStatusBarProps } from './EditorStatusBar';

export { EditorReviewBar } from './EditorReviewBar';
export type { EditorReviewBarProps } from './EditorReviewBar';

export { EditorOverlaySurface } from './EditorOverlaySurface';
export type { EditorOverlaySurfaceProps } from './EditorOverlaySurface';

export { EditorSettingsTrigger } from './EditorSettingsTrigger';
export type { EditorSettingsTriggerProps } from './EditorSettingsTrigger';
export {
  SettingsTriggerProvider,
  useSettingsTrigger,
} from './SettingsTriggerContext';
export type { SettingsTriggerContextValue, SettingsTriggerProviderProps } from './SettingsTriggerContext';

// Declarative panel registration (use inside EditorLayoutProvider from Studio)
export { EditorRail } from './EditorRail';
export type { EditorRailProps } from './EditorRail';
export { EditorPanel } from './EditorPanel';
export type { EditorPanelProps } from './EditorPanel';
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
