'use client';

import * as React from 'react';
import {
  AssistantRuntimeProvider,
  type ChatModelAdapter,
  type ThreadMessage,
  useLocalRuntime,
} from '@assistant-ui/react';
import { cn } from '@forge/ui/lib/utils';

const DEMO_SURFACE_STYLE: React.CSSProperties = {
  '--control-gap': '0.375rem',
  '--control-height': '2rem',
  '--control-height-sm': '1.75rem',
  '--control-padding-x': '0.625rem',
  '--control-padding-y': '0.25rem',
  '--header-height': '2.375rem',
  '--toolbar-height': '2.5rem',
  '--status-height': '1.75rem',
  '--panel-padding': '0.625rem',
  '--tab-height': '2rem',
  '--icon-size': '0.875rem',
  '--icon-size-lg': '1rem',
} as React.CSSProperties;

const INITIAL_THREAD_MESSAGES: ThreadMessage[] = [
  {
    id: 'showcase-user-1',
    createdAt: new Date('2026-02-01T09:00:00.000Z'),
    role: 'user',
    content: [{ type: 'text', text: 'Show me the latest component docs updates.' }],
    attachments: [],
    metadata: {
      custom: {},
    },
  },
  {
    id: 'showcase-assistant-1',
    createdAt: new Date('2026-02-01T09:00:01.000Z'),
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: 'All showcase entries now render with BlockView Preview/Code.',
      },
    ],
    status: {
      type: 'complete',
      reason: 'stop',
    },
    metadata: {
      unstable_state: {},
      unstable_annotations: [],
      unstable_data: [],
      steps: [],
      custom: {},
    },
  },
];

const LOCAL_ASSISTANT_ADAPTER: ChatModelAdapter = {
  async run(options) {
    const prompt =
      [...options.messages]
        .reverse()
        .find((message) => message.role === 'user')
        ?.content.filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join(' ') ?? 'your latest request';

    return {
      content: [
        {
          type: 'text',
          text: `Mock assistant response for docs preview: ${prompt}`,
        },
      ],
      status: {
        type: 'complete',
        reason: 'stop',
      },
    };
  },
};

export function ShowcaseDemoSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('rounded-lg border border-border/80 bg-muted/20 p-4', className)}
      style={DEMO_SURFACE_STYLE}
    >
      {children}
    </div>
  );
}

export function AssistantDemoHarness({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const runtime = useLocalRuntime(LOCAL_ASSISTANT_ADAPTER, {
    initialMessages: INITIAL_THREAD_MESSAGES,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ShowcaseDemoSurface className={cn('h-[420px] min-h-[300px]', className)}>
        {children}
      </ShowcaseDemoSurface>
    </AssistantRuntimeProvider>
  );
}

