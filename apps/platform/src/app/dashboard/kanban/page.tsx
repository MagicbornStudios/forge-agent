import { redirect } from 'next/navigation';
import { PLATFORM_ROUTES } from '@/lib/constants/routes';

export default function DashboardKanbanRedirectPage() {
  redirect(PLATFORM_ROUTES.dashboardOverview);
}
