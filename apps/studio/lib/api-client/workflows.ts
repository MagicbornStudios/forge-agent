import type { WorkflowRunInput } from '@forge/shared/copilot/workflows';
import { API_ROUTES } from './routes';

/**
 * Streaming endpoints are handled here (SSE). The generated OpenAPI client
 * does not support streaming responses, so this file is the single exception
 * that still lives inside the API client boundary.
 */

export async function streamWorkflowRun(
  input: WorkflowRunInput,
  options?: { signal?: AbortSignal }
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(API_ROUTES.WORKFLOWS_RUN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: options?.signal,
    body: JSON.stringify(input),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Workflow stream failed: ${response.status}`);
  }

  return response.body;
}
