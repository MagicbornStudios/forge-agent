'use client';

import * as React from 'react';
import {
  WorkspaceButton,
  type WorkspaceButtonProps,
} from '../workspace/controls/WorkspaceButton';

export type EditorButtonProps = WorkspaceButtonProps;

/**
 * EditorButton — tooltip-enabled button for editor-mode UI.
 *
 * Preferred name for new editor components. Wraps WorkspaceButton for
 * backward compatibility.
 */
export const EditorButton = React.forwardRef<HTMLButtonElement, EditorButtonProps>(
  (props, ref) => <WorkspaceButton ref={ref} {...props} />,
);

EditorButton.displayName = 'EditorButton';
