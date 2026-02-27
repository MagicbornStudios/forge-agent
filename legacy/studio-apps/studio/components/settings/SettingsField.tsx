'use client';

import * as React from 'react';
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from '@forge/ui/field';
import { Item, ItemActions, ItemContent } from '@forge/ui/item';
import { Button } from '@forge/ui/button';
import { Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsRegistration } from '@/lib/workspace-registry/SettingsRegistrationContext';
import { useSettingsStore } from '@/lib/settings/store';
import type { SettingsFieldType } from './types';

function scopeIds(
  scope: 'app' | 'project' | 'workspace' | 'viewport',
  scopeId: string | null
): { workspaceId?: string; viewportId?: string; projectId?: string } {
  if (scope === 'app' || !scopeId) return {};
  if (scope === 'viewport') {
    const [workspaceId, viewportId] = scopeId.split(':');
    return { workspaceId, viewportId };
  }
  if (scope === 'workspace') return { workspaceId: scopeId };
  if (scope === 'project') return { projectId: scopeId };
  return {};
}

function SourceBadge({
  label,
  tone = 'muted',
}: {
  label: string;
  tone?: 'muted' | 'accent';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        tone === 'accent' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
      )}
    >
      {label}
    </span>
  );
}

export interface SettingsFieldProps {
  /** Setting key (e.g. ai.agentName). Use fieldKey to avoid React's reserved key prop. */
  fieldKey: string;
  label: string;
  type: SettingsFieldType;
  description?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  /** Default value when no override is stored. Required for tree-as-source codegen. */
  default?: unknown;
  /** Optional icon for the field label. */
  icon?: React.ReactNode;
  /**
   * Control: either a single element (Input, Switch, Select, Textarea) that will receive value/onChange,
   * or a render function (field: { value, onChange }) => ReactNode.
   */
  children?: React.ReactNode | ((field: { value: unknown; onChange: (next: unknown) => void }) => React.ReactNode);
}

/**
 * FormField-like wrapper for one setting. Renders label, description, and control;
 * binds value/onChange to the settings store. Parent SettingsSection collects props for codegen.
 */
export function SettingsField({
  fieldKey,
  label,
  type,
  description,
  placeholder,
  options,
  default: defaultVal,
  icon,
  children,
}: SettingsFieldProps) {
  const { scope, scopeId } = useSettingsRegistration();
  const ids = React.useMemo(() => scopeIds(scope, scopeId), [scope, scopeId]);

  const setSetting = useSettingsStore((s) => s.setSetting);
  const clearSetting = useSettingsStore((s) => s.clearSetting);
  const value = useSettingsStore((s) => s.getSettingValue(fieldKey, ids));
  const source = useSettingsStore((s) => s.getSettingSource(fieldKey, ids));

  const isOverride = source === scope;
  const canReset = scope !== 'app' && isOverride;
  const inheritedLabel =
    scope === 'viewport'
      ? source === 'workspace'
        ? 'Inherited from workspace'
        : source === 'app'
          ? 'Inherited from app'
          : source === 'project'
            ? 'Inherited from project'
            : null
      : scope === 'workspace'
        ? source === 'app'
          ? 'Inherited from app'
          : source === 'project'
            ? 'Inherited from project'
            : null
        : scope === 'project'
          ? source === 'app'
            ? 'Inherited from app'
            : null
          : null;

  const inputId = React.useId();
  const onChange = React.useCallback(
    (next: unknown) => setSetting(scope, fieldKey, next, ids),
    [scope, fieldKey, setSetting, ids]
  );

  const isToggle = type === 'toggle';

  const displayValue = value == null ? '' : (type === 'number' ? String(value) : String(value));

  const control =
    typeof children === 'function'
      ? children({ value, onChange })
      : React.Children.count(children) === 1 && React.isValidElement(React.Children.only(children))
        ? (() => {
            const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
            if (type === 'toggle') {
              return React.cloneElement(child, {
                checked: Boolean(value),
                onCheckedChange: onChange,
                id: inputId,
                className: cn(
                  (child.props as { className?: string }).className,
                  'scale-[0.85]'
                ),
              } as Record<string, unknown>);
            }
            if (type === 'select') {
              return React.cloneElement(child, {
                value: value == null ? '' : String(value),
                onValueChange: onChange,
              } as Record<string, unknown>);
            }
            return React.cloneElement(child, {
              value: displayValue,
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value),
              id: inputId,
              placeholder,
            } as Record<string, unknown>);
          })()
        : null;

  return (
    <Item
      variant="outline"
      size="sm"
      className={cn('bg-background/60', isToggle && 'py-1')}
    >
      <ItemContent className={cn(isToggle ? 'gap-1.5' : 'gap-3')}>
        {isToggle ? (
          <div
            className="flex flex-col items-stretch gap-1.5 w-full cursor-pointer text-left rounded-md py-1"
            onClick={() => onChange(!Boolean(value))}
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <div
                className="space-y-0.5 min-w-0 min-h-0"
                title={description ?? undefined}
              >
                <FieldLabel
                  htmlFor={inputId}
                  className="flex items-center gap-[var(--control-gap)] text-xs"
                >
                  {icon != null && (
                    <span className="flex shrink-0 size-[var(--icon-size)] [&>svg]:size-[var(--icon-size)] text-muted-foreground">
                      {icon}
                    </span>
                  )}
                  <FieldTitle className="text-xs">{label}</FieldTitle>
                </FieldLabel>
              </div>
              <div
                className="flex items-center gap-[var(--control-gap)] shrink-0 min-w-[var(--control-height)]"
                onClick={(e) => e.stopPropagation()}
              >
                <ItemActions className="items-center">
                  {inheritedLabel && <SourceBadge label={inheritedLabel} />}
                  {isOverride && scope !== 'app' && <SourceBadge label="Override" tone="accent" />}
                  {canReset && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSetting(scope, fieldKey, ids);
                      }}
                      className="flex items-center gap-[var(--control-gap)]"
                    >
                      <Undo2 className="size-[var(--icon-size)] shrink-0" />
                      Reset
                    </Button>
                  )}
                </ItemActions>
                {control}
              </div>
            </div>
          </div>
        ) : (
          <Field orientation="vertical">
            <div className="flex items-start justify-between gap-3">
              <div
                className="space-y-1"
                title={description ?? undefined}
              >
                <FieldLabel htmlFor={inputId} className="flex items-center gap-[var(--control-gap)]">
                  {icon != null && (
                    <span className="flex shrink-0 size-[var(--icon-size)] [&>svg]:size-[var(--icon-size)] text-muted-foreground">
                      {icon}
                    </span>
                  )}
                  <FieldTitle>{label}</FieldTitle>
                </FieldLabel>
              </div>
              <ItemActions className="items-start pt-1">
                {inheritedLabel && <SourceBadge label={inheritedLabel} />}
                {isOverride && scope !== 'app' && <SourceBadge label="Override" tone="accent" />}
                {canReset && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSetting(scope, fieldKey, ids)}
                    className="flex items-center gap-[var(--control-gap)]"
                  >
                    <Undo2 className="size-[var(--icon-size)] shrink-0" />
                    Reset
                  </Button>
                )}
              </ItemActions>
            </div>
            <FieldContent>{control}</FieldContent>
          </Field>
        )}
      </ItemContent>
    </Item>
  );
}
