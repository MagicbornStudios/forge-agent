import { ChatOpenAI } from '@langchain/openai';
import type { BaseMessage } from '@langchain/core/messages';

export interface OpenRouterChatModelOptions {
  apiKey: string;
  baseURL: string;
  model: string;
  temperature?: number;
  headers?: Record<string, string>;
}

export function createOpenRouterChatModel(options: OpenRouterChatModelOptions): ChatOpenAI {
  return new ChatOpenAI({
    model: options.model,
    temperature: options.temperature ?? 0.2,
    apiKey: options.apiKey,
    configuration: {
      baseURL: options.baseURL,
      defaultHeaders: options.headers,
    },
  });
}

export async function invokeText(input: {
  model: ChatOpenAI;
  messages: BaseMessage[];
}): Promise<string> {
  const response = await input.model.invoke(input.messages);
  if (typeof response.content === 'string') return response.content;

  if (Array.isArray(response.content)) {
    const chunks = response.content
      .map((item) => {
        if (!item || typeof item !== 'object') return '';
        const maybeText = (item as { text?: unknown }).text;
        return typeof maybeText === 'string' ? maybeText : '';
      })
      .filter(Boolean);

    return chunks.join('\n').trim();
  }

  return '';
}
