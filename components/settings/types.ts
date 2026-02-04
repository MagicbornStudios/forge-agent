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
}

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  fields: SettingsField[];
}
