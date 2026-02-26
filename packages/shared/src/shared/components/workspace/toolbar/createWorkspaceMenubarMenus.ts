import type { WorkspaceMenubarItem, WorkspaceMenubarMenu } from './WorkspaceMenubar';

export interface CreateWorkspaceMenubarMenusOptions {
  /** File menu items (New, Open, Save, Switch project, etc.). */
  file: WorkspaceMenubarItem[];
  /** Optional View menu items (Appearance, panel toggles). */
  view?: WorkspaceMenubarItem[];
  /** Optional Edit menu items. */
  edit?: WorkspaceMenubarItem[];
  /** Optional State or other menu items. */
  state?: WorkspaceMenubarItem[];
  /** Optional Settings menu items (Open Settings, user/account). */
  settings?: WorkspaceMenubarItem[];
  /** Optional Help menu items (Welcome, Show Commands, About). */
  help?: WorkspaceMenubarItem[];
  /** Additional menus appended after the standard order (e.g. Tools). */
  extra?: WorkspaceMenubarMenu[];
}

const STANDARD_ORDER: (keyof CreateWorkspaceMenubarMenusOptions)[] = [
  'file',
  'view',
  'edit',
  'state',
  'settings',
  'help',
];

/**
 * Builds WorkspaceMenubarMenu[] in a fixed order (File, View, Edit, State, Settings, Help) for the app tab row.
 * Use this so the app bar contract is consistent; contribute the result via your app's
 * useAppMenubarContribution(menus). Put the rendered menubar in WorkspaceApp.Tabs.Menubar.
 */
export function createWorkspaceMenubarMenus(options: CreateWorkspaceMenubarMenusOptions): WorkspaceMenubarMenu[] {
  const menus: WorkspaceMenubarMenu[] = [];
  const fileItems = options.file ?? [];
  const stateItems = options.state ?? [];
  const mergedFileItems =
    stateItems.length > 0
      ? [
          ...fileItems,
          { id: 'file-state-sep', type: 'separator' as const },
          ...stateItems,
        ]
      : fileItems;

  for (const key of STANDARD_ORDER) {
    if (key === 'state' && stateItems.length > 0) continue;
    const items = key === 'file' ? mergedFileItems : options[key];
    if (!items || !Array.isArray(items) || items.length === 0) continue;
    const label =
      key === 'file'
        ? 'File'
        : key === 'view'
          ? 'View'
          : key === 'edit'
            ? 'Edit'
            : key === 'state'
              ? 'State'
              : key === 'settings'
                ? 'Settings'
                : key === 'help'
                  ? 'Help'
                  : key;
    menus.push({ id: key, label, items });
  }

  if (options.extra?.length) {
    menus.push(...options.extra);
  }

  return menus;
}
