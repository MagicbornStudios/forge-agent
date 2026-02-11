'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/overview': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Overview', link: '/dashboard/overview' },
  ],
  '/dashboard/listings': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Listings', link: '/dashboard/listings' },
  ],
  '/dashboard/games': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Games', link: '/dashboard/games' },
  ],
  '/dashboard/revenue': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Revenue', link: '/dashboard/revenue' },
  ],
  '/dashboard/billing': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Billing', link: '/dashboard/billing' },
  ],
  '/dashboard/licenses': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Licenses', link: '/dashboard/licenses' },
  ],
  '/dashboard/settings': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Settings', link: '/dashboard/settings' },
  ],
  '/dashboard/api-keys': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'API Keys', link: '/dashboard/api-keys' },
  ],
  '/catalog': [{ title: 'Catalog', link: '/catalog' }],
  // Add more custom mappings as needed
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
      return segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`;
        return {
          title: segment.charAt(0).toUpperCase() + segment.slice(1),
          link: path,
        };
      });
  }, [pathname]);

  return breadcrumbs;
}
