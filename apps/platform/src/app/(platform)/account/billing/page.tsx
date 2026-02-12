import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function AccountBillingRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardBilling);
}
