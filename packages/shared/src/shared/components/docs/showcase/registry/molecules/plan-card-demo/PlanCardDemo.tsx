'use client';

import { PlanActionBar, PlanCard } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

export function PlanCardDemo() {
  return (
    <ShowcaseDemoSurface>
      <PlanCard
        title="Add dialogue node"
        summary="Create a new character node and connect to the narrative branch."
        steps={[
          { title: 'Create CHARACTER node', description: 'Place at (120, 80)', meta: 'node' },
          { title: 'Connect to PLAYER', description: 'Add edge for dialogue flow', meta: 'edge' },
        ]}
        footer={<PlanActionBar onAccept={() => undefined} onReject={() => undefined} />}
      />
    </ShowcaseDemoSurface>
  );
}
