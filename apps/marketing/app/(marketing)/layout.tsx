import { AuthProvider } from '@/components/providers/AuthProvider';
import { MarketingShell } from '@/components/organisms/MarketingShell';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <MarketingShell>{children}</MarketingShell>
    </AuthProvider>
  );
}
