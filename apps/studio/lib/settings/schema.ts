/**
 * Legacy schema: key list and types for reference only.
 * Defaults and section definitions now come from the settings tree (SettingsSection/SettingsField)
 * and generated/defaults.ts. See docs/architecture/settings-tree-as-source-and-codegen.mdx.
 */

import type { SettingsOption, SettingsSection } from "@/components/settings/types";

export type SettingsScopeId = "app" | "project" | "editor" | "viewport";

export interface SettingsSchemaEntry {
  key: string;
  type: "text" | "textarea" | "select" | "number" | "toggle";
  label: string;
  description?: string;
  placeholder?: string;
  options?: SettingsOption[];
  default: unknown;
  /** Which scope tabs show this key. */
  scopes: SettingsScopeId[];
}

const themeOptions: SettingsOption[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];
const densityOptions: SettingsOption[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
];
const layoutAlgorithmOptions: SettingsOption[] = [
  { value: "none", label: "None" },
  { value: "dagre", label: "Dagre" },
  { value: "breadthfirst", label: "Breadth-first" },
];

/** Canonical list: add or change a key here to add/update the control and default everywhere. */
export const SETTINGS_SCHEMA: SettingsSchemaEntry[] = [
  // AI – app, project, editor, viewport
  {
    key: "ai.agentName",
    type: "text",
    label: "Default agent name",
    placeholder: "Forge Assistant",
    default: "Forge Assistant",
    scopes: ["app", "project", "editor", "viewport"],
  },
  {
    key: "ai.instructions",
    type: "textarea",
    label: "Global instructions",
    placeholder: "Describe the assistant's role and safety rules.",
    default:
      "You are an AI assistant for a creative workspace. Use available actions to help users edit their projects.",
    scopes: ["app", "project", "editor", "viewport"],
  },
  {
    key: "ai.responsesCompatOnly",
    type: "toggle",
    label: "Responses v2 compatible only",
    description: "Required for CopilotKit BuiltInAgent. Filters model picker to v2-compatible models.",
    default: true,
    scopes: ["app"],
  },
  {
    key: "ai.temperature",
    type: "number",
    label: "Temperature",
    placeholder: "0.2",
    description: "Lower is more deterministic. Typically 0.1 - 0.7.",
    default: 0.2,
    scopes: ["app", "project", "editor", "viewport"],
  },
  {
    key: "ai.toolsEnabled",
    type: "toggle",
    label: "Enable tool calls",
    default: true,
    scopes: ["app", "project", "editor", "viewport"],
  },
  {
    key: "ai.showAgentName",
    type: "toggle",
    label: "Show agent name in UI",
    default: true,
    scopes: ["app", "project"],
  },
  // UI – app, project, editor
  {
    key: "ui.theme",
    type: "select",
    label: "Theme",
    options: themeOptions,
    default: "dark",
    scopes: ["app", "project", "editor"],
  },
  {
    key: "ui.density",
    type: "select",
    label: "Density",
    options: densityOptions,
    description: "Compact is optimized for editor surfaces and dense tool UIs.",
    default: "compact",
    scopes: ["app", "project", "editor"],
  },
  {
    key: "ui.toastsEnabled",
    type: "toggle",
    label: "Enable toast notifications",
    description: "Disable to silence success and error toasts across the app.",
    default: true,
    scopes: ["app", "project"],
  },
  // Editor / panel – app only (panel visibility, locked)
  {
    key: "editor.locked",
    type: "toggle",
    label: "Editor locked",
    default: false,
    scopes: ["app"],
  },
  {
    key: "panel.visible.dialogue-left",
    type: "toggle",
    label: "Dialogue left panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.dialogue-right",
    type: "toggle",
    label: "Dialogue right panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.dialogue-chat",
    type: "toggle",
    label: "Chat panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.dialogue-bottom",
    type: "toggle",
    label: "Dialogue bottom panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.character-left",
    type: "toggle",
    label: "Character left panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.character-right",
    type: "toggle",
    label: "Character right panel",
    default: true,
    scopes: ["app"],
  },
  {
    key: "panel.visible.character-chat",
    type: "toggle",
    label: "Chat panel",
    default: true,
    scopes: ["app"],
  },
  // Graph viewport – viewport only (minimap, edges, layout)
  {
    key: "graph.showMiniMap",
    type: "toggle",
    label: "Show minimap",
    description: "Show the graph minimap in the viewport.",
    default: true,
    scopes: ["viewport"],
  },
  {
    key: "graph.animatedEdges",
    type: "toggle",
    label: "Animated edges",
    description: "Animate edges in the graph.",
    default: true,
    scopes: ["viewport"],
  },
  {
    key: "graph.layoutAlgorithm",
    type: "select",
    label: "Layout algorithm",
    description: "Auto-layout algorithm for the graph. None keeps manual positions.",
    options: layoutAlgorithmOptions,
    default: "none",
    scopes: ["viewport"],
  },
];

const SECTION_META: Record<
  string,
  { title: string; description?: string }
> = {
  "ai-core": {
    title: "AI defaults",
    description: "Global defaults for Copilot behavior and OpenRouter routing.",
  },
  ui: {
    title: "App appearance",
    description: "Global UI defaults.",
  },
  "project-ai": {
    title: "Project AI defaults",
    description: "Overrides for this project. Unset values inherit from app.",
  },
  "project-ui": {
    title: "Project appearance",
    description: "UI overrides for this project.",
  },
  "editor-ai": {
    title: "Editor AI overrides",
    description: "Overrides for this editor only. Unset values inherit from the app.",
  },
  "editor-ui": {
    title: "Editor appearance",
    description: "Editor-level appearance overrides. Unset values inherit from the app.",
  },
  "viewport-ai": {
    title: "Viewport AI overrides",
    description: "Viewport-level overrides for this editor surface.",
  },
  "viewport-ui": {
    title: "Viewport appearance",
    description: "Viewport-level UI overrides.",
  },
  panels: {
    title: "Panel visibility",
    description: "Which panels are visible by default per editor.",
  },
  "graph-viewport": {
    title: "Graph viewport",
    description: "Minimap, animated edges, and layout for graph viewports.",
  },
  other: { title: "Other", description: "" },
};

