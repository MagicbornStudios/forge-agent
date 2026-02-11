'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { submitNewsletter } from '@/lib/api/studio';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [optedIn, setOptedIn] = useState(true);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    <div className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col justify-center">
      <div className="space-y-6">
        <h1 className="text-center text-2xl font-semibold">Newsletter</h1>
        <p className="text-center text-muted-foreground">Subscribe for product updates and release notes.</p>
        {status === 'success' ? (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-center text-sm">
            <p className="font-medium text-foreground">Subscribed.</p>
            <p className="mt-1 text-muted-foreground">Check your inbox to confirm.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newsletter-email">Email</Label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="newsletter-opt-in"
                checked={optedIn}
                onCheckedChange={(value) => setOptedIn(value === true)}
              />
              <Label htmlFor="newsletter-opt-in" className="cursor-pointer text-sm font-normal">
                Send me product updates and news
              </Label>
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={status === 'loading'}>
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        )}
        <p className="text-center text-sm">
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
