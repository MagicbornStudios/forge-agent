'use client';

import { Thread } from '@forge/shared';
import { AssistantDemoHarness } from '../../../demos/harnesses';

export function AssistantPanelDemo() {
  return (
    <AssistantDemoHarness className="p-0">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background">
        <Thread />
      </div>
    </AssistantDemoHarness>
  );
}
