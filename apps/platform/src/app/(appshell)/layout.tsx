import { PlatformDashboardShell } from '@/components/platform/PlatformDashboardShell';

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformDashboardShell>{children}</PlatformDashboardShell>;
}
