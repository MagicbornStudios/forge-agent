'use client';

import * as React from 'react';
import { Input } from '@forge/ui/input';
import { Textarea } from '@forge/ui/textarea';
import { Switch } from '@forge/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { SettingsSection } from './SettingsSection';
import { SettingsField } from './SettingsField';

const DEFAULT_AI_INSTRUCTIONS =
  "You are an AI assistant for a creative workspace. Use available actions to help users edit their projects.";

const THEME_OPTIONS = [{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }];
const DENSITY_OPTIONS = [{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }];

/**
 * App-scope settings form. Rendered under AppSettingsProvider in the sidebar.
 * Tree is the source of truth; codegen reads registry and writes generated/defaults.ts.
 */
export function AppSettingsRegistrations() {
  return (
    <div className="space-y-4">
      <SettingsSection sectionId="ai-core" title="AI">
        <SettingsField
          fieldKey="ai.agentName"
          label="Default agent name"
          type="text"
          placeholder="Forge Assistant"
          default="Forge Assistant"
        >
          <Input placeholder="Forge Assistant" />
        </SettingsField>
        <SettingsField
          fieldKey="ai.instructions"
          label="Global instructions"
          type="textarea"
          placeholder="Describe the assistant's role and safety rules."
          default={DEFAULT_AI_INSTRUCTIONS}
        >
          <Textarea placeholder="Describe the assistant's role and safety rules." />
        </SettingsField>
        <SettingsField
          fieldKey="ai.responsesCompatOnly"
          label="Responses v2 compatible only"
          type="toggle"
          description="Required for CopilotKit BuiltInAgent. Filters model picker to v2-compatible models."
          default={true}
        >
          <Switch />
        </SettingsField>
        <SettingsField
          fieldKey="ai.temperature"
          label="Temperature"
          type="number"
          placeholder="0.2"
          description="Lower is more deterministic. Typically 0.1 - 0.7."
          default={0.2}
        >
          <Input type="number" placeholder="0.2" />
        </SettingsField>
        <SettingsField fieldKey="ai.toolsEnabled" label="Enable tool calls" type="toggle" default={true}>
          <Switch />
        </SettingsField>
        <SettingsField fieldKey="ai.showAgentName" label="Show agent name in UI" type="toggle" default={true}>
          <Switch />
        </SettingsField>
      </SettingsSection>
      <SettingsSection sectionId="ui" title="App appearance" description="Global UI defaults.">
        <SettingsField
          fieldKey="ui.theme"
          label="Theme"
          type="select"
          options={THEME_OPTIONS}
          default="dark"
        >
          {({ value, onChange }) => (
            <Select value={value == null ? '' : String(value)} onValueChange={(v) => onChange(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </SettingsField>
        <SettingsField
          fieldKey="ui.density"
          label="Density"
          type="select"
          description="Compact is optimized for editor surfaces and dense tool UIs."
          options={DENSITY_OPTIONS}
          default="compact"
        >
          {({ value, onChange }) => (
            <Select value={value == null ? '' : String(value)} onValueChange={(v) => onChange(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {DENSITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </SettingsField>
        <SettingsField
          fieldKey="ui.toastsEnabled"
          label="Enable toast notifications"
          type="toggle"
          description="Disable to silence success and error toasts across the app."
          default={true}
        >
          <Switch />
        </SettingsField>
      </SettingsSection>
      <SettingsSection sectionId="other" title="Other">
        <SettingsField fieldKey="editor.locked" label="Editor locked" type="toggle" default={false}>
          <Switch />
        </SettingsField>
      </SettingsSection>
      <SettingsSection sectionId="panels" title="Panels" description="Panel visibility per editor.">
        <SettingsField fieldKey="panel.visible.dialogue-left" label="Dialogue left panel" type="toggle" default={true}>
          <Switch />
        </SettingsField>
        <SettingsField fieldKey="panel.visible.dialogue-main" label="Dialogue main panel" type="toggle" default={true}>
          <Switch />
        </SettingsField>
        <SettingsField fieldKey="panel.visible.dialogue-right" label="Dialogue right panel" type="toggle" default={true}>
          <Switch />
        </SettingsField>
        <SettingsField fieldKey="panel.visible.dialogue-chat" label="Chat panel" type="toggle" default={true}>
          <Switch />
        </SettingsField>
        <SettingsField fieldKey="panel.visible.dialogue-bottom" label="Dialogue bottom panel" type="toggle" default={true}>
          <Switch />
        </SettingsField>
        <SettingsField fieldKey="panel.visible.character-left" label="Character left panel" type="toggle" default={true}>
          <Switch />
        </SettingsField>
        <SettingsField fieldKey="panel.visible.character-right" label="Character right panel" type="toggle" default={true}>
          <Switch />
        </SettingsField>
        <SettingsField fieldKey="panel.visible.character-chat" label="Chat panel" type="toggle" default={true}>
          <Switch />
        </SettingsField>
      </SettingsSection>
    </div>
  );
}
