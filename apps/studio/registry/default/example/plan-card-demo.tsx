'use client';

import { PlanCard, PlanActionBar } from '@forge/shared/copilot/generative-ui';

/** Plan card with Apply/Dismiss. Renders in chat when forge_createPlan returns. */
export function PlanCardDemo() {
  return (
    <div className="space-y-3">
      <PlanCard
        title="Add dialogue node"
        summary="Create a new character node and connect to narrative."
        steps={[
          { title: 'Create CHARACTER node', description: 'Place at (120, 80)', meta: 'node' },
          { title: 'Connect to PLAYER', description: 'Add edge for dialogue flow', meta: 'edge' },
        ]}
        footer={<PlanActionBar onAccept={() => {}} onReject={() => {}} />}
      />
    </div>
  );
}

export default PlanCardDemo;
