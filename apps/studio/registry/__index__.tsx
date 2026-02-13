import React from 'react';

const Lazy_assistant_panel_demo = React.lazy(() => import('./default/example/assistant-panel-demo').then((m) => ({ default: m.AssistantPanelDemo ?? m.default })));
const Lazy_badge_demo = React.lazy(() => import('./default/example/badge-demo').then((m) => ({ default: m.BadgeDemo ?? m.default })));
const Lazy_button_demo = React.lazy(() => import('./default/example/button-demo').then((m) => ({ default: m.ButtonDemo ?? m.default })));
const Lazy_card_demo = React.lazy(() => import('./default/example/card-demo').then((m) => ({ default: m.CardDemo ?? m.default })));
const Lazy_codebase_agent_strategy_editor = React.lazy(() => import('./default/example/codebase-agent-strategy-editor').then((m) => ({ default: m.CodebaseAgentStrategyEditor ?? m.default })));
const Lazy_density_demo = React.lazy(() => import('./default/example/density-demo').then((m) => ({ default: m.DensityDemo ?? m.default })));
const Lazy_dialog_demo = React.lazy(() => import('./default/example/dialog-demo').then((m) => ({ default: m.DialogDemo ?? m.default })));
const Lazy_dock_layout_demo = React.lazy(() => import('./default/example/dock-layout-demo').then((m) => ({ default: m.DockLayoutDemo ?? m.default })));
const Lazy_dropdown_menu_demo = React.lazy(() => import('./default/example/dropdown-menu-demo').then((m) => ({ default: m.DropdownMenuDemo ?? m.default })));
const Lazy_editor_shell_demo = React.lazy(() => import('./default/example/editor-shell-demo').then((m) => ({ default: m.EditorShellDemo ?? m.default })));
const Lazy_editor_toolbar_demo = React.lazy(() => import('./default/example/editor-toolbar-demo').then((m) => ({ default: m.EditorToolbarDemo ?? m.default })));
const Lazy_input_demo = React.lazy(() => import('./default/example/input-demo').then((m) => ({ default: m.InputDemo ?? m.default })));
const Lazy_label_demo = React.lazy(() => import('./default/example/label-demo').then((m) => ({ default: m.LabelDemo ?? m.default })));
const Lazy_panel_tabs_demo = React.lazy(() => import('./default/example/panel-tabs-demo').then((m) => ({ default: m.PanelTabsDemo ?? m.default })));
const Lazy_plan_card_demo = React.lazy(() => import('./default/example/plan-card-demo').then((m) => ({ default: m.PlanCardDemo ?? m.default })));
const Lazy_select_demo = React.lazy(() => import('./default/example/select-demo').then((m) => ({ default: m.SelectDemo ?? m.default })));
const Lazy_settings_panel_demo = React.lazy(() => import('./default/example/settings-panel-demo').then((m) => ({ default: m.SettingsPanelDemo ?? m.default })));
const Lazy_switch_demo = React.lazy(() => import('./default/example/switch-demo').then((m) => ({ default: m.SwitchDemo ?? m.default })));
const Lazy_tabs_demo = React.lazy(() => import('./default/example/tabs-demo').then((m) => ({ default: m.TabsDemo ?? m.default })));
const Lazy_theme_switcher_demo = React.lazy(() => import('./default/example/theme-switcher-demo').then((m) => ({ default: m.ThemeSwitcherDemo ?? m.default })));

export const Index = {
  'assistant-panel-demo': { component: Lazy_assistant_panel_demo },
  'badge-demo': { component: Lazy_badge_demo },
  'button-demo': { component: Lazy_button_demo },
  'card-demo': { component: Lazy_card_demo },
  'codebase-agent-strategy-editor': { component: Lazy_codebase_agent_strategy_editor },
  'density-demo': { component: Lazy_density_demo },
  'dialog-demo': { component: Lazy_dialog_demo },
  'dock-layout-demo': { component: Lazy_dock_layout_demo },
  'dropdown-menu-demo': { component: Lazy_dropdown_menu_demo },
  'editor-shell-demo': { component: Lazy_editor_shell_demo },
  'editor-toolbar-demo': { component: Lazy_editor_toolbar_demo },
  'input-demo': { component: Lazy_input_demo },
  'label-demo': { component: Lazy_label_demo },
  'panel-tabs-demo': { component: Lazy_panel_tabs_demo },
  'plan-card-demo': { component: Lazy_plan_card_demo },
  'select-demo': { component: Lazy_select_demo },
  'settings-panel-demo': { component: Lazy_settings_panel_demo },
  'switch-demo': { component: Lazy_switch_demo },
  'tabs-demo': { component: Lazy_tabs_demo },
  'theme-switcher-demo': { component: Lazy_theme_switcher_demo },
} as const;

export type RegistryName = keyof typeof Index;