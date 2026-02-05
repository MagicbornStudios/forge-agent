'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  CreditCard,
  LayoutDashboard,
  Newspaper,
  User,
} from 'lucide-react';
import { getStudioApiUrl } from '@/lib/api';

const navItems = [
  { href: '/account', label: 'Account', icon: User },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/docs', label: 'Docs', icon: BookOpen },
];

export function MarketingSidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/30">
      <nav className="flex flex-1 flex-col gap-1 p-4">
        <div className="mb-2 font-semibold text-foreground">App</div>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground ${
              pathname?.startsWith(href) ? 'bg-muted text-foreground' : 'text-muted-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <a
          href={getStudioApiUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          Open app
        </a>
      </nav>
      {userEmail && (
        <div className="border-t border-border p-4 text-xs text-muted-foreground">
          {userEmail}
        </div>
      )}
    </aside>
  );
}
