"use client";

import * as React from "react";
import { Card } from "@forge/ui/card";
import { Input } from "@forge/ui/input";
import { Textarea } from "@forge/ui/textarea";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@forge/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemSeparator,
} from "@forge/ui/item";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@forge/ui/select";
import { Switch } from "@forge/ui/switch";
import { Button } from "@forge/ui/button";
import { Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore, type SettingsScope } from "@/lib/settings/store";
import type { SettingsSection, SettingsField } from "./types";

export interface SettingsPanelProps {
  scope: SettingsScope;
  sections: SettingsSection[];
  workspaceId?: string;
  viewportId?: string;
  projectId?: string;
  /** Optional icon per section id (e.g. ai-core → Bot). Rendered in section header. */
  sectionIcons?: Record<string, React.ReactNode>;
  /** Optional icon per field key (e.g. ui.theme → Palette). Rendered before field label. */
  fieldIcons?: Record<string, React.ReactNode>;
  className?: string;
}

function SourceBadge({
  label,
  tone = "muted",
}: {
  label: string;
  tone?: "muted" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone === "accent"
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

function fieldValueToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return String(value);
}

function FieldControl({
  field,
  value,
  onChange,
  inputId,
}: {
  field: SettingsField;
  value: unknown;
  onChange: (next: unknown) => void;
  inputId: string;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          id={inputId}
          value={fieldValueToString(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <Input
          id={inputId}
          type="number"
          value={value === undefined ? "" : fieldValueToString(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
    case "select":
      return (
        <Select
          value={value == null ? "" : String(value)}
          onValueChange={(next) => onChange(next)}
        >
          <SelectTrigger id={inputId}>
            <SelectValue placeholder={field.placeholder ?? "Select"} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "toggle":
      return (
        <Switch
          id={inputId}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(checked)}
        />
      );
    case "text":
    default:
      return (
        <Input
          id={inputId}
          value={fieldValueToString(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function SettingsPanel({
  scope,
  sections,
  workspaceId,
  viewportId,
  projectId,
  sectionIcons,
  fieldIcons,
  className,
}: SettingsPanelProps) {
  const {
    setSetting,
    clearSetting,
    getSettingValue,
    getSettingSource,
  } = useSettingsStore();

  const ids = { workspaceId, viewportId, projectId };

  return (
    <div className={cn("space-y-4", className)}>
      {sections.map((section) => (
        <Card key={section.id} className="p-4 space-y-4">
          <FieldSet className="gap-4">
            <FieldLegend className="flex items-center gap-[var(--control-gap)]">
              {sectionIcons?.[section.id] != null && (
                <span className="flex shrink-0 size-[var(--icon-size)] [&>svg]:size-[var(--icon-size)] text-muted-foreground">
                  {sectionIcons[section.id]}
                </span>
              )}
              {section.title}
            </FieldLegend>
            {section.description && (
              <p className="text-xs text-muted-foreground -mt-2">{section.description}</p>
            )}
            <FieldGroup className="gap-3">
              <ItemGroup className="gap-3">
                {section.fields.map((field, index) => {
                  const value = getSettingValue(field.key, ids);
                  const source = getSettingSource(field.key, ids);
                  const isOverride = source === scope;
                  const canReset = scope !== "app" && isOverride;
                  const inheritedLabel =
                    scope === "viewport"
                      ? source === "workspace"
                        ? "Inherited from workspace"
                        : source === "app"
                          ? "Inherited from app"
                          : source === "project"
                            ? "Inherited from project"
                            : null
                      : scope === "workspace"
                        ? source === "app"
                          ? "Inherited from app"
                          : source === "project"
                            ? "Inherited from project"
                            : null
                        : scope === "project"
                          ? source === "app"
                            ? "Inherited from app"
                            : null
                          : null;
                  const inputId = `${section.id}-${field.key}`;

                  const isToggle = field.type === "toggle";

                  return (
                    <React.Fragment key={field.key}>
                      <Item
                        variant="outline"
                        size="sm"
                        className={cn('bg-background/60', isToggle && 'py-1')}
                      >
                        <ItemContent className={cn(isToggle ? 'gap-1.5' : 'gap-3')}>
                          {isToggle ? (
                            <div
                              className="flex items-center justify-between gap-2 w-full cursor-pointer text-left rounded-md py-1"
                              onClick={() => setSetting(scope, field.key, !Boolean(value), ids)}
                            >
                              <div
                                className="space-y-0.5 min-w-0 min-h-0"
                                title={field.description ?? undefined}
                              >
                                <FieldLabel
                                  htmlFor={inputId}
                                  className="flex items-center gap-[var(--control-gap)] text-xs"
                                >
                                  {fieldIcons?.[field.key] != null && (
                                    <span className="flex shrink-0 size-[var(--icon-size)] [&>svg]:size-[var(--icon-size)] text-muted-foreground">
                                      {fieldIcons[field.key]}
                                    </span>
                                  )}
                                  <FieldTitle>{field.label}</FieldTitle>
                                </FieldLabel>
                              </div>
                              <div
                                className="flex items-center gap-[var(--control-gap)] shrink-0 min-w-[var(--control-height)]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ItemActions className="items-center">
                                  {inheritedLabel && <SourceBadge label={inheritedLabel} />}
                                  {isOverride && scope !== "app" && (
                                    <SourceBadge label="Override" tone="accent" />
                                  )}
                                  {canReset && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearSetting(scope, field.key, ids);
                                      }}
                                      className="flex items-center gap-[var(--control-gap)]"
                                    >
                                      <Undo2 className="size-[var(--icon-size)] shrink-0" />
                                      Reset
                                    </Button>
                                  )}
                                </ItemActions>
                                <div className="shrink-0 min-w-9 flex items-center justify-end">
                                  <Switch
                                    id={inputId}
                                    checked={Boolean(value)}
                                    onCheckedChange={(checked) => setSetting(scope, field.key, checked, ids)}
                                    className="scale-[0.85]"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Field orientation="vertical">
                              <div className="flex items-start justify-between gap-3">
                                <div
                                  className="space-y-1"
                                  title={field.description ?? undefined}
                                >
                                  <FieldLabel htmlFor={inputId} className="flex items-center gap-[var(--control-gap)]">
                                    {fieldIcons?.[field.key] != null && (
                                      <span className="flex shrink-0 size-[var(--icon-size)] [&>svg]:size-[var(--icon-size)] text-muted-foreground">
                                        {fieldIcons[field.key]}
                                      </span>
                                    )}
                                    <FieldTitle>{field.label}</FieldTitle>
                                  </FieldLabel>
                                </div>
                                <ItemActions className="items-start pt-1">
                                  {inheritedLabel && <SourceBadge label={inheritedLabel} />}
                                  {isOverride && scope !== "app" && (
                                    <SourceBadge label="Override" tone="accent" />
                                  )}
                                  {canReset && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => clearSetting(scope, field.key, ids)}
                                      className="flex items-center gap-[var(--control-gap)]"
                                    >
                                      <Undo2 className="size-[var(--icon-size)] shrink-0" />
                                      Reset
                                    </Button>
                                  )}
                                </ItemActions>
                              </div>
                              <FieldContent>
                                <FieldControl
                                  field={field}
                                  value={value}
                                  inputId={inputId}
                                  onChange={(next) => setSetting(scope, field.key, next, ids)}
                                />
                              </FieldContent>
                            </Field>
                          )}
                        </ItemContent>
                      </Item>
                      {index < section.fields.length - 1 && <ItemSeparator />}
                    </React.Fragment>
                  );
                })}
              </ItemGroup>
            </FieldGroup>
          </FieldSet>
        </Card>
      ))}
    </div>
  );
}
