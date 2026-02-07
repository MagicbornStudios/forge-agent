"use client";

import { DEFAULT_MODEL_OPTIONS } from "@/lib/model-router/defaults";
import type { SettingsSection } from "./types";

const modelOptions = DEFAULT_MODEL_OPTIONS;

export const APP_SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "ai-core",
    title: "AI defaults",
    description: "Global defaults for Copilot behavior and OpenRouter routing.",
    fields: [
      {
        key: "ai.agentName",
        label: "Default agent name",
        type: "text",
        placeholder: "Forge Assistant",
      },
      {
        key: "ai.instructions",
        label: "Global instructions",
        type: "textarea",
        placeholder: "Describe the assistant's role and safety rules.",
      },
      {
        key: "ai.model",
        label: "Default model",
        type: "select",
        options: modelOptions,
        description: "Auto uses the router. Picking a model sets the global default.",
      },
      {
        key: "ai.temperature",
        label: "Temperature",
        type: "number",
        placeholder: "0.2",
        description: "Lower is more deterministic. Typically 0.1 - 0.7.",
      },
      {
        key: "ai.toolsEnabled",
        label: "Enable tool calls",
        type: "toggle",
      },
      {
        key: "ai.showAgentName",
        label: "Show agent name in UI",
        type: "toggle",
      },
    ],
  },
  {
    id: "ui",
    title: "App appearance",
    description: "Global UI defaults.",
    fields: [
      {
        key: "ui.theme",
        label: "Theme",
        type: "select",
        options: [
          { value: "dark-fantasy", label: "Dark Fantasy" },
          { value: "darcula", label: "Darcula" },
          { value: "cyberpunk", label: "Cyberpunk" },
          { value: "high-contrast", label: "High Contrast" },
          { value: "light", label: "Light" },
          { value: "girly", label: "Girly" },
        ],
      },
      {
        key: "ui.toastsEnabled",
        label: "Enable toast notifications",
        type: "toggle",
        description: "Disable to silence success and error toasts across the app.",
      },
    ],
  },
];

export const WORKSPACE_SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "workspace-ai",
    title: "Workspace AI overrides",
    description: "Overrides for this workspace only. Unset values inherit from the app.",
    fields: [
      {
        key: "ai.agentName",
        label: "Workspace agent name",
        type: "text",
        placeholder: "Forge Agent",
      },
      {
        key: "ai.instructions",
        label: "Workspace instructions",
        type: "textarea",
        placeholder: "Specific guidance for this workspace.",
      },
      {
        key: "ai.model",
        label: "Workspace model",
        type: "select",
        options: modelOptions,
        description: "Auto uses the router. Picking a model overrides per-request for this workspace.",
      },
      {
        key: "ai.temperature",
        label: "Temperature",
        type: "number",
      },
      {
        key: "ai.toolsEnabled",
        label: "Enable tool calls",
        type: "toggle",
      },
    ],
  },
];

export const EDITOR_SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "editor-ai",
    title: "Editor AI overrides",
    description: "Editor-level overrides for this workspace editor.",
    fields: [
      {
        key: "ai.agentName",
        label: "Editor agent name",
        type: "text",
      },
      {
        key: "ai.instructions",
        label: "Editor instructions",
        type: "textarea",
      },
      {
        key: "ai.model",
        label: "Editor model",
        type: "select",
        options: modelOptions,
        description: "Auto uses the router. Picking a model overrides per-request for this editor.",
      },
      {
        key: "ai.temperature",
        label: "Temperature",
        type: "number",
      },
      {
        key: "ai.toolsEnabled",
        label: "Enable tool calls",
        type: "toggle",
      },
    ],
  },
];
