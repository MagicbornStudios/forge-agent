'use client';

import * as React from 'react';
import { Card } from '@forge/ui/card';
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@forge/ui/field';
import { ItemGroup, ItemSeparator } from '@forge/ui/item';
import { useSettingsRegistration } from '@/lib/editor-registry/SettingsRegistrationContext';
import { useSettingsRegistryStore } from '@/lib/editor-registry/settings-registry';
import { SETTINGS_SCOPE_COLORS } from '@/lib/app-shell/editor-metadata';
import type { SettingsSection as SettingsSectionType, SettingsField as SettingsFieldType } from './types';
import { SettingsField } from './SettingsField';

export interface SettingsSectionProps {
  sectionId: string;
  title: string;
  description?: string;
  /** Optional icon (React node) for the section header. */
  icon?: React.ReactNode;
  /** Optional left border color (e.g. viewport context accent). */
  accentBorderColor?: string;
  children?: React.ReactNode;
}

function isSettingsFieldChild(
  child: React.ReactNode
): child is React.ReactElement<SettingsFieldType & { fieldKey: string }> {
  return React.isValidElement(child) && child.type === SettingsField;
}

function collectFields(children: React.ReactNode): SettingsSectionType['fields'] {
  const fields: SettingsSectionType['fields'] = [];
  React.Children.forEach(children, (child) => {
    if (isSettingsFieldChild(child)) {
      const { fieldKey, label, type, description, placeholder, options, default: defaultVal } = child.props;
      fields.push({ key: fieldKey, label, type, description, placeholder, options, default: defaultVal });
    }
  });
  return fields;
}

/**
 * Section layout and registration. Renders a Card with title/description and
 * children (SettingsField components). Also registers section metadata with
 * the settings registry for codegen.
 */
export function SettingsSection({
  sectionId,
  title,
  description,
  icon,
  accentBorderColor,
  children,
}: SettingsSectionProps) {
  const { scope, scopeId } = useSettingsRegistration();
  const registerSection = useSettingsRegistryStore((s) => s.registerSection);
  const unregisterSection = useSettingsRegistryStore((s) => s.unregisterSection);

  const section = React.useMemo(
    () => ({
      id: sectionId,
      title,
      description,
      fields: collectFields(children),
    }),
    [sectionId, title, description, children],
  );

  React.useEffect(() => {
    registerSection(scope, scopeId, section);
    return () => unregisterSection(scope, scopeId, sectionId);
  }, [scope, scopeId, section, sectionId, registerSection, unregisterSection]);

  const scopeLabel =
    scope === 'app'
      ? 'App'
      : scope === 'project'
        ? 'Project'
        : scope === 'editor'
          ? 'Editor'
          : scope === 'viewport'
            ? 'Viewport'
            : scope;
  const scopeColor =
    scope in SETTINGS_SCOPE_COLORS
      ? SETTINGS_SCOPE_COLORS[scope as keyof typeof SETTINGS_SCOPE_COLORS]
      : undefined;
  const borderColor = accentBorderColor ?? scopeColor;

  const childArray = React.Children.toArray(children);

  return (
    <Card
      className="p-4 space-y-4"
      style={
        borderColor
          ? { borderLeftWidth: 3, borderLeftStyle: 'solid', borderLeftColor: borderColor }
          : undefined
      }
    >
      <FieldSet className="gap-4">
        <FieldLegend className="flex items-center gap-[var(--control-gap)]">
          {icon != null && (
            <span className="flex shrink-0 size-[var(--icon-size)] [&>svg]:size-[var(--icon-size)] text-muted-foreground">
              {icon}
            </span>
          )}
          {title} - {scopeLabel}
        </FieldLegend>
        {description != null && description !== '' && (
          <p className="text-xs text-muted-foreground -mt-2">{description}</p>
        )}
        <FieldGroup className="gap-3">
          <ItemGroup className="gap-3">
            {childArray.map((child, index) => {
              const key = isSettingsFieldChild(child) ? child.props.fieldKey : index;
              return (
                <React.Fragment key={key}>
                  {child}
                  {index < childArray.length - 1 && <ItemSeparator />}
                </React.Fragment>
              );
            })}
          </ItemGroup>
        </FieldGroup>
      </FieldSet>
    </Card>
  );
}
