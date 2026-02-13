'use client';

import type { SettingsSection } from '@/components/settings/types';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

const MOCK_SECTIONS: SettingsSection[] = [
  {
    id: 'demo-ui',
    title: 'Appearance',
    fields: [
      {
        key: 'ui.theme',
        label: 'Theme',
        type: 'select',
        options: [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ],
        default: 'dark',
      },
      {
        key: 'ui.density',
        label: 'Density',
        type: 'select',
        options: [
          { value: 'compact', label: 'Compact' },
          { value: 'comfortable', label: 'Comfortable' },
        ],
        default: 'compact',
      },
    ],
  },
];

/** Settings panel with mock app-scope sections. Uses real settings store. */
export function SettingsPanelDemo() {
  return (
    <div className="max-w-sm">
      <SettingsPanel scope="app" sections={MOCK_SECTIONS} />
    </div>
  );
}

export default SettingsPanelDemo;
