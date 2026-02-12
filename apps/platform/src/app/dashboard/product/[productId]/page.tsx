import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function DashboardProductDetailRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardListings);
}
