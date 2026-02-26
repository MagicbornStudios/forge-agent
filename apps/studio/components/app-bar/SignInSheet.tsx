'use client';

import React, { useState } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { login } from '@/lib/api-client/auth';
import { authKeys } from '@/lib/data/keys';

export interface SignInSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInSheet({ open, onOpenChange }: SignInSheetProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
      onOpenChange(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-sm flex-col gap-[var(--control-gap)] overflow-y-auto p-[var(--panel-padding)] sm:max-w-sm"
      >
        <SheetHeader>
          <SheetTitle>Sign in</SheetTitle>
          <SheetDescription>Sign in to your Studio account.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-[var(--control-gap)]">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full"
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
