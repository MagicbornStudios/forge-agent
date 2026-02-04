'use client';

import * as React from 'react';
import { FORGE_NODE_TYPE, type ForgeNodeType } from '@forge/types/graph';
import type { ModalComponentProps } from '@forge/shared/workspace';
import { WorkspaceButton } from '@forge/shared/components/workspace';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface CreateNodeModalPayload {
  nodeType?: ForgeNodeType;
  label?: string;
  content?: string;
  speaker?: string;
}

type Props = ModalComponentProps<CreateNodeModalPayload> & {
  onSubmit: (data: {
    nodeType: ForgeNodeType;
    label: string;
    content?: string;
    speaker?: string;
  }) => void;
};

export function CreateNodeModal({ route, onClose, onSubmit }: Props) {
  const payload = (route.payload ?? {}) as CreateNodeModalPayload;
  const typeId = React.useId();
  const labelId = React.useId();
  const contentId = React.useId();
  const speakerId = React.useId();
  const [nodeType, setNodeType] = React.useState<ForgeNodeType>(
    payload.nodeType ?? FORGE_NODE_TYPE.CHARACTER
  );
  const [label, setLabel] = React.useState(payload.label ?? '');
  const [content, setContent] = React.useState(payload.content ?? '');
  const [speaker, setSpeaker] = React.useState(payload.speaker ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSubmit({
      nodeType,
      label: label.trim(),
      content: content.trim() || undefined,
      speaker: speaker.trim() || undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor={typeId} className="text-sm font-medium mb-1 block">
          Type
        </Label>
        <Select value={nodeType} onValueChange={(value) => setNodeType(value as ForgeNodeType)}>
          <SelectTrigger id={typeId}>
            <SelectValue placeholder="Choose node type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(FORGE_NODE_TYPE).map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={labelId} className="text-sm font-medium mb-1 block">
          Label
        </Label>
        <Input
          id={labelId}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Node label"
          required
        />
      </div>
      <div>
        <Label htmlFor={contentId} className="text-sm font-medium mb-1 block">
          Content
        </Label>
        <Textarea
          id={contentId}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px]"
          placeholder="Dialogue or text"
        />
      </div>
      <div>
        <Label htmlFor={speakerId} className="text-sm font-medium mb-1 block">
          Speaker
        </Label>
        <Input
          id={speakerId}
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          placeholder="Speaker name"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <WorkspaceButton type="button" variant="outline" onClick={onClose}>
          Cancel
        </WorkspaceButton>
        <WorkspaceButton type="submit" disabled={!label.trim()}>
          Create node
        </WorkspaceButton>
      </div>
    </form>
  );
}

