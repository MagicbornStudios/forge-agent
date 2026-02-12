import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function AccountApiKeysRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardApiKeys);
}
