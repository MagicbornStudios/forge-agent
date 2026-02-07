'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { FORGE_NODE_TYPE, type ForgeNodeType } from '@forge/types/graph';
import type { ModalComponentProps } from '@forge/shared';
import { EditorButton } from '@forge/shared';
import {
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@forge/ui';

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

type CreateNodeFormValues = {
  nodeType: ForgeNodeType;
  label: string;
  content: string;
  speaker: string;
};

export function CreateNodeModal({ route, onClose, onSubmit }: Props) {
  const payload = (route.payload ?? {}) as CreateNodeModalPayload;
  const form = useForm<CreateNodeFormValues>({
    defaultValues: {
      nodeType: payload.nodeType ?? FORGE_NODE_TYPE.CHARACTER,
      label: payload.label ?? '',
      content: payload.content ?? '',
      speaker: payload.speaker ?? '',
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      nodeType: values.nodeType,
      label: values.label.trim(),
      content: values.content.trim() || undefined,
      speaker: values.speaker.trim() || undefined,
    });
    onClose();
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="nodeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={(value) => field.onChange(value as ForgeNodeType)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose node type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(FORGE_NODE_TYPE).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="label"
          rules={{ required: 'Label is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input placeholder="Node label" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea className="min-h-[80px]" placeholder="Dialogue or text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="speaker"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Speaker</FormLabel>
              <FormControl>
                <Input placeholder="Speaker name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <EditorButton type="button" variant="outline" onClick={onClose}>
            Cancel
          </EditorButton>
          <EditorButton type="submit" disabled={!form.formState.isValid}>
            Create node
          </EditorButton>
        </div>
      </form>
    </Form>
  );
}

