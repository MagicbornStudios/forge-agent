'use client';

import * as React from 'react';
import { WorkspaceButton, WorkspaceOverlaySurface } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

const OVERLAYS: React.ComponentProps<typeof WorkspaceOverlaySurface>['overlays'] = [
  {
    id: 'overlay-demo',
    type: 'modal',
    title: 'Overlay Surface',
    size: 'sm',
    render: ({ onDismiss }) => (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Editor overlay content.</p>
        <WorkspaceButton size="sm" onClick={onDismiss}>
          Close
        </WorkspaceButton>
      </div>
    ),
  },
];

const INITIAL_ACTIVE_OVERLAY: NonNullable<
  React.ComponentProps<typeof WorkspaceOverlaySurface>['activeOverlay']
> = {
  id: 'overlay-demo',
  payload: {},
};

export function WorkspaceOverlayDemo() {
  const [activeOverlay, setActiveOverlay] =
    React.useState<React.ComponentProps<typeof WorkspaceOverlaySurface>['activeOverlay']>(
      null,
    );

  const dismissOverlay = React.useCallback(() => {
    setActiveOverlay(null);
  }, []);

  const openOverlay = React.useCallback(() => {
    setActiveOverlay(INITIAL_ACTIVE_OVERLAY);
  }, []);

  return (
    <ShowcaseDemoSurface>
      <WorkspaceOverlaySurface
        overlays={OVERLAYS}
        activeOverlay={activeOverlay}
        onDismiss={dismissOverlay}
      />
      <div className="mt-2 flex items-center gap-2">
        <WorkspaceButton
          size="sm"
          variant="outline"
          onClick={openOverlay}
          disabled={activeOverlay != null}
        >
          Open overlay
        </WorkspaceButton>
        <p className="text-xs text-muted-foreground">Overlay opens above this preview.</p>
      </div>
    </ShowcaseDemoSurface>
  );
}
