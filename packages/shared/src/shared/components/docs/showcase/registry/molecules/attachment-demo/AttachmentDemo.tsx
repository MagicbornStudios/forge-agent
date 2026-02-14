'use client';

import { ComposerAddAttachment, Thread } from '@forge/shared';
import { AssistantDemoHarness } from '../../../demos/harnesses';

export function AttachmentDemo() {
  return (
    <AssistantDemoHarness className="h-[360px] p-0">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background">
        <Thread composerLeading={<ComposerAddAttachment />} />
      </div>
    </AssistantDemoHarness>
  );
}
