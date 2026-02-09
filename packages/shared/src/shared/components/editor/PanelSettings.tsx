'use client';

import * as React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@forge/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@forge/ui/popover';
import { cn } from '@forge/shared/lib/utils';

export interface PanelSettingDef {
  /** Unique setting key. */
  id: string;
  /** Display label. */
  label: string;
  /** Setting type — determines the control rendered. */
  type: 'toggle' | 'select' | 'custom';
  /** Current value. */
  value: unknown;
  /** Called when the value changes. */
  onChange: (value: unknown) => void;
  /** Options for 'select' type. */
  options?: { label: string; value: string }[];
  /** Custom render function for 'custom' type. */
  render?: () => React.ReactNode;
  /** Optional description. */
  description?: string;
}

export interface PanelSettingsProps {
  /** Settings to display. */
  settings: PanelSettingDef[];
  /** Panel identifier (for aria labels). */
  panelId: string;
  className?: string;
}

/**
 * PanelSettings — a popover for per-panel settings.
 *
 * Designed to be placed in a `DockPanel`'s `headerActions` slot.
 * Renders a gear icon button that opens a popover with panel-specific
 * settings (e.g. show minimap, auto-layout, lock editor).
 *
 * @example
 * ```tsx
 * <DockPanel
 *   panelId="graph-editor"
 *   title="Graph"
 *   headerActions={
 *     <PanelSettings
 *       panelId="graph-editor"
 *       settings={[
 *         {
 *           id: 'show-minimap',
 *           label: 'Show Minimap',
 *           type: 'toggle',
 *           value: showMiniMap,
 *           onChange: (v) => setShowMiniMap(v as boolean),
 *         },
 *         {
 *           id: 'auto-layout',
 *           label: 'Auto Layout',
 *           type: 'select',
 *           value: layoutAlgorithm,
 *           options: [
 *             { label: 'Dagre', value: 'dagre' },
 *             { label: 'Force', value: 'force' },
 *           ],
 *           onChange: (v) => setLayoutAlgorithm(v as string),
 *         },
 *       ]}
 *     />
 *   }
 * >
 *   ...
 * </DockPanel>
 * ```
 */
export function PanelSettings({ settings, panelId, className }: PanelSettingsProps) {
  if (settings.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-6 w-6', className)}
          aria-label={`Settings for ${panelId}`}
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-[var(--panel-padding)]" sideOffset={4}>
        <div className="space-y-1">
          {settings.map((setting) => (
            <PanelSettingRow key={setting.id} setting={setting} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PanelSettingRow({ setting }: { setting: PanelSettingDef }) {
  switch (setting.type) {
    case 'toggle':
      return (
        <label className="flex items-center justify-between gap-[var(--control-gap)] rounded px-[var(--control-padding-x)] py-[var(--control-padding-y)] hover:bg-muted cursor-pointer">
          <div className="min-w-0">
            <span className="text-xs font-medium">{setting.label}</span>
            {setting.description && (
              <p className="text-[10px] text-muted-foreground">{setting.description}</p>
            )}
          </div>
          <input
            type="checkbox"
            checked={!!setting.value}
            onChange={(e) => setting.onChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-border shrink-0"
          />
        </label>
      );

    case 'select':
      return (
        <div className="px-2 py-1.5">
          <span className="text-xs font-medium">{setting.label}</span>
          {setting.description && (
            <p className="text-[10px] text-muted-foreground mb-1">{setting.description}</p>
          )}
          <select
            value={String(setting.value ?? '')}
            onChange={(e) => setting.onChange(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs"
          >
            {setting.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'custom':
      return (
        <div className="px-[var(--control-padding-x)] py-[var(--control-padding-y)]">
          <span className="text-xs font-medium">{setting.label}</span>
          {setting.description && (
            <p className="text-[10px] text-muted-foreground mb-1">{setting.description}</p>
          )}
          {setting.render?.()}
        </div>
      );

    default:
      return null;
  }
}
