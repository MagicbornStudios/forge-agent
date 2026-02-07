'use client';

import * as React from 'react';
import {
  WorkspaceTooltip,
  type WorkspaceTooltipProps,
} from '../workspace/tooltip/WorkspaceTooltip';

export type EditorTooltipProps = WorkspaceTooltipProps;

/**
 * EditorTooltip — thin wrapper around WorkspaceTooltip.
 *
 * Preferred name for editor-mode tooltips in the new naming system.
 */
export function EditorTooltip(props: EditorTooltipProps) {
  return <WorkspaceTooltip {...props} />;
}
