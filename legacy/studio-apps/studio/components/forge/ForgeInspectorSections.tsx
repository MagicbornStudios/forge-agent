'use client';

import * as React from 'react';
import type { InspectorSection } from '@forge/shared';
import { isEntity } from '@forge/shared';
import type { ForgeGraphDoc, ForgeGraphPatchOp } from '@forge/types/graph';
import type { PageType } from '@forge/types/graph';
import { Input } from '@forge/ui/input';
import { Textarea } from '@forge/ui/textarea';
import { Label } from '@forge/ui/label';
import { Badge } from '@forge/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@forge/ui/select';

export interface DialogueInspectorSectionsParams {
  graph: ForgeGraphDoc | null;
  applyOperations: (ops: ForgeGraphPatchOp[]) => void;
}

export function dialogueInspectorSections({
  graph,
  applyOperations,
}: DialogueInspectorSectionsParams): InspectorSection[] {
  return [
    {
      id: 'forge-node',
      title: 'Node',
      when: (s) => (s ? isEntity(s) && s.entityType === 'forge.node' : false),
      render: ({ selection }) => {
        if (!graph || !selection || !isEntity(selection) || selection.entityType !== 'forge.node') return null;
        const node = graph.flow.nodes.find((n) => n.id === selection.id);
        if (!node) return <p className="text-sm text-muted-foreground">Node not found</p>;
        return (
          <NodeFields
            data={node.data}
            onUpdate={(updates) => applyOperations([{ type: 'updateNode', nodeId: node.id, updates }])}
          />
        );
      },
    },
    {
      id: 'forge-edge',
      title: 'Edge',
      when: (s) => (s ? isEntity(s) && s.entityType === 'forge.edge' : false),
      render: ({ selection }) => {
        if (!graph || !selection || !isEntity(selection) || selection.entityType !== 'forge.edge') return null;
        const edge = graph.flow.edges.find((e) => e.id === selection.id);
        if (!edge) return <p className="text-sm text-muted-foreground">Edge not found</p>;
        return (
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Source:</span> {edge.source}</p>
            <p><span className="font-medium">Target:</span> {edge.target}</p>
          </div>
        );
      },
    },
  ];
}

const PAGE_TYPE_OPTIONS: { value: PageType; label: string }[] = [
  { value: 'ACT', label: 'Act' },
  { value: 'CHAPTER', label: 'Chapter' },
  { value: 'PAGE', label: 'Page' },
];

function NodeFields({
  data,
  onUpdate,
}: {
  data: { type?: string; label?: string; content?: string; speaker?: string; pageType?: PageType };
  onUpdate: (updates: Record<string, unknown>) => void;
}) {
  const fieldId = React.useId();
  const [label, setLabel] = React.useState(data.label ?? '');
  const [content, setContent] = React.useState(data.content ?? '');
  const [speaker, setSpeaker] = React.useState(data.speaker ?? '');

  React.useEffect(() => {
    setLabel(data.label ?? '');
    setContent(data.content ?? '');
    setSpeaker(data.speaker ?? '');
  }, [data.label, data.content, data.speaker]);

  const handleBlur = () => {
    onUpdate({ label: label || undefined, content: content || undefined, speaker: speaker || undefined });
  };

  const labelId = `${fieldId}-label`;
  const contentId = `${fieldId}-content`;
  const speakerId = `${fieldId}-speaker`;
  const isPageNode = data.type === 'PAGE';

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs font-medium text-muted-foreground">Type</Label>
        <div className="mt-1">
          <Badge variant="outline" className="text-xs">
            {data.type ?? 'Unknown'}
          </Badge>
        </div>
      </div>
      {isPageNode && (
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Page type</Label>
          <Select
            value={(data.pageType ?? 'PAGE') as string}
            onValueChange={(v) => onUpdate({ pageType: v as PageType })}
          >
            <SelectTrigger className="h-8 text-sm mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor={labelId} className="text-xs font-medium text-muted-foreground">Label</Label>
        <Input
          id={labelId}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          className="h-8 w-full text-sm"
        />
      </div>
      <div>
        <Label htmlFor={contentId} className="text-xs font-medium text-muted-foreground">Content</Label>
        <Textarea
          id={contentId}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          className="w-full min-h-[60px] text-sm"
        />
      </div>
      <div>
        <Label htmlFor={speakerId} className="text-xs font-medium text-muted-foreground">Speaker</Label>
        <Input
          id={speakerId}
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          onBlur={handleBlur}
          className="h-8 w-full text-sm"
        />
      </div>
    </div>
  );
}

