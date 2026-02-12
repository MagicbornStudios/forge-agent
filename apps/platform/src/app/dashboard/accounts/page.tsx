import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function DashboardAccountsCompatibilityRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardSettings);
}
