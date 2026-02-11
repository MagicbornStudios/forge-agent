'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, CreditCard, LayoutDashboard, LogIn, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { getStudioApiUrl } from '@/lib/api/studio';

const navLinks = [
  { href: '/docs', label: 'Docs', icon: BookOpen },
  { href: '/catalog', label: 'Catalog', icon: LayoutDashboard },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
] as const;

export function PlatformHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1360px] items-center justify-between gap-4 px-4">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Forge Platform
        </Link>
        <nav className="hidden min-w-0 items-center gap-1 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                pathname?.startsWith(href)
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard/overview">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="size-4" />
                  Dashboard
                </Button>
              </Link>
              <a href={getStudioApiUrl()} target="_blank" rel="noreferrer">
                <Button size="sm">Open Studio</Button>
              </a>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-1.5">
                <LogIn className="size-4" />
                Log in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
