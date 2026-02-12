export const PLATFORM_ROUTES = {
  home: '/',
  login: '/login',
  docs: '/docs',
  catalog: '/catalog',
  pricing: '/pricing',
  creatorCompatibility: '/creator',
  accountsCompatibility: '/accounts',
  dashboard: '/dashboard',
  dashboardCreatorCompatibility: '/dashboard/creator',
  dashboardAccountCompatibility: '/dashboard/account',
  dashboardAccountsCompatibility: '/dashboard/accounts',
  dashboardOverview: '/dashboard/overview',
  dashboardListings: '/dashboard/listings',
  dashboardGames: '/dashboard/games',
  dashboardRevenue: '/dashboard/revenue',
  dashboardBilling: '/dashboard/billing',
  dashboardLicenses: '/dashboard/licenses',
  dashboardSettings: '/dashboard/settings',
  dashboardApiKeys: '/dashboard/api-keys',
  billingCompatibility: '/billing',
  accountCompatibility: '/account',
} as const;

export const ROUTE_QUERY_KEYS = {
  returnUrl: 'returnUrl',
} as const;

export function buildLoginReturnUrl(returnUrl: string): string {
  const encoded = encodeURIComponent(returnUrl);
  return `${PLATFORM_ROUTES.login}?${ROUTE_QUERY_KEYS.returnUrl}=${encoded}`;
}
