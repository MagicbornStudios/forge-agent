'use client';

import * as React from 'react';
import * as UI from '@forge/ui';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function AccordionDemo() {
  return (
    <ShowcaseDemoSurface>
      <UI.Accordion type="single" collapsible className="w-full">
        <UI.AccordionItem value="item-1">
          <UI.AccordionTrigger>What ships in this release?</UI.AccordionTrigger>
          <UI.AccordionContent>
            Bug fixes, performance improvements, and the new Accordion component.
          </UI.AccordionContent>
        </UI.AccordionItem>
        <UI.AccordionItem value="item-2">
          <UI.AccordionTrigger>How do I install?</UI.AccordionTrigger>
          <UI.AccordionContent>
            Run <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm install</code> from the
            project root.
          </UI.AccordionContent>
        </UI.AccordionItem>
      </UI.Accordion>
    </ShowcaseDemoSurface>
  );
}
