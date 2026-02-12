import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function DashboardProductRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardListings);
}
