'use client';

import React, { useCallback, useState } from 'react';
import { Button } from '@forge/ui/button';
import { Input } from '@forge/ui/input';
import { Textarea } from '@forge/ui/textarea';
import { Label } from '@forge/ui/label';

interface Props {
  onSubmit: (data: { name: string; description?: string; imageUrl?: string }) => void;
  onClose: () => void;
}

export function CreateCharacterModal({ onSubmit, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      setSubmitting(true);
      try {
        onSubmit({
          name: name.trim(),
          description: description.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [name, description, imageUrl, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="char-name">Name *</Label>
        <Input
          id="char-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Character name"
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="char-desc">Description</Label>
        <Textarea
          id="char-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="char-img">Image URL</Label>
        <Input
          id="char-img"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!name.trim() || submitting}>
          {submitting ? 'Creating...' : 'Create Character'}
        </Button>
      </div>
    </form>
  );
}
