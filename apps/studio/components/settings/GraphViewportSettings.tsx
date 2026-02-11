'use client';

import { Switch } from '@forge/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';
import { SettingsSection } from './SettingsSection';
import { SettingsField } from './SettingsField';

const LAYOUT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'dagre', label: 'Dagre' },
  { value: 'breadthfirst', label: 'Breadth-first' },
];

/**
 * Viewport-scoped settings form for graph viewports (Dialogue narrative/storylet, Character main).
 * Rendered in the settings sidebar under ViewportSettingsProvider when the Viewport tab is active.
 */
export function GraphViewportSettings() {
  return (
    <div className="space-y-4">
      <SettingsSection
        sectionId="graph-viewport"
        title="Graph viewport"
        description="Minimap, animated edges, and layout for graph viewports."
      >
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
      </SettingsSection>
    </div>
  );
}
