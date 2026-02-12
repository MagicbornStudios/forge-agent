import { PlatformDashboardShell } from '@/components/platform/PlatformDashboardShell';
import { RequireDashboardAuth } from '@/components/auth/RequireDashboardAuth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlatformDashboardShell>
      <RequireDashboardAuth>{children}</RequireDashboardAuth>
    </PlatformDashboardShell>
  );
}
