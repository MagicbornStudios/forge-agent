'use client';

import { Switch } from '@forge/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { Checkbox } from '@forge/ui/checkbox';
import { SettingsSection } from './SettingsSection';
import { SettingsField } from './SettingsField';

const LAYOUT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'dagre', label: 'Dagre' },
  { value: 'breadthfirst', label: 'Breadth-first' },
];

const NODE_TYPE_OPTIONS = [
  { value: 'PAGE', label: 'Page (Act/Chapter/Page)' },
  { value: 'CHARACTER', label: 'Character' },
  { value: 'PLAYER', label: 'Player' },
  { value: 'CONDITIONAL', label: 'Conditional' },
  { value: 'characterCard', label: 'Character card' },
] as const;

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

export interface GraphViewportSettingsProps {
  /** Optional accent color for section card border (viewport context). */
  accentBorderColor?: string;
}

/**
 * Viewport-scoped settings form for graph viewports (Dialogue narrative/storylet, Character main).
 * Rendered in the settings sidebar under ViewportSettingsProvider when the Viewport tab is active.
 */
export function GraphViewportSettings({ accentBorderColor }: GraphViewportSettingsProps) {
  return (
    <div className="space-y-4">
      <SettingsSection
        sectionId="graph-viewport"
        title="Graph viewport"
        description="Minimap, animated edges, layout, and node restrictions for graph viewports."
        accentBorderColor={accentBorderColor}
      >
        <SettingsField
          fieldKey="graph.nodesDraggable"
          label="Nodes draggable"
          type="toggle"
          description="Allow moving nodes by drag."
          default={true}
        >
          <Switch />
        </SettingsField>
        <SettingsField
          fieldKey="graph.showMiniMap"
          label="Show minimap"
          type="toggle"
          description="Show the graph minimap in the viewport."
          default={true}
        >
          <Switch />
        </SettingsField>
        <SettingsField
          fieldKey="graph.animatedEdges"
          label="Animated edges"
          type="toggle"
          description="Animate edges in the graph."
          default={true}
        >
          <Switch />
        </SettingsField>
        <SettingsField
          fieldKey="graph.layoutAlgorithm"
          label="Layout algorithm"
          type="select"
          description="Auto-layout algorithm for the graph. None keeps manual positions."
          options={LAYOUT_OPTIONS}
          default="none"
        >
          {({ value, onChange }) => (
            <Select value={value == null ? '' : String(value)} onValueChange={(v) => onChange(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {LAYOUT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </SettingsField>
        <SettingsField
          fieldKey="graph.allowedNodeTypes"
          label="Allowed node types"
          type="text"
          description="Node types that can be added to this graph. Stored as array."
          default={['CHARACTER', 'PLAYER', 'CONDITIONAL']}
        >
          {({ value, onChange }) => {
            const selected = isStringArray(value) ? value : ['CHARACTER', 'PLAYER', 'CONDITIONAL'];
            const toggle = (t: string) => {
              const next = selected.includes(t)
                ? selected.filter((x) => x !== t)
                : [...selected, t];
              onChange(next);
            };
            return (
              <div className="flex flex-col gap-2">
                {NODE_TYPE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={selected.includes(opt.value)}
                      onCheckedChange={() => toggle(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            );
          }}
        </SettingsField>
      </SettingsSection>
    </div>
  );
}
