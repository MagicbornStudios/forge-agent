import type { EditorMenubarItem, EditorMenubarMenu } from './EditorMenubar';

export interface CreateEditorMenubarMenusOptions {
  /** File menu items (New, Open, Save, Switch project, etc.). */
  file: EditorMenubarItem[];
  /** Optional View menu items (Appearance, panel toggles). */
  view?: EditorMenubarItem[];
  /** Optional Edit menu items. */
  edit?: EditorMenubarItem[];
  /** Optional State or other menu items. */
  state?: EditorMenubarItem[];
  /** Optional Settings menu items (Open Settings, user/account). */
  settings?: EditorMenubarItem[];
  /** Optional Help menu items (Welcome, Show Commands, About). */
  help?: EditorMenubarItem[];
  /** Additional menus appended after the standard order (e.g. Tools). */
  extra?: EditorMenubarMenu[];
}

const STANDARD_ORDER: (keyof CreateEditorMenubarMenusOptions)[] = [
  'file',
  'view',
  'edit',
  'state',
  'settings',
  'help',
];

/**
 * Builds EditorMenubarMenu[] in a fixed order (File, View, Edit, State, Settings, Help) for the app tab row.
 * Use this so the app bar contract is consistent; contribute the result via your app's
 * useAppMenubarContribution(menus). Put the rendered menubar in EditorApp.Tabs.Menubar.
 */
export function createEditorMenubarMenus(options: CreateEditorMenubarMenusOptions): EditorMenubarMenu[] {
  const menus: EditorMenubarMenu[] = [];
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
