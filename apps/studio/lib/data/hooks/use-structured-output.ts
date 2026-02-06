'use client';

import { useMutation } from '@tanstack/react-query';
import { AiService } from '@/lib/api-client';

export interface StructuredOutputParams {
  prompt: string;
  schemaName?: string;
  schema?: Record<string, unknown>;
}

/**
 * TanStack Query mutation for structured JSON output via LLM.
 *
 * Wraps `AiService.postApiStructuredOutput` to eliminate raw service calls
 * in components.
 *
 * @example
 * ```tsx
 * const structuredOutput = useStructuredOutput();
 * const result = await structuredOutput.mutateAsync({ prompt: 'List characters', schemaName: 'characters' });
 * ```
 */
export function useStructuredOutput() {
  return useMutation<unknown, Error, StructuredOutputParams>({
    mutationFn: async (params) => {
      const data = await AiService.postApiStructuredOutput({
        prompt: params.prompt,
        ...(params.schemaName && { schemaName: params.schemaName }),
        ...(params.schema && { schema: params.schema }),
      });
      return data?.data ?? data;
    },
  });
}
