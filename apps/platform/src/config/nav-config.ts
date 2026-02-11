import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Catalog',
    url: '/catalog',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['c', 'a'],
    items: [],
  },
  {
    title: 'Creator',
    url: '#',
    icon: 'product',
    isActive: true,
    items: [
      { title: 'Overview', url: '/dashboard/overview', shortcut: ['g', 'o'] },
      { title: 'Listings', url: '/dashboard/listings', shortcut: ['g', 'l'] },
      { title: 'Games', url: '/dashboard/games', shortcut: ['g', 'm'] },
      { title: 'Revenue', url: '/dashboard/revenue', shortcut: ['g', 'r'] },
    ],
  },
  {
    title: 'Account',
    url: '#',
    icon: 'account',
    isActive: true,
    items: [
      { title: 'Billing', url: '/dashboard/billing', shortcut: ['a', 'b'] },
      { title: 'Licenses', url: '/dashboard/licenses', shortcut: ['a', 'l'] },
      { title: 'Settings', url: '/dashboard/settings', shortcut: ['a', 's'] },
      { title: 'API Keys', url: '/dashboard/api-keys', shortcut: ['a', 'k'] },
    ],
  },
];
