'use client';

import { PanelTabs } from '@forge/shared';

export function PanelTabsDemo() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <PanelTabs
        tabs={[
          { id: 'inspector', label: 'Inspector', content: <div className="p-4 text-sm">Inspector content</div> },
          { id: 'chat', label: 'Chat', content: <div className="p-4 text-sm">Chat content</div> },
        ]}
        defaultTabId="inspector"
      />
    </div>
  );
}

export default PanelTabsDemo;
