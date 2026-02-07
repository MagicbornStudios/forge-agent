"use client";

import * as React from "react";
import { Card } from "@forge/ui/card";
import { Input } from "@forge/ui/input";
import { Textarea } from "@forge/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
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
import { cn } from "@/lib/utils";
import { useSettingsStore, type SettingsScope } from "@/lib/settings/store";
import type { SettingsSection, SettingsField } from "./types";

export interface SettingsPanelProps {
  scope: SettingsScope;
  sections: SettingsSection[];
  editorId?: string;
  viewportId?: string;
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
        <div className="flex items-center gap-2">
          <Switch
            id={inputId}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <span className="text-xs text-muted-foreground">{Boolean(value) ? "On" : "Off"}</span>
        </div>
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
  editorId,
  viewportId,
  className,
}: SettingsPanelProps) {
  const {
    setSetting,
    clearSetting,
    getSettingValue,
    getSettingSource,
  } = useSettingsStore();

  return (
    <div className={cn("space-y-4", className)}>
      {sections.map((section) => (
        <Card key={section.id} className="p-4 space-y-4">
          <FieldSet className="gap-4">
            <FieldLegend>{section.title}</FieldLegend>
            {section.description && (
              <p className="text-xs text-muted-foreground -mt-2">{section.description}</p>
            )}
            <FieldGroup className="gap-3">
              <ItemGroup className="gap-3">
                {section.fields.map((field, index) => {
                  const ids = { editorId, viewportId };
                  const value = getSettingValue(field.key, ids);
                  const source = getSettingSource(field.key, ids);
                  const isOverride = source === scope;
                  const canReset = scope !== "app" && isOverride;
                  const inheritedLabel =
                    scope === "viewport"
                      ? source === "editor"
                        ? "Inherited from editor"
                        : source === "app"
                          ? "Inherited from app"
                          : null
                      : scope === "editor"
                        ? source === "app"
                          ? "Inherited from app"
                          : null
                        : null;
                  const inputId = `${section.id}-${field.key}`;

                  return (
                    <React.Fragment key={field.key}>
                      <Item variant="outline" size="sm" className="bg-background/60">
                        <ItemContent className="gap-3">
                          <Field orientation="vertical">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <FieldLabel htmlFor={inputId}>
                                  <FieldTitle>{field.label}</FieldTitle>
                                </FieldLabel>
                                {field.description && (
                                  <FieldDescription>{field.description}</FieldDescription>
                                )}
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
                                  >
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
