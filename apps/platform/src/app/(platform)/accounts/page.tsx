import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function AccountsCompatibilityRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardSettings);
}
