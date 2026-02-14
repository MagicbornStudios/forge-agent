'use client';

import { PanelTabs } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function PanelTabsDemo() {
  return (
    <ShowcaseDemoSurface className="p-0">
      <div className="h-[280px] overflow-hidden rounded-lg border border-border">
        <PanelTabs defaultTabId="inspector" className="h-full">
          <PanelTabs.Tab id="inspector" label="Inspector">
            <div className="p-4 text-sm">Inspector content</div>
          </PanelTabs.Tab>
          <PanelTabs.Tab id="assistant" label="Assistant">
            <div className="p-4 text-sm">Assistant content</div>
          </PanelTabs.Tab>
        </PanelTabs>
      </div>
    </ShowcaseDemoSurface>
  );
}
