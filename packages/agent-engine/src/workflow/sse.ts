import type { WorkflowEvent } from './events';

export function toSse(event: WorkflowEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}
