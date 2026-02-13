import type { ComponentType } from 'react';
import { COMPONENT_DEMO_IDS, type ComponentDemoId } from './generated-ids';
import { getAssistantDemo } from './assistant-ui';
import { getAtomDemo } from './atoms';
import { getEditorDemo } from './editor';
import { getToolUiDemo } from './tool-ui';

export type DemoRenderer = ComponentType;

function isAtomDemoId(id: ComponentDemoId): id is Extract<ComponentDemoId, `ui.${string}`> {
  return id.startsWith('ui.');
}

function isEditorDemoId(id: ComponentDemoId): id is Extract<ComponentDemoId, `editor.${string}`> {
  return id.startsWith('editor.');
}

function isAssistantDemoId(id: ComponentDemoId): id is Extract<ComponentDemoId, `assistant-ui.${string}`> {
  return id.startsWith('assistant-ui.');
}

function isToolUiDemoId(id: ComponentDemoId): id is Extract<ComponentDemoId, `tool-ui.${string}`> {
  return id.startsWith('tool-ui.');
}

function resolveDemo(id: ComponentDemoId): DemoRenderer {
  if (isAtomDemoId(id)) {
    return getAtomDemo(id);
  }

  if (isEditorDemoId(id)) {
    return getEditorDemo(id);
  }

  if (isAssistantDemoId(id)) {
    return getAssistantDemo(id);
  }

  if (isToolUiDemoId(id)) {
    return getToolUiDemo(id);
  }

  throw new Error(`Unrecognized component demo id: ${id}`);
}

export const COMPONENT_DEMOS = Object.fromEntries(
  COMPONENT_DEMO_IDS.map((id) => [id, resolveDemo(id)]),
) as Record<ComponentDemoId, DemoRenderer>;
