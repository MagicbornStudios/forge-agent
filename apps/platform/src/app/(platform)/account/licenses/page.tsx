import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function AccountLicensesRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardLicenses);
}
