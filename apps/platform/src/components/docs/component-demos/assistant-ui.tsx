'use client';

import * as React from 'react';
import {
  ComposerAddAttachment,
  Thread,
  ThreadList,
  ToolFallback,
  ToolGroup,
  TooltipIconButton,
  AssistantDevToolsBridge,
  CodebaseAgentStrategyEditor,
} from '@forge/shared/components/assistant-ui';
import type { ComponentDemoId } from './generated-ids';
import { AssistantRuntimeHarness, ComponentDemoFrame } from './harnesses';

export type AssistantDemoId = Extract<ComponentDemoId, `assistant-ui.${string}`>;

type DemoRenderer = () => React.JSX.Element;

const ASSISTANT_DEMOS: Record<AssistantDemoId, DemoRenderer> = {
  'assistant-ui.attachment': () => (
    <AssistantRuntimeHarness>
      <Thread composerLeading={<ComposerAddAttachment />} />
    </AssistantRuntimeHarness>
  ),
  'assistant-ui.codebase-agent-strategy-editor': () => (
    <ComponentDemoFrame className="h-[420px] p-0">
      <CodebaseAgentStrategyEditor
        showThreadList={false}
        showToolsPanel={false}
        className="h-full"
      />
    </ComponentDemoFrame>
  ),
  'assistant-ui.devtools-bridge': () => (
    <AssistantRuntimeHarness>
      <div className="space-y-3">
        <AssistantDevToolsBridge />
        <p className="text-xs text-muted-foreground">
          AssistantDevToolsBridge mounted inside Assistant runtime.
        </p>
        <Thread />
      </div>
    </AssistantRuntimeHarness>
  ),
  'assistant-ui.markdown-text': () => (
    <AssistantRuntimeHarness>
      <Thread />
    </AssistantRuntimeHarness>
  ),
  'assistant-ui.thread': () => (
    <AssistantRuntimeHarness>
      <Thread />
    </AssistantRuntimeHarness>
  ),
  'assistant-ui.thread-list': () => (
    <AssistantRuntimeHarness>
      <ThreadList />
    </AssistantRuntimeHarness>
  ),
  'assistant-ui.tool-fallback': () => (
    <ComponentDemoFrame>
      <ToolFallback
        type="tool-call"
        toolCallId="docs-tool-call-preview"
        toolName="render_plan"
        args={{ title: 'Showcase plan', steps: 3 }}
        argsText={JSON.stringify({ title: 'Showcase plan', steps: 3 }, null, 2)}
        status={{ type: 'complete' }}
        result={{ outcome: 'success', applied: true }}
        addResult={() => undefined}
        resume={() => undefined}
      />
    </ComponentDemoFrame>
  ),
  'assistant-ui.tool-group': () => (
    <ComponentDemoFrame>
      <ToolGroup.Root defaultOpen>
        <ToolGroup.Trigger count={3} active={false} />
        <ToolGroup.Content>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Tool call 1: parse component inventory</p>
            <p>Tool call 2: generate docs pages</p>
            <p>Tool call 3: validate showcase coverage</p>
          </div>
        </ToolGroup.Content>
      </ToolGroup.Root>
    </ComponentDemoFrame>
  ),
  'assistant-ui.tooltip-icon-button': () => (
    <ComponentDemoFrame>
      <TooltipIconButton tooltip="Run action" variant="outline">
        Action
      </TooltipIconButton>
    </ComponentDemoFrame>
  ),
};

export function getAssistantDemo(id: AssistantDemoId): DemoRenderer {
  return ASSISTANT_DEMOS[id];
}
