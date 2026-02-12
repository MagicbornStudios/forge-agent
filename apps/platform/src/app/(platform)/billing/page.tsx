import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function BillingRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardBilling);
}
