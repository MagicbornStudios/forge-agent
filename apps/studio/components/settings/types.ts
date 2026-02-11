export type SettingsFieldType = "text" | "textarea" | "select" | "number" | "toggle";

export interface SettingsOption {
  value: string;
  label: string;
}

export interface SettingsField {
  key: string;
  label: string;
  type: SettingsFieldType;
  description?: string;
  placeholder?: string;
  options?: SettingsOption[];
  /** Default value when no override is stored. Used by store init and codegen. */
  default?: unknown;
}

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  fields: SettingsField[];
}
