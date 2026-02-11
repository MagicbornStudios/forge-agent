'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitWaitlist } from '@/lib/api/studio';
import { trackEvent } from '@/lib/analytics';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus('loading');
    try {
      await submitWaitlist({ email: email.trim(), name: name.trim() || undefined });
      setStatus('success');
      setEmail('');
      setName('');
      trackEvent('Waitlist Signup');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col justify-center">
      <div className="space-y-6">
        <h1 className="text-center text-2xl font-semibold">Join the waitlist</h1>
        <p className="text-center text-muted-foreground">Get early access and product updates.</p>
        {status === 'success' ? (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-center text-sm">
            <p className="font-medium text-foreground">You are on the list.</p>
            <p className="mt-1 text-muted-foreground">We will be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="waitlist-email">Email</Label>
              <Input
                id="waitlist-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waitlist-name">Name (optional)</Label>
              <Input
                id="waitlist-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={status === 'loading'}>
              {status === 'loading' ? 'Submitting...' : 'Join waitlist'}
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
