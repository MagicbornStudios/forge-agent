import type { NavItem } from '@/types';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export const navItems: NavItem[] = [
  {
    title: 'Catalog',
    url: PLATFORM_ROUTES.catalog,
    icon: 'dashboard',
    isActive: false,
    shortcut: ['c', 'a'],
    items: [],
  },
  {
    title: 'Creator',
    url: PLATFORM_ROUTES.dashboardOverview,
    icon: 'product',
    isActive: true,
    items: [
      { title: 'Overview', url: PLATFORM_ROUTES.dashboardOverview, shortcut: ['g', 'o'] },
      { title: 'Listings', url: PLATFORM_ROUTES.dashboardListings, shortcut: ['g', 'l'] },
      { title: 'Games', url: PLATFORM_ROUTES.dashboardGames, shortcut: ['g', 'm'] },
      { title: 'Revenue', url: PLATFORM_ROUTES.dashboardRevenue, shortcut: ['g', 'r'] },
    ],
  },
  {
    title: 'Account',
    url: PLATFORM_ROUTES.dashboardSettings,
    icon: 'account',
    isActive: true,
    items: [
      { title: 'Billing', url: PLATFORM_ROUTES.dashboardBilling, shortcut: ['a', 'b'] },
      { title: 'Licenses', url: PLATFORM_ROUTES.dashboardLicenses, shortcut: ['a', 'l'] },
      { title: 'Settings', url: PLATFORM_ROUTES.dashboardSettings, shortcut: ['a', 's'] },
      { title: 'API Keys', url: PLATFORM_ROUTES.dashboardApiKeys, shortcut: ['a', 'k'] },
    ],
  },
];
