'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@forge/ui';
import { Input } from '@forge/ui';
import { Label } from '@forge/ui';
import { Checkbox } from '@forge/ui';
import { submitNewsletter } from '@/lib/api';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [optedIn, setOptedIn] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus('loading');
    try {
      await submitNewsletter({ email: email.trim(), optedIn });
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-semibold">Newsletter</h1>
        <p className="text-center text-muted-foreground">
          Subscribe for product updates and tips.
        </p>
        {status === 'success' ? (
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-sm">
            <p className="font-medium text-foreground">Subscribed.</p>
            <p className="mt-1 text-muted-foreground">Check your inbox to confirm.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="optedIn"
                checked={optedIn}
                onCheckedChange={(v) => setOptedIn(v === true)}
              />
              <Label htmlFor="optedIn" className="text-sm font-normal cursor-pointer">
                Send me product updates and news
              </Label>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={status === 'loading'}>
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </Button>
          </form>
        )}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary underline hover:no-underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
