import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function AccountSettingsRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardSettings);
}
