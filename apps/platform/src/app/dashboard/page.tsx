import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default async function Dashboard() {
  redirect(PLATFORM_ROUTES.dashboardOverview);
}
