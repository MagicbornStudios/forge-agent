/**
 * Inspector composition contract. Sections keyed off shared Selection.
 */

import type { ReactNode } from 'react';
import type { Selection } from './selection';

export interface InspectorSection {
  id: string;
  title: string;
  /** When true, this section is shown. */
  when: (selection: Selection | null) => boolean;
  /** Render section content. */
  render: (props: { selection: Selection | null }) => ReactNode;
}
