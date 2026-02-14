'use client';

import * as React from 'react';
import { EditorButton, EditorOverlaySurface } from '@forge/shared';
import { ShowcaseDemoSurface } from '../../../demos/harnesses';

const OVERLAYS: React.ComponentProps<typeof EditorOverlaySurface>['overlays'] = [
  {
    id: 'overlay-demo',
    type: 'modal',
    title: 'Overlay Surface',
    size: 'sm',
    render: ({ onDismiss }) => (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Editor overlay content.</p>
        <EditorButton size="sm" onClick={onDismiss}>
          Close
        </EditorButton>
      </div>
    ),
  },
];

const INITIAL_ACTIVE_OVERLAY: NonNullable<
  React.ComponentProps<typeof EditorOverlaySurface>['activeOverlay']
> = {
  id: 'overlay-demo',
  payload: {},
};

export function EditorOverlayDemo() {
  const [activeOverlay, setActiveOverlay] =
    React.useState<React.ComponentProps<typeof EditorOverlaySurface>['activeOverlay']>(
      INITIAL_ACTIVE_OVERLAY,
    );

  const dismissOverlay = React.useCallback(() => {
    setActiveOverlay(null);
  }, []);

  const openOverlay = React.useCallback(() => {
    setActiveOverlay(INITIAL_ACTIVE_OVERLAY);
  }, []);

  return (
    <ShowcaseDemoSurface>
      <EditorOverlaySurface
        overlays={OVERLAYS}
        activeOverlay={activeOverlay}
        onDismiss={dismissOverlay}
      />
      <div className="mt-2 flex items-center gap-2">
        <EditorButton
          size="sm"
          variant="outline"
          onClick={openOverlay}
          disabled={activeOverlay != null}
        >
          Open overlay
        </EditorButton>
        <p className="text-xs text-muted-foreground">Overlay opens above this preview.</p>
      </div>
    </ShowcaseDemoSurface>
  );
}
