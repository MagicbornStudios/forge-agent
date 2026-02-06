'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@forge/ui/navigation-menu';
import { Button } from '@forge/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@forge/ui/sheet';
import {
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LogIn,
  Menu,
  User,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStudioApiUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/docs', label: 'Docs', icon: BookOpen },
  { href: '/#pricing', label: 'Pricing' },
] as const;

export function MarketingHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-90"
        >
          Forge
        </Link>

        {/* Desktop nav */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname?.startsWith(href)
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {Icon ? <Icon className="mr-1.5 h-4 w-4 transition-transform hover:scale-110" /> : null}
                    {label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/account" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="h-4 w-4 transition-transform hover:scale-110" />
                  Account
                </Button>
              </Link>
              <Link href="/billing" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <CreditCard className="h-4 w-4 transition-transform hover:scale-110" />
                  Billing
                </Button>
              </Link>
              <a href={getStudioApiUrl()} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-1.5 transition-transform hover:scale-105">
                  <LayoutDashboard className="h-4 w-4" />
                  Open app
                </Button>
              </a>
            </>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button size="sm" className="gap-1.5 transition-transform hover:scale-105">
                <LogIn className="h-4 w-4" />
                Log in
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-2 pt-6">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      pathname?.startsWith(href)
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    {label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <User className="h-4 w-4" />
                      Account
                    </Link>
                    <Link
                      href="/billing"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <CreditCard className="h-4 w-4" />
                      Billing
                    </Link>
                    <a
                      href={getStudioApiUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button size="sm" className="w-full justify-start gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Open app
                      </Button>
                    </a>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full justify-start gap-2">
                      <LogIn className="h-4 w-4" />
                      Log in
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
