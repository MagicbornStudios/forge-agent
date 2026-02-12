import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function CreatorCompatibilityRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardOverview);
}
