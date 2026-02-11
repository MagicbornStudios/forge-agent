import { PlatformDashboardShell } from '@/components/platform/PlatformDashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformDashboardShell>{children}</PlatformDashboardShell>;
}
