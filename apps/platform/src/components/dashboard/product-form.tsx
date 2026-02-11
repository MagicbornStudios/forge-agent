'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const filterSchema = z.object({
  query: z.string(),
  status: z.enum(['all', 'draft', 'published']),
  type: z.enum(['all', 'project', 'template', 'strategy-core']),
});

export type ProductFilterValues = z.infer<typeof filterSchema>;

export function ProductForm({
  initialValues,
  onSubmit,
}: {
  initialValues: ProductFilterValues;
  onSubmit: (values: ProductFilterValues) => void;
}) {
  const form = useForm<ProductFilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: initialValues,
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-3"
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          {...form.register('query')}
          placeholder="Search listings"
          className="pl-9"
        />
      </div>
      <select
        className="h-9 rounded-md border bg-background px-3 text-sm"
        {...form.register('status')}
      >
        <option value="all">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <div className="flex items-center gap-2">
        <select
          className="h-9 flex-1 rounded-md border bg-background px-3 text-sm"
          {...form.register('type')}
        >
          <option value="all">All types</option>
          <option value="project">Project</option>
          <option value="template">Template</option>
          <option value="strategy-core">Strategy core</option>
        </select>
        <Button type="submit" size="sm" variant="outline">
          Apply
        </Button>
      </div>
    </form>
  );
}
