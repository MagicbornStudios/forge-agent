'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@forge/ui';
import {
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LogIn,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { getStudioApiUrl } from '@/lib/api';

export function MarketingHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Forge
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/docs"
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${pathname?.startsWith('/docs') ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
          >
            <BookOpen className="mr-1.5 inline h-4 w-4" />
            Docs
          </Link>
          <Link
            href="/#pricing"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/account">
                <Button variant="ghost" size="sm">
                  <User className="mr-1.5 h-4 w-4" />
                  Account
                </Button>
              </Link>
              <Link href="/billing">
                <Button variant="ghost" size="sm">
                  <CreditCard className="mr-1.5 h-4 w-4" />
                  Billing
                </Button>
              </Link>
              <a href={getStudioApiUrl()} target="_blank" rel="noopener noreferrer">
                <Button size="sm">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Open app
                </Button>
              </a>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">
                <LogIn className="mr-1.5 h-4 w-4" />
                Log in
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
