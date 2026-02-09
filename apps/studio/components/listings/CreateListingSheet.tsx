'use client';

import React, { useCallback, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@forge/ui/sheet';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { Label } from '@forge/ui/label';
import { Textarea } from '@forge/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@forge/ui/select';
import { useMe } from '@/lib/data/hooks/use-me';
import { useProjects } from '@/lib/data/hooks/use-projects';
import { useCreateListing, type CreateListingInput } from '@/lib/data/hooks/use-listings';
import { useAppShellStore } from '@/lib/app-shell/store';
import { useEntitlements, CAPABILITIES } from '@forge/shared/entitlements';

function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'listing';
}

export interface CreateListingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListingSheet({ open, onOpenChange }: CreateListingSheetProps) {
  const { data: meData } = useMe();
  const user = meData?.user ?? null;
  const { data: projects = [] } = useProjects();
  const activeProjectId = useAppShellStore((s) => s.activeProjectId);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<CreateListingInput['listingType']>('project');
  const [projectId, setProjectId] = useState<string>(activeProjectId ? String(activeProjectId) : '');
  const [price, setPrice] = useState('');
  const [currency] = useState('USD');
  const [category, setCategory] = useState<CreateListingInput['category']>(null);
  const [status, setStatus] = useState<CreateListingInput['status']>('draft');
  const [cloneMode, setCloneMode] = useState<CreateListingInput['cloneMode']>('indefinite');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateListing();

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    setSlug((prev) => {
      const derived = slugFromTitle(newTitle);
      if (!prev || prev === derived) return derived;
      const fromPrevTitle = slugFromTitle(title);
      return prev === fromPrevTitle ? derived : prev;
    });
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || typeof user.id !== 'number') return;
    setError(null);
    const priceNum = Math.round(parseFloat(price || '0') * 100);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Enter a valid price (e.g. 9.99 for $9.99).');
      return;
    }
    const slugTrim = slug.trim() || slugFromTitle(title);
    if (!slugTrim) {
      setError('Slug is required.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const effectiveStatus = canPublish ? status : 'draft';
    const effectivePrice = canMonetize ? priceNum : 0;
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        slug: slugTrim,
        description: description.trim() || undefined,
        listingType,
        project: projectId ? Number(projectId) : null,
        price: effectivePrice,
        currency,
        creator: user.id,
        category: category ?? undefined,
        status: effectiveStatus,
        cloneMode,
      });
      onOpenChange(false);
      setTitle('');
      setSlug('');
      setDescription('');
      setListingType('project');
      setProjectId(activeProjectId ? String(activeProjectId) : '');
      setPrice('');
      setCategory(null);
      setStatus('draft');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create listing.';
      setError(msg);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle>Create listing</SheetTitle>
          <SheetDescription>
            List a project, template, or strategy core in the catalog. Only published listings appear on the marketing site.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 flex-1">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="listing-title">Title *</Label>
            <Input
              id="listing-title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="My awesome project"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listing-slug">URL slug *</Label>
            <Input
              id="listing-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={title ? slugFromTitle(title) : 'my-awesome-project'}
              className="text-sm font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listing-description">Description</Label>
            <Textarea
              id="listing-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for the catalog card..."
              className="min-h-[80px] text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={listingType}
              onValueChange={(v) => setListingType(v as CreateListingInput['listingType'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="template">Template</SelectItem>
                <SelectItem value="strategy-core">Strategy core</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Project (optional)</Label>
            <Select value={projectId || 'none'} onValueChange={(v) => setProjectId(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="listing-price">Price (USD) * {!canMonetize && '(Pro to set price)'}</Label>
            <Input
              id="listing-price"
              type="number"
              min="0"
              step="0.01"
              value={canMonetize ? price : '0'}
              onChange={(e) => (canMonetize ? setPrice(e.target.value) : setPrice('0'))}
              placeholder="0 for free"
              className="text-sm"
              disabled={!canMonetize}
              aria-disabled={!canMonetize}
            />
            <p className="text-xs text-muted-foreground">
              {canMonetize
                ? 'Enter amount in dollars (e.g. 9.99). Stored in cents.'
                : 'Upgrade to Pro to set a price for paid listings.'}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category ?? 'none'}
              onValueChange={(v) => setCategory(v === 'none' ? null : (v as CreateListingInput['category']))}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="narrative">Narrative</SelectItem>
                <SelectItem value="character">Character</SelectItem>
                <SelectItem value="template">Template</SelectItem>
                <SelectItem value="strategy">Strategy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status *</Label>
            <Select
              value={canPublish ? status : 'draft'}
              onValueChange={(v) => setStatus(canPublish ? (v as CreateListingInput['status']) : 'draft')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published" disabled={!canPublish}>
                  Published {!canPublish && '(Pro)'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Clone again</Label>
            <Select value={cloneMode} onValueChange={(v) => setCloneMode(v as CreateListingInput['cloneMode'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indefinite">Indefinite (always current)</SelectItem>
                <SelectItem value="version-only">That version only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Indefinite: buyer gets current project on clone again. Version only: buyer gets the snapshot at purchase.</p>
          </div>
          <div className="flex gap-2 pt-4 mt-auto">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !title.trim()} className="flex-1">
              {createMutation.isPending ? 'Creating…' : 'Create listing'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
